import "server-only";

// Nombre de la tabla de usuarios, configurable por ambiente. Default = la
// tabla real de AdelanteSBX: dbo.Usuario. Solo se interpola en SQL un
// identificador con caracteres seguros.
function table(envKey: string, def: string): string {
  const v = process.env[envKey]?.trim();
  if (v && /^[A-Za-z0-9_.[\]]+$/.test(v)) return v;
  return def;
}

export const TABLES = {
  usuario: table("SQL_TABLE_USUARIO", "dbo.Usuario"),
} as const;
