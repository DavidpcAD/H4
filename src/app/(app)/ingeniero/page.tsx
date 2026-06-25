"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ScreenIngeniero } from "@/marcaje/ScreenIngeniero";
import type { ProjectStat } from "@/marcaje/mock";
import { useAuth } from "@/lib/auth";
import { homeForRol } from "@/lib/roles";

export default function IngenieroPage() {
  const { usuario, logout } = useAuth();
  const router = useRouter();
  const [proyectos, setProyectos] = useState<ProjectStat[]>([]);

  useEffect(() => {
    if (usuario && homeForRol(usuario.rol) !== "/ingeniero") {
      router.replace(homeForRol(usuario.rol));
    }
  }, [usuario, router]);

  // Resumen real por proyecto (en obra / casas / jefes). Si falla, la pantalla
  // usa el mock para no quedar vacía.
  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await fetch("/api/proyectos-resumen", { cache: "no-store" });
        if (activo && res.ok) {
          const data = (await res.json()) as { proyectos: ProjectStat[] };
          setProyectos(data.proyectos);
        }
      } catch {
        // sin datos: la pantalla usa el mock
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  return (
    <ScreenIngeniero
      nombre={usuario?.nombre ?? "Ingeniero Residente"}
      proyectos={proyectos}
      onLogout={() => logout()}
      onProject={(code) => router.push(`/ingeniero/proyecto/${code}`)}
    />
  );
}
