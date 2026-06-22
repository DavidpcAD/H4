// Generador del script SQL para dbo.sub_partidas a partir del export JSON.
// Uso: node scripts/gen-subpartidas-sql.mjs <input.json> <output.sql>
// Solo desarrollo. No toca la base.

import { readFileSync, writeFileSync } from "node:fs";

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("Uso: node scripts/gen-subpartidas-sql.mjs <input.json> <output.sql>");
  process.exit(1);
}

const rows = JSON.parse(readFileSync(inPath, "utf8"));
if (!Array.isArray(rows) || rows.length === 0) {
  console.error("El JSON debe ser un arreglo no vacío.");
  process.exit(1);
}

// Las claves vienen como HTML: <span class="column-name">X</span><span class="column-data-type">T</span>
function parseKey(key) {
  const name = key.match(/column-name">([^<]*)<\/span>/)?.[1];
  const type = key.match(/column-data-type">([^<]*)<\/span>/)?.[1];
  return name ? { name, type, raw: key } : null;
}

// Orden de columnas tomado de la primera fila (se ignora la clave basura).
const cols = Object.keys(rows[0])
  .map(parseKey)
  .filter(Boolean);

// Valor crudo de una columna en una fila (por la clave HTML original).
const val = (row, col) => {
  const v = row[col.raw];
  return v === undefined || v === null ? "" : String(v);
};

// Tamaño para varchar/nvarchar según longitud máxima observada.
function pickSize(maxLen) {
  for (const n of [50, 100, 200, 500, 1000, 4000]) if (maxLen <= n) return String(n);
  return "MAX";
}

const TYPE_SQL = {
  int: () => "INT",
  smallint: () => "SMALLINT",
  bit: () => "BIT",
  datetime2: () => "DATETIME2",
};

// Metadata por columna: tipo SQL + nullability inferida (NULL si hay vacíos).
const meta = cols.map((c) => {
  const values = rows.map((r) => val(r, c));
  const hasEmpty = values.some((v) => v === "");
  let sqlType;
  if (c.type === "varchar" || c.type === "nvarchar") {
    const maxLen = Math.max(0, ...values.map((v) => v.length));
    const size = pickSize(maxLen);
    sqlType = `${c.type.toUpperCase()}(${size})`;
  } else {
    sqlType = (TYPE_SQL[c.type] ?? (() => "NVARCHAR(MAX)"))();
  }
  // id = PK identity; el resto NOT NULL salvo que tenga vacíos.
  const isId = c.name === "id";
  const nullable = !isId && hasEmpty;
  return { ...c, sqlType, nullable, isId };
});

// Formatea un valor para SQL según el tipo.
function fmt(col, raw) {
  if (raw === "") return col.nullable ? "NULL" : col.type === "bit" ? "0" : (col.type === "varchar" || col.type === "nvarchar") ? (col.type === "nvarchar" ? "N''" : "''") : "NULL";
  switch (col.type) {
    case "int":
    case "smallint":
      return raw.trim();
    case "bit":
      return raw === "1" || raw.toLowerCase() === "true" ? "1" : "0";
    case "datetime2":
      return `'${raw.replace(/'/g, "''")}'`;
    case "varchar":
      return `'${raw.replace(/'/g, "''")}'`;
    case "nvarchar":
    default:
      return `N'${raw.replace(/'/g, "''")}'`;
  }
}

const colList = meta.map((c) => `[${c.name}]`).join(", ");

const lines = [];
lines.push("/* =============================================================================");
lines.push("   004 — Crear e importar dbo.sub_partidas (esquema + datos)");
lines.push(`   Generado desde el export JSON. Filas: ${rows.length}.`);
lines.push("   Base destino: AdelanteSBX. Ejecutar en SSMS / Azure Data Studio.");
lines.push("   ============================================================================= */");
lines.push("");
lines.push("IF OBJECT_ID('dbo.sub_partidas', 'U') IS NULL");
lines.push("BEGIN");
lines.push("    CREATE TABLE dbo.sub_partidas (");
const colDefs = meta.map((c) => {
  const ident = c.isId ? " IDENTITY(1,1)" : "";
  const nn = c.nullable ? "NULL" : "NOT NULL";
  return `        [${c.name}] ${c.sqlType}${ident} ${nn}`;
});
colDefs.push("        CONSTRAINT PK_sub_partidas PRIMARY KEY CLUSTERED ([id])");
lines.push(colDefs.join(",\n"));
lines.push("    );");
lines.push("END");
lines.push("GO");
lines.push("");
lines.push("-- Carga de datos (preserva los id originales)");
lines.push("SET IDENTITY_INSERT dbo.sub_partidas ON;");
lines.push("GO");

// INSERTs en lotes de 50 (límite de SQL Server por sentencia es 1000).
const BATCH = 50;
for (let i = 0; i < rows.length; i += BATCH) {
  const slice = rows.slice(i, i + BATCH);
  lines.push(`INSERT INTO dbo.sub_partidas (${colList}) VALUES`);
  const tuples = slice.map((r) => "    (" + meta.map((c) => fmt(c, val(r, c))).join(", ") + ")");
  lines.push(tuples.join(",\n") + ";");
  lines.push("GO");
}

lines.push("SET IDENTITY_INSERT dbo.sub_partidas OFF;");
lines.push("GO");
lines.push("");
lines.push("SELECT COUNT(*) AS filas FROM dbo.sub_partidas;");
lines.push("GO");

writeFileSync(outPath, lines.join("\n") + "\n", "utf8");

// Reporte a stdout (no imprime datos sensibles, solo metadata).
console.log(`OK -> ${outPath}`);
console.table(meta.map((c) => ({ columna: c.name, tipo_origen: c.type, sql: c.sqlType, nullable: c.nullable, pk_identity: c.isId })));
console.log(`Filas: ${rows.length}`);
