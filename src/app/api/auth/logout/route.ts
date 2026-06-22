import { clearSessionCookie } from "@/server/auth";
import { fail, ok } from "@/server/http";

export const runtime = "nodejs";

export async function POST() {
  try {
    await clearSessionCookie();
    return ok({ ok: true });
  } catch (e) {
    return fail(e);
  }
}
