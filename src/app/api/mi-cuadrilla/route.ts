import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool, sql } from "@/server/sql";

export const runtime = "nodejs";

interface MiembroRow {
  idCuadrilla: number;
  cuadrilla: string;
  id: number;
  nombre: string;
  estado: "g" | "b" | "x";
  prestadoEntrante: number; // 1 = miembro prestado de otra cuadrilla (temporal)
  prestadoSaliente: number; // 1 = miembro propio prestado a otra cuadrilla (activo allá)
  obra: string | null;
  subCodigo: string | null;
  subNombre: string | null;
  tramoInicioUtc: Date | null;
  entradaUtc: Date | null;
  horaInicio: string; // horario de la cuadrilla "HH:MM"
  horaFin: string;
}

// Cuadrilla que encabeza el usuario en sesión + sus miembros con estado en
// tiempo real: 'g' activo (tramo abierto en su cuadrilla), 'b' prestado (tramo
// abierto bajo otra cuadrilla), 'x' sin marcar (sin tramo abierto). Las horas
// salen de la jornada/tramo abiertos.
export async function GET() {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);

    const pool = await getPool();
    const r = await pool
      .request()
      .input("uid", sql.Int, s.uid)
      .query<MiembroRow>(`
        SELECT c.IDCuadrilla AS idCuadrilla, c.Nombre AS cuadrilla,
               col.idColaborador AS id, col.calcNombreCompleto AS nombre,
               CASE
                   WHEN t.idAsignacionTramo IS NULL THEN 'x'
                   WHEN t.idCuadrilla <> c.IDCuadrilla THEN 'b'
                   ELSE 'g'
               END AS estado,
               CASE WHEN m.FechaSalida IS NOT NULL THEN 1 ELSE 0 END AS prestadoEntrante,
               CASE WHEN EXISTS (
                   SELECT 1 FROM dbo.CuadrillaMiembro m2
                   WHERE m2.IDCol = col.idColaborador AND m2.IDCuadrilla <> c.IDCuadrilla
                     AND m2.Activo = 1 AND m2.FechaSalida IS NOT NULL
                     AND m2.FechaSalida >= CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'Central America Standard Time' AS DATE)
               ) THEN 1 ELSE 0 END AS prestadoSaliente,
               -- obra/subpartida: del tramo abierto, o si no marcó, de la asignación vigente
               COALESCE(ot.numeroObra, ov.numeroObra) AS obra,
               COALESCE(spt.codigo, spv.codigo) AS subCodigo,
               COALESCE(spt.nombre, spv.nombre) AS subNombre,
               t.horaInicioUtc AS tramoInicioUtc,
               j.fechaHoraEntradaUtc AS entradaUtc,
               CONVERT(CHAR(5), c.horaInicioJornada, 108) AS horaInicio,
               CONVERT(CHAR(5), c.horaFinJornada, 108) AS horaFin
        FROM dbo.Usuario u
        JOIN dbo.Cuadrilla c ON c.IDEncargado = u.idColaborador
        -- Miembros activos; los prestados (FechaSalida) salen al terminar el rango.
        JOIN dbo.CuadrillaMiembro m ON m.IDCuadrilla = c.IDCuadrilla AND m.Activo = 1
            AND (m.FechaSalida IS NULL
                 OR m.FechaSalida >= CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'Central America Standard Time' AS DATE))
        JOIN dbo.Colaborador col ON col.idColaborador = m.IDCol
        LEFT JOIN dbo.AsignacionTramo t ON t.idColaborador = col.idColaborador AND t.horaFinUtc IS NULL
        LEFT JOIN dbo.ObraSubpartida ost ON ost.idObraSubpartida = t.idObraSubpartida
        LEFT JOIN dbo.Obra ot ON ot.idObra = ost.idObra
        LEFT JOIN dbo.sub_partidas spt ON spt.id = ost.idSubpartida
        LEFT JOIN dbo.AsignacionVigente av ON av.idColaborador = col.idColaborador
        LEFT JOIN dbo.ObraSubpartida osv ON osv.idObraSubpartida = av.idObraSubpartida
        LEFT JOIN dbo.Obra ov ON ov.idObra = osv.idObra
        LEFT JOIN dbo.sub_partidas spv ON spv.id = osv.idSubpartida
        LEFT JOIN dbo.Jornada j ON j.idColaborador = col.idColaborador AND j.fechaHoraSalidaUtc IS NULL
        WHERE u.idUsuario = @uid
        ORDER BY col.idColaborador
      `);

    const rows = r.recordset;
    const cuadrilla = rows.length ? { id: rows[0].idCuadrilla, nombre: rows[0].cuadrilla } : null;
    const colaboradores = rows.map((x) => ({
      id: x.id,
      nombre: x.nombre,
      estado: x.estado,
      prestado: x.prestadoEntrante === 1,
      prestadoSaliente: x.prestadoSaliente === 1,
      obra: x.obra,
      subCodigo: x.subCodigo,
      subNombre: x.subNombre,
      tramoInicioUtc: x.tramoInicioUtc ? x.tramoInicioUtc.toISOString() : null,
      entradaUtc: x.entradaUtc ? x.entradaUtc.toISOString() : null,
      horaInicio: x.horaInicio,
      horaFin: x.horaFin,
    }));

    return ok({ cuadrilla, colaboradores });
  } catch (e) {
    return fail(e);
  }
}
