import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool } from "@/server/sql";

export const runtime = "nodejs";

interface CuadrillaRow {
  id: number;
  nombre: string;
  lider: string | null;
}

// Lista de cuadrillas activas con su líder (encargado). Para elegir destino de
// un préstamo se selecciona al líder, que mapea a su cuadrilla (id).
export async function GET() {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);

    const pool = await getPool();
    const r = await pool.request().query<CuadrillaRow>(`
      SELECT c.IDCuadrilla AS id, c.Nombre AS nombre,
             col.calcNombreCompleto AS lider
      FROM dbo.Cuadrilla c
      LEFT JOIN dbo.Colaborador col ON col.idColaborador = c.IDEncargado
      WHERE c.Activo = 1
      ORDER BY col.calcNombreCompleto
    `);

    return ok({ cuadrillas: r.recordset });
  } catch (e) {
    return fail(e);
  }
}
