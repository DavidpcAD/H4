// Combina colaboradores reales de la cuadrilla con estado y horas SIMULADOS
// (la BD aún no tiene marcaje). Compartido por la pantalla del Jefe y la de
// reasignación para que ambas muestren los mismos datos.

import type { CrewDot, CrewWorker } from "./mock";

export interface ColaboradorCuadrilla {
  id: number;
  nombre: string;
}

// Estado: el último miembro "sin marcar", el penúltimo "prestado", el resto
// "activos" — solo para mostrar las 3 categorías de forma determinista.
export function simularCrew(colaboradores: ColaboradorCuadrilla[]): CrewWorker[] {
  const DUR = ["2h 41m", "2h 33m", "2h 22m", "2h 44m", "2h 18m", "2h 11m"];
  const START = ["06:43", "06:51", "07:02", "06:40", "07:06", "07:13"];
  const HOUSE = ["VN-J.28", "VN-J.30"];
  const TASK = ["1.1.3 Acero Losa", "1.2.1 Estructura Techo"];
  const last = colaboradores.length - 1;

  return colaboradores.map((c, i) => {
    let dot: CrewDot = "g";
    if (colaboradores.length >= 3 && i === last) dot = "x";
    else if (colaboradores.length >= 3 && i === last - 1) dot = "b";

    if (dot === "x")
      return { id: String(c.id), name: c.nombre, dot, house: null, loc: "Sin marcar entrada", task: "", dur: "—", start: "—" };
    if (dot === "b")
      return { id: String(c.id), name: c.nombre, dot, house: null, loc: "→ Otra cuadrilla", task: "Préstamo", dur: "—", start: "VIE" };

    const house = HOUSE[i % HOUSE.length];
    return { id: String(c.id), name: c.nombre, dot, house, loc: house, task: TASK[i % TASK.length], dur: DUR[i % DUR.length], start: START[i % START.length] };
  });
}
