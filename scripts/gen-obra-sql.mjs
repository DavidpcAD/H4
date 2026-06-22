// Genera el script de dbo.Obra (CREATE + datos) desde el export dim_obra.csv.
// Traduce los nombres a español camelCase y aplica las convenciones de estandar.md.
// Uso: node scripts/gen-obra-sql.mjs <input.csv> <output.sql>
// Solo desarrollo. No toca la base.

import { readFileSync, writeFileSync } from "node:fs";

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("Uso: node scripts/gen-obra-sql.mjs <input.csv> <output.sql>");
  process.exit(1);
}

// ── Parser CSV simple (maneja comillas y comillas dobladas "") ────────────────
function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c === "\r") { /* ignore */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

// Nombre de columna desde el encabezado HTML del export.
function sourceName(header) {
  const m = header.match(/column-name">([^<]*)<\/span>/);
  return m ? m[1] : header.trim();
}

// Mapa: nombre origen -> { col español, tipo }. Lo que no esté acá se omite.
const MAP = {
  works_no:                   { col: "numeroObra",               kind: "text" },
  display_name:               { col: "nombreMostrado",           kind: "text" },
  description:                { col: "descripcion",              kind: "text" },
  centro_costo:               { col: "centroCosto",              kind: "text" },
  area_costeo:                { col: "areaCosteo",               kind: "text" },
  proyecto_padre:             { col: "proyectoPadre",            kind: "text" },
  area_prorrateada_m2:        { col: "areaProrrateadaM2",        kind: "dec" },
  project_manager:            { col: "gerenteProyecto",          kind: "text" },
  id_encargado:               { col: "idEncargado",              kind: "text" },
  ubicacion:                  { col: "ubicacion",                kind: "text" },
  status:                     { col: "estado",                   kind: "text" },
  starting_date:              { col: "fechaInicio",              kind: "date" },
  ending_date:                { col: "fechaFin",                 kind: "date" },
  creation_date:              { col: "fechaCreacionObra",        kind: "date" },
  precio_normal_maquinaria:   { col: "precioNormalMaquinaria",   kind: "dec" },
  precio_concreto_maquinaria: { col: "precioConcretoMaquinaria", kind: "dec" },
  origen_principal:           { col: "origenPrincipal",          kind: "text" },
  // sk_obra y etl_updated_at se omiten (idObra es identity; auditoría aparte)
};

const rows = parseCSV(readFileSync(inPath, "utf8"));
const header = rows[0].map(sourceName);
const dataRows = rows.slice(1);

// Índices de columnas a emitir (en el orden del MAP, no del CSV).
const ORDER = ["works_no", "display_name", "description", "centro_costo", "area_costeo", "proyecto_padre", "area_prorrateada_m2", "project_manager", "id_encargado", "ubicacion", "estado_src", "starting_date", "ending_date", "creation_date", "precio_normal_maquinaria", "precio_concreto_maquinaria", "origen_principal"];
const emit = Object.keys(MAP).map((src) => ({ src, idx: header.indexOf(src), ...MAP[src] }));

function fmt(kind, raw) {
  const v = (raw ?? "").trim();
  if (v === "") return "NULL";
  if (kind === "dec") return v;
  if (kind === "date") return `'${v}'`;
  return `N'${v.replace(/'/g, "''")}'`;
}

const colList = emit.map((e) => e.col).join(", ") + ", creadoPor";

const lines = [];
lines.push("-- ============================================");
lines.push("-- Objeto:      dbo.Obra");
lines.push("-- Tipo:        TABLE");
lines.push("-- Descripción: Catálogo de obras (portado de bi.dim_obra, nombres en español).");
lines.push("-- Autor:       migración H4");
lines.push("-- Fecha:       2026-06-22");
lines.push("-- Modificado:");
lines.push("-- ============================================");
lines.push("");
lines.push("IF OBJECT_ID('dbo.Obra', 'U') IS NULL");
lines.push("BEGIN");
lines.push("    CREATE TABLE dbo.Obra (");
lines.push("        -- ids");
lines.push("        idObra                    BIGINT          IDENTITY(1,1)   NOT NULL,");
lines.push("");
lines.push("        -- negocio");
lines.push("        numeroObra                NVARCHAR(20)    NOT NULL,");
lines.push("        nombreMostrado            NVARCHAR(250)   NULL,");
lines.push("        descripcion               NVARCHAR(250)   NULL,");
lines.push("        centroCosto               NVARCHAR(20)    NULL,");
lines.push("        areaCosteo                NVARCHAR(20)    NULL,");
lines.push("        proyectoPadre             NVARCHAR(10)    NULL,");
lines.push("        areaProrrateadaM2         DECIMAL(20,5)   NULL,");
lines.push("        gerenteProyecto           NVARCHAR(100)   NULL,");
lines.push("        idEncargado               NVARCHAR(100)   NULL,");
lines.push("        ubicacion                 NVARCHAR(100)   NULL,");
lines.push("        estado                    NVARCHAR(50)    NULL,");
lines.push("        fechaInicio               DATE            NULL,");
lines.push("        fechaFin                  DATE            NULL,");
lines.push("        fechaCreacionObra         DATE            NULL,");
lines.push("        precioNormalMaquinaria    DECIMAL(20,5)   NULL,");
lines.push("        precioConcretoMaquinaria  DECIMAL(20,5)   NULL,");
lines.push("        origenPrincipal           NVARCHAR(20)    NULL,");
lines.push("");
lines.push("        -- auditoría");
lines.push("        fechaCreacion             DATETIME2       NOT NULL    CONSTRAINT df_obra_fechaCreacion DEFAULT GETDATE(),");
lines.push("        creadoPor                 NVARCHAR(100)   NOT NULL,");
lines.push("        fechaModificacion         DATETIME2       NULL,");
lines.push("        modificadoPor             NVARCHAR(100)   NULL,");
lines.push("");
lines.push("        -- constraints");
lines.push("        CONSTRAINT pk_obra PRIMARY KEY (idObra),");
lines.push("        CONSTRAINT ux_obra_numeroObra UNIQUE (numeroObra)");
lines.push("    );");
lines.push("END");
lines.push("GO");
lines.push("");
lines.push("-- índices (según los de origen)");
lines.push("IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='ix_obra_areaCosteo')");
lines.push("    CREATE NONCLUSTERED INDEX ix_obra_areaCosteo ON dbo.Obra (areaCosteo);");
lines.push("IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='ix_obra_centroCosto')");
lines.push("    CREATE NONCLUSTERED INDEX ix_obra_centroCosto ON dbo.Obra (centroCosto);");
lines.push("IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='ix_obra_proyectoPadre')");
lines.push("    CREATE NONCLUSTERED INDEX ix_obra_proyectoPadre ON dbo.Obra (proyectoPadre);");
lines.push("GO");
lines.push("");
lines.push("-- datos (solo si la tabla está vacía)");
lines.push("IF NOT EXISTS (SELECT 1 FROM dbo.Obra)");
lines.push("BEGIN");

const BATCH = 50;
for (let i = 0; i < dataRows.length; i += BATCH) {
  const slice = dataRows.slice(i, i + BATCH);
  lines.push(`    INSERT INTO dbo.Obra (${colList}) VALUES`);
  const tuples = slice.map((r) => {
    const vals = emit.map((e) => fmt(e.kind, r[e.idx]));
    vals.push("N'etl-import'");
    return "        (" + vals.join(", ") + ")";
  });
  lines.push(tuples.join(",\n") + ";");
}
lines.push("END");
lines.push("GO");
lines.push("");
lines.push("SELECT COUNT(*) AS filas FROM dbo.Obra;");
lines.push("GO");

writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.log(`OK -> ${outPath}`);
console.log(`Encabezado origen: ${header.filter(Boolean).length} columnas`);
console.log(`Filas de datos: ${dataRows.length}`);
console.log(`Columnas emitidas: ${emit.map((e) => e.col).join(", ")}`);
void ORDER;
