// Modelo de dominio para la asignación de horas.
// La jerarquía es: Proyecto → Etapa → Actividad → Subactividad.
// La "Etapa" cumple el rol del antiguo "grupo" de Bildin.
// Cada Actividad tiene asociada una Cuadrilla, y la Cuadrilla agrupa
// a los Colaboradores a los que se les asignan horas.

/** Fila de dbo.Usuario en AdelanteSBX. */
export interface Usuario {
  idUsuario: number;
  username: string;
  /** Por ahora viene en texto plano; migrará a hash más adelante. */
  passwordHash: string;
}

export interface Proyecto {
  id: string;
  codigo: string;
  nombre: string;
}

export interface Etapa {
  id: string;
  proyectoId: string;
  nombre: string;
}

export interface Actividad {
  id: string;
  etapaId: string;
  nombre: string;
  /** Cuadrilla que ejecuta esta actividad. */
  cuadrillaId: string;
}

export interface Subactividad {
  id: string;
  actividadId: string;
  nombre: string;
}

export interface Colaborador {
  id: string;
  nombre: string;
  rol: string;
}

export interface Cuadrilla {
  id: string;
  nombre: string;
  colaboradorIds: string[];
}

/** Una línea de horas de un colaborador en una subactividad concreta. */
export interface LineaHoras {
  id: string;
  subactividadId: string | null;
  horas: number;
}

/** Distribución de horas de un colaborador (puede tener varias líneas). */
export type AsignacionPorColaborador = Record<string, LineaHoras[]>;
