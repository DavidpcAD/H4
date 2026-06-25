import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool, sql } from "@/server/sql";

export const runtime = "nodejs";

interface CasaRow {
  house: string;
  workers: number;
  expected: number;
  desdeUtc: Date | null;
  task: string | null;
  foreman: string | null;
}

// Casas (obras) de un proyecto con actividad o asignación vigente hoy. Por casa:
//  - workers: colaboradores presentes (tramo abierto)
//  - expected: colaboradores asignados (AsignacionVigente)
//  - task / foreman: subpartida y jefe representativos del trabajo en curso
// El proyecto se identifica por el prefijo de numeroObra (= abreviatura).
export async function GET(req: Request) {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);

    const code = new URL(req.url).searchParams.get("code")?.trim().toUpperCase();
    if (!code || !/^[A-Z0-9]{1,8}$/.test(code)) return bad("Código de proyecto inválido", 400);

    const pool = await getPool();
    const r = await pool
      .request()
      .input("prefix", sql.NVarChar(20), `${code}-%`)
      .query<CasaRow>(`
        WITH obras AS (
          SELECT o.idObra, o.numeroObra FROM dbo.Obra o WHERE o.numeroObra LIKE @prefix
        ),
        presentes AS (
          SELECT os.idObra, COUNT(DISTINCT t.idColaborador) AS workers, MIN(t.horaInicioUtc) AS desdeUtc
          FROM dbo.AsignacionTramo t
          JOIN dbo.ObraSubpartida os ON os.idObraSubpartida = t.idObraSubpartida
          WHERE t.horaFinUtc IS NULL
          GROUP BY os.idObra
        ),
        asignados AS (
          SELECT os.idObra, COUNT(DISTINCT av.idColaborador) AS expected
          FROM dbo.AsignacionVigente av
          JOIN dbo.ObraSubpartida os ON os.idObraSubpartida = av.idObraSubpartida
          GROUP BY os.idObra
        )
        SELECT o.numeroObra AS house, ISNULL(p.workers, 0) AS workers, ISNULL(a.expected, 0) AS expected,
               p.desdeUtc AS desdeUtc, task.t AS task, fore.f AS foreman
        FROM obras o
        LEFT JOIN presentes p ON p.idObra = o.idObra
        LEFT JOIN asignados a ON a.idObra = o.idObra
        OUTER APPLY (
          SELECT TOP 1 sp.codigo + ' ' + sp.nombre AS t
          FROM dbo.AsignacionTramo t2
          JOIN dbo.ObraSubpartida os ON os.idObraSubpartida = t2.idObraSubpartida
          JOIN dbo.sub_partidas sp ON sp.id = os.idSubpartida
          WHERE t2.horaFinUtc IS NULL AND os.idObra = o.idObra
        ) task
        OUTER APPLY (
          SELECT TOP 1 enc.username AS f
          FROM dbo.AsignacionTramo t3
          JOIN dbo.ObraSubpartida os ON os.idObraSubpartida = t3.idObraSubpartida
          JOIN dbo.Cuadrilla c ON c.IDCuadrilla = t3.idCuadrilla
          JOIN dbo.Usuario enc ON enc.idColaborador = c.IDEncargado
          WHERE t3.horaFinUtc IS NULL AND os.idObra = o.idObra
        ) fore
        WHERE p.workers IS NOT NULL OR a.expected IS NOT NULL
        ORDER BY ISNULL(p.workers, 0) DESC, o.numeroObra
      `);

    const casas = r.recordset.map((c) => {
      const workers = c.workers;
      const expected = c.expected;
      const status: "ok" | "short" | "over" | "empty" =
        workers === 0 ? "empty" : workers < expected ? "short" : workers > expected ? "over" : "ok";
      return {
        house: c.house,
        workers,
        expected,
        status,
        desdeUtc: c.desdeUtc ? c.desdeUtc.toISOString() : null,
        task: c.task?.trim() || null,
        foreman: c.foreman?.trim() || null,
      };
    });

    return ok({ casas });
  } catch (e) {
    return fail(e);
  }
}
