import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool } from "@/server/sql";

export const runtime = "nodejs";

interface Row {
  idObraSubpartida: string;
  proyecto: string | null;
  proyectoNombre: string | null;
  numeroObra: string;
  subCodigo: string;
  subNombre: string;
}

// Catálogo de obra-subpartidas ABIERTAS (work items donde se puede asignar
// personal). Se usa para asignar a un colaborador prestado a condominio/casa/
// subpartida. Proyecto se infiere por el prefijo de numeroObra.
export async function GET() {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);

    const pool = await getPool();
    const r = await pool.request().query<Row>(`
      SELECT CAST(os.idObraSubpartida AS NVARCHAR(20)) AS idObraSubpartida,
             p.abreviatura AS proyecto, p.nombre AS proyectoNombre,
             o.numeroObra AS numeroObra, sp.codigo AS subCodigo, sp.nombre AS subNombre
      FROM dbo.ObraSubpartida os
      JOIN dbo.Obra o ON o.idObra = os.idObra
      JOIN dbo.sub_partidas sp ON sp.id = os.idSubpartida
      LEFT JOIN dbo.Proyecto p ON o.numeroObra LIKE p.abreviatura + '-%'
      WHERE os.fechaCierreUtc IS NULL
      ORDER BY o.numeroObra, sp.codigo
    `);

    return ok({ items: r.recordset });
  } catch (e) {
    return fail(e);
  }
}
