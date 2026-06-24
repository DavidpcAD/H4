"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ScreenPrestar, type CuadrillaOpcion, type PrestamoPayload } from "@/marcaje/ScreenPrestar";
import { toCrewList, type MiembroEstado } from "@/marcaje/crew";
import type { CrewWorker } from "@/marcaje/mock";

function PrestarInner() {
  const router = useRouter();
  const params = useSearchParams();
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean);

  const [seleccionados, setSeleccionados] = useState<CrewWorker[]>([]);
  const [cuadrillaOrigen, setCuadrillaOrigen] = useState<{ id: number; nombre: string } | null>(null);
  const [cuadrillas, setCuadrillas] = useState<CuadrillaOpcion[]>([]);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const mc = await fetch("/api/mi-cuadrilla", { cache: "no-store" });
        if (activo && mc.ok) {
          const data = (await mc.json()) as { cuadrilla: { id: number; nombre: string } | null; colaboradores: MiembroEstado[] };
          setCuadrillaOrigen(data.cuadrilla);
          setSeleccionados(toCrewList(data.colaboradores).filter((w) => ids.includes(w.id)));
        }
        const cu = await fetch("/api/cuadrillas", { cache: "no-store" });
        if (activo && cu.ok) {
          const data = (await cu.json()) as { cuadrillas: CuadrillaOpcion[] };
          setCuadrillas(data.cuadrillas);
        }
      } catch {
        // catálogos no disponibles
      }
    })();
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (p: PrestamoPayload) => {
    try {
      const res = await fetch("/api/prestamos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, colaboradorIds: ids.map(Number) }),
      });
      if (res.ok) router.push("/cuadrilla");
      else alert("No se pudo crear la solicitud de préstamo.");
    } catch {
      alert("No se pudo contactar al servidor.");
    }
  };

  // Destino: todas las cuadrillas menos la propia.
  const destinos = cuadrillas.filter((c) => c.id !== cuadrillaOrigen?.id);

  return (
    <ScreenPrestar
      seleccionados={seleccionados}
      cuadrillaOrigen={cuadrillaOrigen?.nombre ?? "Mi cuadrilla"}
      cuadrillas={destinos}
      onCancel={() => router.push("/cuadrilla")}
      onSubmit={onSubmit}
    />
  );
}

export default function PrestarPage() {
  return (
    <Suspense fallback={null}>
      <PrestarInner />
    </Suspense>
  );
}
