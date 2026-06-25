"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenReasignar, type Subpartida, type Proyecto, type Obra } from "@/marcaje/ScreenReasignar";
import type { CasaDetalle } from "@/marcaje/ScreenCasaDetalle";
import type { CrewWorker } from "@/marcaje/mock";

function ReasignarInner({ code }: { code: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const obra = params.get("obra") ?? "";
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean);
  const volver = `/ingeniero/proyecto/${code}`;

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
        // catálogo no disponible
      }
    };
    cargar<Subpartida>("/api/subpartidas", "subpartidas", setSubpartidas);
    cargar<Proyecto>("/api/proyectos", "proyectos", setProyectos);
    cargar<Obra>("/api/obras", "obras", setObras);

    // Resolver los trabajadores seleccionados desde el detalle de la casa.
    (async () => {
      try {
        const res = await fetch(`/api/casa?obra=${encodeURIComponent(obra)}`, { cache: "no-store" });
        if (activo && res.ok) {
          const d = (await res.json()) as CasaDetalle;
          const crew: CrewWorker[] = d.workers
            .filter((w) => ids.includes(w.id))
            .map((w) => ({
              id: w.id,
              name: w.nombre,
              dot: "g",
              house: d.house,
              loc: d.house,
              task: d.task ?? "",
              dur: "",
              start: "",
            }));
          setSeleccionados(crew);
        }
      } catch {
        // sin detalle
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
      onBack={() => router.push(volver)}
      onConfirm={() => router.push(volver)}
    />
  );
}

export default function ReasignarProyectoPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  return (
    <Suspense fallback={null}>
      <ReasignarInner code={code.toUpperCase()} />
    </Suspense>
  );
}
