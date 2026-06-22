import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool } from "@/server/sql";

export const runtime = "nodejs";

interface ObraRow {
  id: string;
  numeroObra: string;
  nombre: string | null;
}

// Catálogo de obras (dbo.Obra — singular) — usado como "Casa" en la UI.
export async function GET() {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);

    const pool = await getPool();
    const r = await pool.request().query<ObraRow>(`
      SELECT CAST(idObra AS NVARCHAR(20)) AS id, numeroObra, nombreMostrado AS nombre
      FROM dbo.Obra
      ORDER BY numeroObra
    `);

    return ok({ obras: r.recordset });
  } catch (e) {
    return fail(e);
  }
}
