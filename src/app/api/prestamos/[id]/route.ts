import { z } from "zod";
import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool, sql } from "@/server/sql";

export const runtime = "nodejs";

interface CabeceraRow {
  idPrestamo: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
  motivo: string;
  cuadrillaOrigen: string;
  solicitante: string | null;
  idCuadrillaDestino: number;
  jefeDestino: number | null;
}

interface ColRow {
  id: number;
  nombre: string;
}

// Detalle de una solicitud de préstamo (cabecera + colaboradores). Lo usa el
// popup de la notificación para que el jefe destino acepte o rechace.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);
    const { id } = await params;
    const idPrestamo = Number(id);
    if (!Number.isInteger(idPrestamo)) return bad("Préstamo inválido", 400);

    const pool = await getPool();
    const cab = await pool.request().input("id", sql.BigInt, idPrestamo).query<CabeceraRow>(`
      SELECT CAST(p.idPrestamo AS NVARCHAR(20)) AS idPrestamo, p.estado,
             CONVERT(CHAR(10), p.fechaDesde, 23) AS fechaDesde,
             CONVERT(CHAR(10), p.fechaHasta, 23) AS fechaHasta,
             p.motivo, co.Nombre AS cuadrillaOrigen, us.username AS solicitante,
             p.idCuadrillaDestino, cd.IDEncargado AS jefeDestino
      FROM dbo.Prestamo p
      JOIN dbo.Cuadrilla co ON co.IDCuadrilla = p.idCuadrillaOrigen
      JOIN dbo.Cuadrilla cd ON cd.IDCuadrilla = p.idCuadrillaDestino
      LEFT JOIN dbo.Usuario us ON us.idUsuario = p.solicitadoPor
      WHERE p.idPrestamo = @id
    `);
    if (cab.recordset.length === 0) return bad("Préstamo no encontrado", 404);
    const c = cab.recordset[0];

    const cols = await pool.request().input("id", sql.BigInt, idPrestamo).query<ColRow>(`
      SELECT col.idColaborador AS id, col.calcNombreCompleto AS nombre
      FROM dbo.PrestamoColaborador pc
      JOIN dbo.Colaborador col ON col.idColaborador = pc.idColaborador
      WHERE pc.idPrestamo = @id
      ORDER BY col.calcNombreCompleto
    `);

    return ok({
      idPrestamo: c.idPrestamo,
      estado: c.estado,
      fechaDesde: c.fechaDesde,
      fechaHasta: c.fechaHasta,
      motivo: c.motivo,
      cuadrillaOrigen: c.cuadrillaOrigen,
      solicitante: c.solicitante,
      colaboradores: cols.recordset.map((x) => ({ id: x.id, nombre: x.nombre.trim() })),
    });
  } catch (e) {
    return fail(e);
  }
}

const bodySchema = z.object({ aceptar: z.boolean() });

// Responder una solicitud de préstamo. Solo el jefe de la cuadrilla destino
// puede aceptar/rechazar. Al aceptar, los colaboradores se integran a la
// plantilla (CuadrillaMiembro) de la cuadrilla destino por el rango acordado.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);
    const { id } = await params;
    const idPrestamo = Number(id);
    if (!Number.isInteger(idPrestamo)) return bad("Préstamo inválido", 400);

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) return bad("Payload inválido", 400, parsed.error.format());
    const { aceptar } = parsed.data;

    const pool = await getPool();

    // Cargar préstamo + validar que el usuario en sesión es el jefe destino.
    const pr = await pool.request().input("id", sql.BigInt, idPrestamo).input("uid", sql.Int, s.uid).query<{
      estado: string;
      idCuadrillaDestino: number;
      fechaDesde: Date;
      fechaHasta: Date;
      esJefeDestino: number;
    }>(`
      SELECT p.estado, p.idCuadrillaDestino, p.fechaDesde, p.fechaHasta,
             CASE WHEN u.idUsuario = @uid THEN 1 ELSE 0 END AS esJefeDestino
      FROM dbo.Prestamo p
      JOIN dbo.Cuadrilla cd ON cd.IDCuadrilla = p.idCuadrillaDestino
      JOIN dbo.Usuario u ON u.idColaborador = cd.IDEncargado
      WHERE p.idPrestamo = @id
    `);
    if (pr.recordset.length === 0) return bad("Préstamo no encontrado", 404);
    const p = pr.recordset[0];
    if (!p.esJefeDestino) return bad("Solo el jefe de la cuadrilla destino puede responder", 403);
    if (p.estado !== "Pendiente") return bad(`La solicitud ya fue ${p.estado.toLowerCase()}`, 409);

    const nuevoEstado = aceptar ? "Aceptado" : "Rechazado";
    const tx = new sql.Transaction(pool);
    await tx.begin();
    try {
      // Cabecera: el trigger tr_prestamo_afterUpdate notifica al solicitante.
      await new sql.Request(tx)
        .input("id", sql.BigInt, idPrestamo)
        .input("estado", sql.NVarChar(20), nuevoEstado)
        .input("uid", sql.Int, s.uid)
        .input("por", sql.NVarChar(100), s.username)
        .query(`
          UPDATE dbo.Prestamo
          SET estado = @estado, respondidoPor = @uid, fechaRespuestaUtc = GETUTCDATE(),
              fechaModificacion = GETUTCDATE(), modificadoPor = @por
          WHERE idPrestamo = @id;
        `);

      if (aceptar) {
        // Integrar a la plantilla destino por el tiempo acordado (idempotente).
        await new sql.Request(tx)
          .input("id", sql.BigInt, idPrestamo)
          .input("cuad", sql.Int, p.idCuadrillaDestino)
          .input("desde", sql.Date, p.fechaDesde)
          .input("hasta", sql.Date, p.fechaHasta)
          .input("uid", sql.Int, s.uid)
          .query(`
            INSERT INTO dbo.CuadrillaMiembro (IDCuadrilla, IDCol, FechaIngreso, FechaSalida, AsignadoPor, Activo)
            SELECT @cuad, pc.idColaborador, @desde, @hasta, @uid, 1
            FROM dbo.PrestamoColaborador pc
            WHERE pc.idPrestamo = @id
              AND NOT EXISTS (
                SELECT 1 FROM dbo.CuadrillaMiembro m
                WHERE m.IDCuadrilla = @cuad AND m.IDCol = pc.idColaborador AND m.Activo = 1
              );
          `);
      }

      // Marcar como leída la notificación de esta solicitud para el jefe destino.
      await new sql.Request(tx)
        .input("id", sql.BigInt, idPrestamo)
        .input("uid", sql.Int, s.uid)
        .query(`
          UPDATE dbo.Notificacion
          SET esLeida = 1, fechaLeidaUtc = GETUTCDATE()
          WHERE idReferencia = @id AND idUsuarioDestino = @uid AND tipo = N'PrestamoSolicitud' AND esLeida = 0;
        `);

      await tx.commit();
      return ok({ estado: nuevoEstado });
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  } catch (e) {
    return fail(e);
  }
}
