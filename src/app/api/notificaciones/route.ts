import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";
import { getPool, sql } from "@/server/sql";

export const runtime = "nodejs";

interface NotifRow {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string | null;
  esLeida: boolean;
  fechaCreacionUtc: Date;
}

// Notificaciones del usuario en sesión (dbo.Notificacion). Las solicitudes de
// préstamo se insertan por trigger al crear un Prestamo hacia su cuadrilla.
export async function GET() {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);

    const pool = await getPool();
    const r = await pool
      .request()
      .input("uid", sql.Int, s.uid)
      .query<NotifRow>(`
        SELECT TOP 30
               CAST(idNotificacion AS NVARCHAR(20)) AS id,
               tipo, titulo, mensaje, esLeida,
               fechaCreacion AS fechaCreacionUtc
        FROM dbo.Notificacion
        WHERE idUsuarioDestino = @uid
        ORDER BY esLeida ASC, fechaCreacion DESC
      `);

    const notificaciones = r.recordset.map((n) => ({
      id: n.id,
      tipo: n.tipo,
      titulo: n.titulo,
      mensaje: n.mensaje,
      esLeida: n.esLeida,
      fechaCreacionUtc: n.fechaCreacionUtc.toISOString(),
    }));

    return ok({ notificaciones });
  } catch (e) {
    return fail(e);
  }
}
