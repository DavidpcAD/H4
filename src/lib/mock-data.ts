// Datos de ejemplo en memoria. Sustituyen temporalmente a la base de datos.
// Cuando exista la capa de datos real, estos arrays se reemplazan por
// consultas, manteniendo los mismos tipos de `types.ts`.

import type {
  Proyecto,
  Etapa,
  Actividad,
  Subactividad,
  Colaborador,
  Cuadrilla,
} from "./types";

// Nota: los usuarios ya NO viven acá. El login consulta la tabla real
// dbo.Usuario en AdelanteSBX (ver src/app/api/auth/login/route.ts).
// El resto de catálogos sigue siendo mock hasta conectarlos.

// ── Proyectos ───────────────────────────────────────────────────────────────
export const PROYECTOS: Proyecto[] = [
  { id: "p1", codigo: "C.01", nombre: "Torre Novarum" },
  { id: "p2", codigo: "C.02", nombre: "Condominio Las Brisas" },
  { id: "p3", codigo: "C.03", nombre: "Centro Logístico Cartago" },
];

// ── Etapas (antes "grupo") ───────────────────────────────────────────────────
export const ETAPAS: Etapa[] = [
  { id: "e1", proyectoId: "p1", nombre: "Cimentación" },
  { id: "e2", proyectoId: "p1", nombre: "Estructura" },
  { id: "e3", proyectoId: "p1", nombre: "Acabados" },
  { id: "e4", proyectoId: "p2", nombre: "Movimiento de tierra" },
  { id: "e5", proyectoId: "p2", nombre: "Obra gris" },
  { id: "e6", proyectoId: "p3", nombre: "Nave principal" },
];

// ── Actividades ───────────────────────────────────────────────────────────────
export const ACTIVIDADES: Actividad[] = [
  { id: "a1", etapaId: "e1", nombre: "Excavación", cuadrillaId: "cu1" },
  { id: "a2", etapaId: "e1", nombre: "Armado de acero", cuadrillaId: "cu2" },
  { id: "a3", etapaId: "e1", nombre: "Colado de losa", cuadrillaId: "cu1" },
  { id: "a4", etapaId: "e2", nombre: "Columnas", cuadrillaId: "cu2" },
  { id: "a5", etapaId: "e2", nombre: "Vigas y entrepiso", cuadrillaId: "cu3" },
  { id: "a6", etapaId: "e3", nombre: "Repello y afinado", cuadrillaId: "cu3" },
  { id: "a7", etapaId: "e4", nombre: "Corte y relleno", cuadrillaId: "cu1" },
  { id: "a8", etapaId: "e5", nombre: "Mampostería", cuadrillaId: "cu2" },
  { id: "a9", etapaId: "e6", nombre: "Montaje de estructura", cuadrillaId: "cu3" },
];

// ── Subactividades ───────────────────────────────────────────────────────────
export const SUBACTIVIDADES: Subactividad[] = [
  // a1 Excavación
  { id: "s1", actividadId: "a1", nombre: "Trazado y nivelación" },
  { id: "s2", actividadId: "a1", nombre: "Excavación manual" },
  { id: "s3", actividadId: "a1", nombre: "Retiro de material" },
  // a2 Armado de acero
  { id: "s4", actividadId: "a2", nombre: "Habilitado de varilla" },
  { id: "s5", actividadId: "a2", nombre: "Colocación de acero" },
  { id: "s6", actividadId: "a2", nombre: "Amarre y separadores" },
  // a3 Colado de losa
  { id: "s7", actividadId: "a3", nombre: "Encofrado" },
  { id: "s8", actividadId: "a3", nombre: "Vaciado de concreto" },
  { id: "s9", actividadId: "a3", nombre: "Vibrado y acabado" },
  // a4 Columnas
  { id: "s10", actividadId: "a4", nombre: "Formaleta" },
  { id: "s11", actividadId: "a4", nombre: "Colado" },
  // a5 Vigas y entrepiso
  { id: "s12", actividadId: "a5", nombre: "Apuntalamiento" },
  { id: "s13", actividadId: "a5", nombre: "Armado de vigas" },
  { id: "s14", actividadId: "a5", nombre: "Losa de entrepiso" },
  // a6 Repello y afinado
  { id: "s15", actividadId: "a6", nombre: "Repello grueso" },
  { id: "s16", actividadId: "a6", nombre: "Afinado fino" },
  // a7 Corte y relleno
  { id: "s17", actividadId: "a7", nombre: "Corte" },
  { id: "s18", actividadId: "a7", nombre: "Compactación" },
  // a8 Mampostería
  { id: "s19", actividadId: "a8", nombre: "Pega de bloque" },
  { id: "s20", actividadId: "a8", nombre: "Refuerzo vertical" },
  // a9 Montaje de estructura
  { id: "s21", actividadId: "a9", nombre: "Izaje de cerchas" },
  { id: "s22", actividadId: "a9", nombre: "Fijación y arriostre" },
];

// ── Colaboradores ───────────────────────────────────────────────────────────
export const COLABORADORES: Colaborador[] = [
  { id: "co1", nombre: "Carlos Jiménez", rol: "Maestro de obras" },
  { id: "co2", nombre: "Andrés Mora", rol: "Operario" },
  { id: "co3", nombre: "Luis Vargas", rol: "Operario" },
  { id: "co4", nombre: "José Campos", rol: "Ayudante" },
  { id: "co5", nombre: "Marvin Rojas", rol: "Armador" },
  { id: "co6", nombre: "Diego Solís", rol: "Armador" },
  { id: "co7", nombre: "Esteban Núñez", rol: "Ayudante" },
  { id: "co8", nombre: "Roberto Cruz", rol: "Operario" },
  { id: "co9", nombre: "Fabián Araya", rol: "Albañil" },
];

// ── Cuadrillas ───────────────────────────────────────────────────────────────
export const CUADRILLAS: Cuadrilla[] = [
  { id: "cu1", nombre: "Cuadrilla A — Movimiento", colaboradorIds: ["co1", "co2", "co3", "co4"] },
  { id: "cu2", nombre: "Cuadrilla B — Acero", colaboradorIds: ["co5", "co6", "co7"] },
  { id: "cu3", nombre: "Cuadrilla C — Acabados", colaboradorIds: ["co8", "co9", "co1"] },
];

// ── Helpers de consulta ───────────────────────────────────────────────────────
export const etapasDeProyecto = (proyectoId: string) =>
  ETAPAS.filter((e) => e.proyectoId === proyectoId);

export const actividadesDeEtapa = (etapaId: string) =>
  ACTIVIDADES.filter((a) => a.etapaId === etapaId);

export const subactividadesDeActividad = (actividadId: string) =>
  SUBACTIVIDADES.filter((s) => s.actividadId === actividadId);

export const cuadrillaPorId = (cuadrillaId: string) =>
  CUADRILLAS.find((c) => c.id === cuadrillaId);

export const colaboradorPorId = (id: string) =>
  COLABORADORES.find((c) => c.id === id);

export const colaboradoresDeCuadrilla = (cuadrillaId: string) => {
  const cu = cuadrillaPorId(cuadrillaId);
  if (!cu) return [];
  return cu.colaboradorIds
    .map((id) => colaboradorPorId(id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
};
