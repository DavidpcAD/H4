"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

/**
 * Bloquea el acceso al contenido si no hay sesión: redirige a /login.
 * Mientras se rehidrata la sesión muestra un estado de carga ligero.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && !usuario) {
      router.replace("/login");
    }
  }, [cargando, usuario, router]);

  if (cargando || !usuario) {
    return (
      <div className="app-shell" style={{ justifyContent: "center", alignItems: "center" }}>
        <p className="muted">Cargando…</p>
      </div>
    );
  }

  return <>{children}</>;
}
