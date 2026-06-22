import "server-only";
import sql, { type ConnectionPool, type config as SqlConfig } from "mssql";

// Pool único de conexión a Azure SQL (AdelanteSBX). Las credenciales se leen
// SIEMPRE desde variables de entorno (.env.local en local; App Settings en
// Azure). Nunca van hardcodeadas.

let pool: ConnectionPool | null = null;

function intEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function required(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Variable de entorno ${key} no configurada`);
  return v;
}

function buildConfig(): SqlConfig {
  return {
    server: required("SQL_SERVER"),
    port: intEnv("SQL_PORT", 1433),
    database: required("SQL_DATABASE"),
    user: required("SQL_USER"),
    password: required("SQL_PASSWORD"),
    connectionTimeout: intEnv("SQL_CONNECTION_TIMEOUT_MS", 5000),
    requestTimeout: intEnv("SQL_REQUEST_TIMEOUT_MS", 15000),
    options: {
      // Azure SQL exige cifrado en tránsito.
      encrypt: true,
      trustServerCertificate: false,
    },
    pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
  };
}

export async function getPool(): Promise<ConnectionPool> {
  if (pool && pool.connected) return pool;
  pool = await new sql.ConnectionPool(buildConfig()).connect();
  return pool;
}

export { sql };
