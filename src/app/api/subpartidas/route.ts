import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool } from "@/server/sql";

export const runtime = "nodejs";

interface SubpartidaRow {
  id: number;
  codigo: string;
  nombre: string;
}

// Catálogo de subpartidas activas (dbo.sub_partidas) para los dropdowns.
export async function GET() {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);

    const pool = await getPool();
    const r = await pool.request().query<SubpartidaRow>(`
      SELECT id, codigo, nombre
      FROM dbo.sub_partidas
      WHERE activo = 1
      ORDER BY codigo
    `);

    return ok({ subpartidas: r.recordset });
  } catch (e) {
    return fail(e);
  }
}
