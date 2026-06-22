// Mini-CLI de desarrollo para consultar AdelanteSBX desde la terminal.
// Usa las MISMAS variables de entorno que la app (.env.local).
//
// Uso:
//   node --env-file=.env.local scripts/db.mjs "SELECT TOP 5 * FROM dbo.Usuario"
//
// Solo para desarrollo: no se importa desde la app ni se despliega.

import sql from "mssql";

const query = process.argv[2];
if (!query) {
  console.error('Falta la consulta. Ej: node --env-file=.env.local scripts/db.mjs "SELECT 1 AS ok"');
  process.exit(1);
}

const config = {
  server: process.env.SQL_SERVER,
  port: Number.parseInt(process.env.SQL_PORT ?? "1433", 10),
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  options: { encrypt: true, trustServerCertificate: false },
  connectionTimeout: 8000,
  requestTimeout: 20000,
};

try {
  const pool = await sql.connect(config);
  const result = await pool.request().query(query);
  console.table(result.recordset);
  await pool.close();
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}
