import { getSession } from "@/server/auth";
import { bad, fail, ok } from "@/server/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const s = await getSession();
    if (!s) return bad("Sin autorización", 401);
    return ok({ id: s.uid, username: s.username, nombre: s.nombre, rol: s.rol ?? null });
  } catch (e) {
    return fail(e);
  }
}
