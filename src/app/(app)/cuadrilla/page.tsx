"use client";

import { useRouter } from "next/navigation";
import { ScreenCuadrilla, type ColaboradorCuadrilla } from "@/marcaje/ScreenCuadrilla";
import { useAuth } from "@/lib/auth";
import { homeForRol } from "@/lib/roles";
import { useEffect, useState } from "react";

export default function CuadrillaPage() {
  const { usuario, logout } = useAuth();
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState<ColaboradorCuadrilla[]>([]);

  // Si el rol no corresponde a esta pantalla, mandar a la suya.
  useEffect(() => {
    if (usuario && homeForRol(usuario.rol) !== "/cuadrilla") {
      router.replace(homeForRol(usuario.rol));
    }
  }, [usuario, router]);

  // Cargar la cuadrilla real del usuario (miembros). Estado/horas se simulan en la UI.
  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await fetch("/api/mi-cuadrilla", { cache: "no-store" });
        if (activo && res.ok) {
          const data = (await res.json()) as { colaboradores: ColaboradorCuadrilla[] };
          setColaboradores(data.colaboradores);
        }
      } catch {
        // sin cuadrilla: la pantalla usa el mock
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  return (
    <ScreenCuadrilla
      nombre={usuario?.nombre ?? "Jefe de Cuadrilla"}
      colaboradores={colaboradores}
      onLogout={() => logout()}
      onReasignar={(ids) =>
        router.push(`/cuadrilla/reasignar?ids=${encodeURIComponent(ids.join(","))}`)
      }
    />
  );
}
