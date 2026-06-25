import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool, sql } from "@/server/sql";

export const runtime = "nodejs";

interface CabeceraRow {
  task: string | null;
  foreman: string | null;
  expected: number;
}

interface WorkerRow {
  id: number;
  nombre: string;
  entradaUtc: Date | null;
  tramoInicioUtc: Date | null;
}

// Detalle de una casa (obra): trabajadores presentes (tramo abierto) con su
// entrada y tramo, más la subpartida y el jefe representativos. El proyecto se
// infiere del prefijo de numeroObra.
export async function GET(req: Request) {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);

    const obra = new URL(req.url).searchParams.get("obra")?.trim();
    if (!obra || !/^[A-Za-z0-9.\- ]{1,40}$/.test(obra)) return bad("Obra inválida", 400);

    const pool = await getPool();

    const cab = await pool
      .request()
      .input("obra", sql.NVarChar(40), obra)
      .query<CabeceraRow>(`
        SELECT task.t AS task, fore.f AS foreman, ISNULL(asig.expected, 0) AS expected
        FROM dbo.Obra o
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
        OUTER APPLY (
          SELECT COUNT(DISTINCT av.idColaborador) AS expected
          FROM dbo.AsignacionVigente av
          JOIN dbo.ObraSubpartida os ON os.idObraSubpartida = av.idObraSubpartida
          WHERE os.idObra = o.idObra
        ) asig
        WHERE o.numeroObra = @obra
      `);

    if (cab.recordset.length === 0) return bad("Casa no encontrada", 404);

    const ws = await pool
      .request()
      .input("obra", sql.NVarChar(40), obra)
      .query<WorkerRow>(`
        SELECT col.idColaborador AS id, col.calcNombreCompleto AS nombre,
               j.fechaHoraEntradaUtc AS entradaUtc, t.horaInicioUtc AS tramoInicioUtc
        FROM dbo.AsignacionTramo t
        JOIN dbo.ObraSubpartida os ON os.idObraSubpartida = t.idObraSubpartida
        JOIN dbo.Obra o ON o.idObra = os.idObra
        JOIN dbo.Colaborador col ON col.idColaborador = t.idColaborador
        LEFT JOIN dbo.Jornada j ON j.idColaborador = col.idColaborador AND j.fechaHoraSalidaUtc IS NULL
        WHERE t.horaFinUtc IS NULL AND o.numeroObra = @obra
        ORDER BY j.fechaHoraEntradaUtc
      `);

    const c = cab.recordset[0];
    const workers = ws.recordset.map((w) => ({
      id: String(w.id),
      nombre: w.nombre.trim(),
      entradaUtc: w.entradaUtc ? w.entradaUtc.toISOString() : null,
      tramoInicioUtc: w.tramoInicioUtc ? w.tramoInicioUtc.toISOString() : null,
    }));

    return ok({
      house: obra,
      task: c.task?.trim() || null,
      foreman: c.foreman?.trim() || null,
      expected: c.expected,
      workers,
    });
  } catch (e) {
    return fail(e);
  }
}
