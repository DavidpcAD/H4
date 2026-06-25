import { z } from "zod";
import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool, sql } from "@/server/sql";

export const runtime = "nodejs";

const schema = z.object({
  idCuadrillaDestino: z.number().int(),
  fechaDesde: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fechaHasta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  motivo: z.string().min(1).max(300),
  colaboradorIds: z.array(z.number().int()).min(1),
});

// Crea una solicitud de préstamo (cabecera + detalle). El trigger en BD
// notifica automáticamente al jefe de la cuadrilla destino.
export async function POST(req: Request) {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return bad("Payload inválido", 400, parsed.error.format());
    const { idCuadrillaDestino, fechaDesde, fechaHasta, motivo, colaboradorIds } = parsed.data;

    const pool = await getPool();

    // Cuadrilla del jefe en sesión (origen)
    const cr = await pool.request().input("uid", sql.Int, s.uid).query<{ idCuadrilla: number }>(`
      SELECT c.IDCuadrilla AS idCuadrilla
      FROM dbo.Usuario u
      JOIN dbo.Cuadrilla c ON c.IDEncargado = u.idColaborador
      WHERE u.idUsuario = @uid
    `);
    const origen = cr.recordset[0];
    if (!origen) return bad("El usuario no es jefe de una cuadrilla", 400);
    if (origen.idCuadrilla === idCuadrillaDestino) return bad("La cuadrilla destino debe ser distinta a la propia", 400);

    // Conflicto: no se puede prestar a un colaborador que ya está prestado
    // (miembro temporal en otra cuadrilla) — evita doble asignación/préstamo.
    const idsTable = colaboradorIds.map((x) => `(${Number(x)})`).join(",");
    const conf = await pool.request().query<{ idColaborador: number; nombre: string }>(`
      SELECT DISTINCT m.IDCol AS idColaborador, col.calcNombreCompleto AS nombre
      FROM dbo.CuadrillaMiembro m
      JOIN dbo.Colaborador col ON col.idColaborador = m.IDCol
      JOIN (VALUES ${idsTable}) AS sel(id) ON sel.id = m.IDCol
      WHERE m.Activo = 1 AND m.FechaSalida IS NOT NULL
        AND m.FechaSalida >= CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'Central America Standard Time' AS DATE)
    `);
    if (conf.recordset.length > 0) {
      const nombres = conf.recordset.map((c) => c.nombre.trim()).join(", ");
      return bad(`No se puede prestar: ya está(n) en otro préstamo activo: ${nombres}`, 409);
    }

    const tx = new sql.Transaction(pool);
    await tx.begin();
    try {
      const ins = await new sql.Request(tx)
        .input("origen", sql.Int, origen.idCuadrilla)
        .input("destino", sql.Int, idCuadrillaDestino)
        .input("desde", sql.Date, fechaDesde)
        .input("hasta", sql.Date, fechaHasta)
        .input("motivo", sql.NVarChar(300), motivo)
        .input("uid", sql.Int, s.uid)
        .input("creadoPor", sql.NVarChar(100), s.username)
        .query<{ idPrestamo: string }>(`
          INSERT INTO dbo.Prestamo (idCuadrillaOrigen, idCuadrillaDestino, fechaDesde, fechaHasta, motivo, solicitadoPor, creadoPor)
          VALUES (@origen, @destino, @desde, @hasta, @motivo, @uid, @creadoPor);
          SELECT CAST(SCOPE_IDENTITY() AS BIGINT) AS idPrestamo;
        `);
      const idPrestamo = ins.recordset[0].idPrestamo;

      for (const idCol of colaboradorIds) {
        await new sql.Request(tx)
          .input("idPrestamo", sql.BigInt, idPrestamo)
          .input("idCol", sql.Int, idCol)
          .input("creadoPor", sql.NVarChar(100), s.username)
          .query(`INSERT INTO dbo.PrestamoColaborador (idPrestamo, idColaborador, creadoPor) VALUES (@idPrestamo, @idCol, @creadoPor)`);
      }

      await tx.commit();
      return ok({ idPrestamo, trabajadores: colaboradorIds.length });
    } catch (e) {
      await tx.rollback();
      throw e;
    }
  } catch (e) {
    return fail(e);
  }
}
