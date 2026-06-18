// Modelo de dominio para la asignación de horas.
// La jerarquía es: Proyecto → Etapa → Actividad → Subactividad.
// La "Etapa" cumple el rol del antiguo "grupo" de Bildin.
// Cada Actividad tiene asociada una Cuadrilla, y la Cuadrilla agrupa
// a los Colaboradores a los que se les asignan horas.

export interface Usuario {
  id: string;
  usuario: string;
  nombre: string;
  /** Hash SHA-256 (hex) de la contraseña. No se guarda la contraseña en claro. */
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
