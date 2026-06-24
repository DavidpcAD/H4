import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool } from "@/server/sql";

export const runtime = "nodejs";

interface ResumenRow {
  code: string;
  name: string;
  color: string | null;
  totalHouses: number;
  workersToday: number;
  activeHouses: number;
  foremen: number;
}

// Resumen por proyecto para el home del Ingeniero Residente. Por cada proyecto:
//  - workersToday: colaboradores con tramo abierto en obras del proyecto (en obra ahora)
//  - activeHouses / totalHouses: obras con actividad vs obras del proyecto
//  - foremen: cuadrillas distintas trabajando en el proyecto (jefes)
// Las obras se asocian al proyecto por el prefijo de numeroObra (= abreviatura),
// ya que dbo.Obra no tiene FK a dbo.Proyecto.
export async function GET() {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);

    const pool = await getPool();
    const r = await pool.request().query<ResumenRow>(`
      SELECT p.abreviatura AS code, p.nombre AS name, p.colorHexP AS color,
        (SELECT COUNT(*) FROM dbo.Obra o WHERE o.numeroObra LIKE p.abreviatura + '-%') AS totalHouses,
        ISNULL(act.workersToday, 0) AS workersToday,
        ISNULL(act.activeHouses, 0) AS activeHouses,
        ISNULL(act.foremen, 0) AS foremen
      FROM dbo.Proyecto p
      OUTER APPLY (
        SELECT COUNT(DISTINCT t.idColaborador) AS workersToday,
               COUNT(DISTINCT o.idObra) AS activeHouses,
               COUNT(DISTINCT t.idCuadrilla) AS foremen
        FROM dbo.AsignacionTramo t
        JOIN dbo.ObraSubpartida os ON os.idObraSubpartida = t.idObraSubpartida
        JOIN dbo.Obra o ON o.idObra = os.idObra
        WHERE t.horaFinUtc IS NULL AND o.numeroObra LIKE p.abreviatura + '-%'
      ) act
      ORDER BY p.nombre
    `);

    return ok({ proyectos: r.recordset });
  } catch (e) {
    return fail(e);
  }
}
