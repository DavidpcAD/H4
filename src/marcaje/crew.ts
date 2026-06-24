// Mapeo de los datos reales de la cuadrilla (estado + horas desde Jornada /
// AsignacionTramo) a la fila de trabajador que renderiza la UI.

import type { CrewDot, CrewWorker } from "./mock";

// Lo que devuelve /api/mi-cuadrilla por cada miembro.
export interface MiembroEstado {
  id: number;
  nombre: string;
  estado: CrewDot; // 'g' activo · 'b' prestado · 'x' sin marcar
  obra: string | null;
  subCodigo: string | null;
  subNombre: string | null;
  tramoInicioUtc: string | null; // ISO UTC del tramo abierto
  entradaUtc: string | null; // ISO UTC de la jornada abierta
  horaInicio: string | null; // horario de la cuadrilla "HH:MM"
  horaFin: string | null;
}

function fmtDur(iso: string | null): string {
  if (!iso) return "—";
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
}

function fmtHora(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-CR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Costa_Rica",
  });
}

// Minutos transcurridos del día en hora de Costa Rica.
function ahoraMinutosCR(): number {
  const hhmm = new Date().toLocaleString("en-US", {
    timeZone: "America/Costa_Rica",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Dentro del horario de la cuadrilla (si no hay horario, se asume dentro).
function enHorario(inicio: string | null, fin: string | null): boolean {
  if (!inicio || !fin) return true;
  const ahora = ahoraMinutosCR();
  return ahora >= aMinutos(inicio) && ahora < aMinutos(fin);
}

export function toCrew(m: MiembroEstado): CrewWorker {
  const task = m.subCodigo ? `${m.subCodigo} ${m.subNombre ?? ""}`.trim() : "";

  // Sin tramo abierto: sigue asignado (casa/subpartida desde su vigente), pero
  // el indicador de horas refleja "Sin marcar" (en horario de su cuadrilla) o
  // "Fuera de horario".
  if (m.estado === "x") {
    const indicador = enHorario(m.horaInicio, m.horaFin) ? "Sin marcar" : "Fuera de horario";
    return {
      id: String(m.id),
      name: m.nombre,
      dot: "x",
      house: m.obra,
      loc: m.obra ?? "Sin asignación",
      task,
      dur: indicador,
      start: "—",
    };
  }

  const loc = m.estado === "b" ? `→ ${m.obra ?? "otra cuadrilla"}` : (m.obra ?? "");
  return {
    id: String(m.id),
    name: m.nombre,
    dot: m.estado,
    house: m.obra,
    loc,
    task,
    dur: fmtDur(m.tramoInicioUtc),
    start: fmtHora(m.entradaUtc),
  };
}

export function toCrewList(miembros: MiembroEstado[]): CrewWorker[] {
  return miembros.map(toCrew);
}
