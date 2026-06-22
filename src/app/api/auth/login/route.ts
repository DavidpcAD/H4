import { z } from "zod";
import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { bad, fail, ok } from "@/server/http";
import { signToken, setSessionCookie } from "@/server/auth";
import { getPool, sql } from "@/server/sql";
import { TABLES } from "@/server/tables";

export const runtime = "nodejs";

const schema = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(128),
});

interface UsuarioLoginRow {
  idUsuario: number;
  username: string;
  passwordHash: string | null;
  rol: string | null;
}

/**
 * Verifica el password contra lo almacenado. Hoy `passwordHash` viene en texto
 * plano, así que el match directo basta; igual dejamos soporte para bcrypt y
 * SHA-256 para cuando se migre a hash, sin tener que tocar este flujo.
 */
async function verifyPassword(
  password: string,
  storedRaw: string | null | undefined,
): Promise<boolean> {
  const stored = (storedRaw ?? "").trim();
  if (!stored) return false;

  // Texto plano (estado actual de la columna).
  if (password === stored || password.trim() === stored) return true;

  // bcrypt
  const isBcrypt =
    stored.startsWith("$2a$") ||
    stored.startsWith("$2b$") ||
    stored.startsWith("$2y$");
  if (isBcrypt) {
    try {
      if (await bcrypt.compare(password, stored)) return true;
    } catch {
      // sigue con otros formatos
    }
  }

  // SHA-256 (hex / base64 / 0x…)
  const sha256Hex = createHash("sha256").update(password, "utf8").digest("hex");
  const sha256Base64 = createHash("sha256")
    .update(password, "utf8")
    .digest("base64");
  const normalizedStored = stored.toLowerCase().replace(/^0x/, "");

  return (
    normalizedStored === sha256Hex.toLowerCase() ||
    stored === sha256Base64 ||
    stored.toLowerCase() === `0x${sha256Hex}`
  );
}

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return bad("Payload inválido", 400, parsed.error.format());

    const username = parsed.data.username.trim();
    const password = parsed.data.password;

    const pool = await getPool();
    const r = await pool
      .request()
      .input("u", sql.NVarChar(255), username)
      .query<UsuarioLoginRow>(`
        SELECT TOP 1 u.idUsuario, u.username, u.passwordHash, r.nombre AS rol
        FROM ${TABLES.usuario} u
        LEFT JOIN dbo.UsuarioRol ur ON ur.idUsuario = u.idUsuario
        LEFT JOIN dbo.Rol r ON r.idRol = ur.idRol
        WHERE u.username = @u
        ORDER BY u.idUsuario ASC
      `);

    const row = r.recordset[0];
    if (!row) return bad("Usuario o contraseña inválidos", 401);

    const valid = await verifyPassword(password, row.passwordHash);
    if (!valid) return bad("Usuario o contraseña inválidos", 401);

    const nombre = row.username;
    const rol = row.rol ?? null;
    const token = await signToken({
      uid: row.idUsuario,
      username: row.username,
      nombre,
      rol,
    });
    await setSessionCookie(token);

    return ok({ user: { id: row.idUsuario, username: row.username, nombre, rol } });
  } catch (e) {
    return fail(e);
  }
}
