// Datos simulados del mockup Marcaje. Reemplazan temporalmente a la BD para
// las pantallas Jefe de Cuadrilla e Ingeniero.

export type CrewDot = "g" | "b" | "x";

export interface CrewWorker {
  id: string;
  name: string;
  dot: CrewDot;
  prestado?: boolean; // miembro prestado de otra cuadrilla (entrante, temporal)
  prestadoSaliente?: boolean; // miembro propio prestado a otra cuadrilla (activo allá)
  house: string | null;
  loc: string;
  task: string;
  dur: string;
  start: string;
}

export interface ProjectStat {
  code: string;
  name?: string;
  color?: string;
  activeHouses: number;
  totalHouses: number;
  workersToday: number;
  workersExpected?: number;
  foremen: number;
}

// Cuadrilla de Don Roberto (Jefe). dot: g=activo, b=prestado, x=sin marcar.
export const CREW: CrewWorker[] = [
  { id: "p1", name: "Juan Pérez Mora", dot: "g", house: "VN-J.28", loc: "VN-J.28", task: "1.1.3 Acero Losa", dur: "2h 41m", start: "06:43" },
  { id: "p2", name: "María Solano Vega", dot: "g", house: "VN-J.28", loc: "VN-J.28", task: "1.1.3 Acero Losa", dur: "2h 33m", start: "06:51" },
  { id: "p3", name: "Carlos Mora Jiménez", dot: "g", house: "VN-J.28", loc: "VN-J.28", task: "1.1.3 Acero Losa", dur: "2h 22m", start: "07:02" },
  { id: "p4", name: "Luis Vargas Castro", dot: "g", house: "VN-J.28", loc: "VN-J.28", task: "1.1.3 Acero Losa", dur: "2h 44m", start: "06:40" },
  { id: "p5", name: "Andrea Rojas Quesada", dot: "g", house: "VN-J.28", loc: "VN-J.28", task: "1.1.3 Acero Losa", dur: "2h 18m", start: "07:06" },
  { id: "p6", name: "Felipe Quesada B.", dot: "g", house: "VN-J.30", loc: "VN-J.30", task: "1.2.1 Estructura Techo", dur: "2h 36m", start: "06:48" },
  { id: "p7", name: "Marcos Vega Araya", dot: "g", house: "VN-J.30", loc: "VN-J.30", task: "1.2.1 Estructura Techo", dur: "2h 11m", start: "07:13" },
  { id: "p8", name: "Eduardo Sánchez M.", dot: "g", house: "VN-J.30", loc: "VN-J.30", task: "1.2.1 Estructura Techo", dur: "2h 04m", start: "07:20" },
  { id: "p9", name: "Pedro Solís Ramírez", dot: "b", house: null, loc: "→ Don Manuel", task: "Préstamo · VIE 25 ABR", dur: "—", start: "VIE" },
  { id: "p10", name: "Roberto Núñez F.", dot: "x", house: null, loc: "Sin marcar entrada", task: "", dur: "—", start: "—" },
  { id: "p11", name: "Diego Calvo Brenes", dot: "x", house: null, loc: "Sin marcar entrada", task: "", dur: "—", start: "—" },
];

// Resumen por proyecto (home del Ingeniero).
export const PROJECT_STATS: ProjectStat[] = [
  { code: "VN", activeHouses: 5, totalHouses: 32, workersToday: 26, workersExpected: 25, foremen: 3 },
  { code: "VC", activeHouses: 3, totalHouses: 24, workersToday: 9, workersExpected: 14, foremen: 2 },
  { code: "VS", activeHouses: 2, totalHouses: 16, workersToday: 6, workersExpected: 8, foremen: 1 },
  { code: "VB", activeHouses: 1, totalHouses: 20, workersToday: 5, workersExpected: 5, foremen: 1 },
  { code: "VI", activeHouses: 0, totalHouses: 8, workersToday: 0, workersExpected: 0, foremen: 0 },
  { code: "VR", activeHouses: 0, totalHouses: 12, workersToday: 0, workersExpected: 0, foremen: 0 },
];
