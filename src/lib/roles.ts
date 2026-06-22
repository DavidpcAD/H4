// Mapea el rol del usuario (de dbo.Rol) a la pantalla de inicio.
// Jefe de Cuadrilla(s) / Maestro de Obras → pantalla de cuadrilla.
// Ingeniero Residente (y por defecto admin/otros) → pantalla de ingeniero.

export type HomeRoute = "/cuadrilla" | "/ingeniero";

export function homeForRol(rol: string | null | undefined): HomeRoute {
  const r = (rol ?? "").toLowerCase();
  if (r.includes("cuadrilla") || r.includes("maestro")) return "/cuadrilla";
  return "/ingeniero";
}
