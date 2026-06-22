import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool } from "@/server/sql";

export const runtime = "nodejs";

interface ProyectoRow {
  id: number;
  nombre: string;
  abreviatura: string;
}

// Catálogo de proyectos (dbo.Proyecto) — usado como "Condominio" en la UI.
export async function GET() {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);

    const pool = await getPool();
    const r = await pool.request().query<ProyectoRow>(`
      SELECT idProyecto AS id, nombre, abreviatura
      FROM dbo.Proyecto
      ORDER BY nombre
    `);

    return ok({ proyectos: r.recordset });
  } catch (e) {
    return fail(e);
  }
}
