import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool, sql } from "@/server/sql";

export const runtime = "nodejs";

interface MiembroRow {
  idCuadrilla: number;
  cuadrilla: string;
  idColaborador: number;
  nombre: string;
}

// Cuadrilla que encabeza el usuario en sesión (IDEncargado = su idColaborador)
// y sus miembros activos. El estado y las horas NO viven en la BD todavía
// (se simulan en la UI).
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
               col.idColaborador, col.calcNombreCompleto AS nombre
        FROM dbo.Usuario u
        JOIN dbo.CuadrillasH4 c ON c.IDEncargado = u.idColaborador
        JOIN dbo.CuadrillaMiembrosH4 m ON m.IDCuadrilla = c.IDCuadrilla AND m.Activo = 1
        JOIN dbo.Colaborador col ON col.idColaborador = m.IDCol
        WHERE u.idUsuario = @uid
        ORDER BY c.IDCuadrilla, col.idColaborador
      `);

    const rows = r.recordset;
    const cuadrilla = rows.length ? { id: rows[0].idCuadrilla, nombre: rows[0].cuadrilla } : null;
    const colaboradores = rows.map((x) => ({ id: x.idColaborador, nombre: x.nombre }));

    return ok({ cuadrilla, colaboradores });
  } catch (e) {
    return fail(e);
  }
}
