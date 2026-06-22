import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const COOKIE_NAME = "h4_session";
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 horas, hace match con JWT_EXPIRES_IN default

export interface JwtPayload extends Record<string, unknown> {
  /** idUsuario de dbo.Usuario (no usamos `sub` porque jose lo restringe a string). */
  uid: number;
  username: string;
  nombre: string;
  /** Nombre del rol (de dbo.Rol vía dbo.UsuarioRol). null si no tiene. */
  rol: string | null;
}

function secretBytes(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET no configurado");
  return new TextEncoder().encode(s);
}

export async function signToken(payload: JwtPayload): Promise<string> {
  const exp = process.env.JWT_EXPIRES_IN ?? "8h";
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secretBytes());
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, secretBytes());
  return payload as unknown as JwtPayload;
}

/** Lee el JWT de la cookie httpOnly y devuelve el payload, o null si no hay sesión. */
export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
