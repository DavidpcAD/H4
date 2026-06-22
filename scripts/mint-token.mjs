// Mini-util de desarrollo: firma un JWT de sesión (como hace /api/auth/login)
// sin necesitar la contraseña. Para verificar ruteo por rol en local.
// Uso: node --env-file=.env.local scripts/mint-token.mjs <uid> <username> <rol>

import { SignJWT } from "jose";

const [, , uid, username, ...rolParts] = process.argv;
const rol = rolParts.join(" ");
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const token = await new SignJWT({ uid: Number(uid), username, nombre: username, rol })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime(process.env.JWT_EXPIRES_IN ?? "8h")
  .sign(secret);

console.log(token);
