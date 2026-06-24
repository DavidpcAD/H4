"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenReasignar, type Subpartida, type Proyecto, type Obra } from "@/marcaje/ScreenReasignar";
import { toCrewList, type MiembroEstado } from "@/marcaje/crew";
import type { CrewWorker } from "@/marcaje/mock";

function ReasignarInner() {
  const router = useRouter();
  const params = useSearchParams();
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean);

  const [subpartidas, setSubpartidas] = useState<Subpartida[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [seleccionados, setSeleccionados] = useState<CrewWorker[]>([]);

  useEffect(() => {
    let activo = true;
    const cargar = async <T,>(url: string, key: string, set: (v: T[]) => void) => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (activo && res.ok) {
          const data = (await res.json()) as Record<string, T[]>;
          set(data[key] ?? []);
        }
      } catch {
        // catálogo no disponible: el dropdown queda vacío
      }
    };
    cargar<Subpartida>("/api/subpartidas", "subpartidas", setSubpartidas);
    cargar<Proyecto>("/api/proyectos", "proyectos", setProyectos);
    cargar<Obra>("/api/obras", "obras", setObras);

    // Resolver los trabajadores seleccionados con la cuadrilla real del usuario.
    (async () => {
      try {
        const res = await fetch("/api/mi-cuadrilla", { cache: "no-store" });
        if (activo && res.ok) {
          const data = (await res.json()) as { colaboradores: MiembroEstado[] };
          const crew = toCrewList(data.colaboradores);
          setSeleccionados(crew.filter((w) => ids.includes(w.id)));
        }
      } catch {
        // sin cuadrilla
      }
    })();
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScreenReasignar
      seleccionados={seleccionados}
      subpartidas={subpartidas}
      proyectos={proyectos}
      obras={obras}
      onBack={() => router.push("/cuadrilla")}
      onConfirm={() => router.push("/cuadrilla")}
    />
  );
}

export default function ReasignarPage() {
  return (
    <Suspense fallback={null}>
      <ReasignarInner />
    </Suspense>
  );
}
