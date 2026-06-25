import { z } from "zod";
import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool, sql } from "@/server/sql";

export const runtime = "nodejs";

const schema = z.object({ idObraSubpartida: z.number().int() });

// Asigna a los colaboradores de un préstamo ACEPTADO a una obra-subpartida
// (condominio/casa/subpartida) bajo la cuadrilla destino. Crea/actualiza la
// AsignacionVigente — sin esto los prestados entran pero no pueden marcar.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);
    const { id } = await params;
    const idPrestamo = Number(id);
    if (!Number.isInteger(idPrestamo)) return bad("Préstamo inválido", 400);

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return bad("Payload inválido", 400, parsed.error.format());
    const { idObraSubpartida } = parsed.data;

    const pool = await getPool();

    // Validar: préstamo aceptado y el usuario es el jefe destino.
    const pr = await pool.request().input("id", sql.BigInt, idPrestamo).input("uid", sql.Int, s.uid).query<{
      estado: string;
      idCuadrillaDestino: number;
      esJefeDestino: number;
    }>(`
      SELECT p.estado, p.idCuadrillaDestino,
             CASE WHEN u.idUsuario = @uid THEN 1 ELSE 0 END AS esJefeDestino
      FROM dbo.Prestamo p
      JOIN dbo.Cuadrilla cd ON cd.IDCuadrilla = p.idCuadrillaDestino
      JOIN dbo.Usuario u ON u.idColaborador = cd.IDEncargado
      WHERE p.idPrestamo = @id
    `);
    if (pr.recordset.length === 0) return bad("Préstamo no encontrado", 404);
    const p = pr.recordset[0];
    if (!p.esJefeDestino) return bad("Solo el jefe de la cuadrilla destino puede asignar", 403);
    if (p.estado !== "Aceptado") return bad("El préstamo debe estar aceptado para asignar", 409);

    // Validar que la obra-subpartida exista y esté abierta.
    const os = await pool.request().input("os", sql.BigInt, idObraSubpartida).query(`
      SELECT 1 FROM dbo.ObraSubpartida WHERE idObraSubpartida = @os AND fechaCierreUtc IS NULL
    `);
    if (os.recordset.length === 0) return bad("Obra-subpartida inválida o cerrada", 400);

    // Upsert AsignacionVigente (PK = idColaborador) para cada prestado.
    const r = await pool
      .request()
      .input("id", sql.BigInt, idPrestamo)
      .input("os", sql.BigInt, idObraSubpartida)
      .input("cuad", sql.Int, p.idCuadrillaDestino)
      .input("uid", sql.Int, s.uid)
      .input("por", sql.NVarChar(100), s.username)
      .query(`
        MERGE dbo.AsignacionVigente AS t
        USING (
          SELECT pc.idColaborador FROM dbo.PrestamoColaborador pc WHERE pc.idPrestamo = @id
        ) AS src
        ON t.idColaborador = src.idColaborador
        WHEN MATCHED THEN
          UPDATE SET idObraSubpartida = @os, idCuadrilla = @cuad,
                     vigenteDesdeUtc = GETUTCDATE(), asignadoPor = @uid
        WHEN NOT MATCHED THEN
          INSERT (idColaborador, idObraSubpartida, idCuadrilla, vigenteDesdeUtc, asignadoPor, creadoPor)
          VALUES (src.idColaborador, @os, @cuad, GETUTCDATE(), @uid, @por);
        SELECT @@ROWCOUNT AS n;
      `);

    return ok({ asignados: r.recordset[0]?.n ?? 0 });
  } catch (e) {
    return fail(e);
  }
}
