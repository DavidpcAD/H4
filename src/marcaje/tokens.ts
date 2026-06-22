// Sistema visual "Marcaje Adelante" (portado del mockup standalone).
// Paleta: lima Adelante (#ADD010) sobre negro. Tipografía Manrope + JetBrains Mono.

export const T = {
  // Neutros
  black: "#000000",
  ink: "#0a0a0a",
  slate: "#1c1c1c",
  g800: "#2a2a2a",
  g700: "#5a5a5a",
  g500: "#9a9a9a",
  g300: "#d4d4d4",
  g200: "#e8e8e8",
  g100: "#f4f4f4",
  paper: "#f7f7f5",
  white: "#ffffff",

  // Marca Adelante — lima
  lime: "#ADD010",
  limeDk: "#8aa70b",
  limeLt: "#c9e83a",
  limeBg: "rgba(173,208,16,0.12)",
  limeBorder: "rgba(173,208,16,0.35)",
  // alias usados por el código del mockup
  orange: "#ADD010",
  orangeDk: "#8aa70b",
  orangeBg: "rgba(173,208,16,0.14)",
  orangeBorder: "rgba(173,208,16,0.35)",

  // Estados
  green: "#16a34a",
  greenBg: "rgba(22,163,74,0.12)",
  yellow: "#eab308",
  yellowBg: "rgba(234,179,8,0.14)",
  red: "#dc2626",
  redBg: "rgba(220,38,38,0.10)",
  blue: "#2563eb",
  blueBg: "rgba(37,99,235,0.10)",

  // Tipografía
  fontUI: "'Manrope', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', ui-monospace, monospace",

  // Radii
  rCard: 12,
  rInput: 10,
  rTag: 5,
  rPill: 9999,

  // Sombras
  shCard: "0 1px 3px rgba(0,0,0,0.04)",
  shCardHv: "0 8px 24px rgba(0,0,0,0.08)",
  shDevice: "0 30px 60px rgba(0,0,0,0.18)",
  shFocus: "0 0 0 3px rgba(173,208,16,0.20)",
} as const;

export interface Project {
  code: string;
  name: string;
  color: string;
  colorBg: string;
  type: string;
}

export const PROJECTS: Record<string, Project> = {
  VN: { code: "VN", name: "Valle Novarum", color: "#3FA535", colorBg: "rgba(63,165,53,0.12)", type: "condo" },
  VC: { code: "VC", name: "Valle Castilla", color: "#9DCB94", colorBg: "rgba(157,203,148,0.18)", type: "condo" },
  VS: { code: "VS", name: "Valle Santiago", color: "#C7A772", colorBg: "rgba(199,167,114,0.18)", type: "condo" },
  VB: { code: "VB", name: "Valle Bruselas", color: "#F2D047", colorBg: "rgba(242,208,71,0.18)", type: "condo" },
  VI: { code: "VI", name: "Valle Ilios", color: "#F2C94C", colorBg: "rgba(242,201,76,0.18)", type: "condo" },
  VR: { code: "VR", name: "Valle Barani", color: "#A8927E", colorBg: "rgba(168,146,126,0.18)", type: "condo" },
};
