"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenCasasProyecto, type Casa } from "@/marcaje/ScreenCasasProyecto";
import { ScreenCasaDetalle, type CasaDetalle } from "@/marcaje/ScreenCasaDetalle";

export default function ProyectoPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const codeUp = code.toUpperCase();
  const [casas, setCasas] = useState<Casa[]>([]);
  const [casaSel, setCasaSel] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<CasaDetalle | null>(null);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await fetch(`/api/casas?code=${encodeURIComponent(code)}`, { cache: "no-store" });
        if (activo && res.ok) {
          const data = (await res.json()) as { casas: Casa[] };
          setCasas(data.casas);
        }
      } catch {
        // sin datos
      }
    })();
    return () => {
      activo = false;
    };
  }, [code]);

  // Detalle de la casa seleccionada.
  useEffect(() => {
    if (!casaSel) {
      setDetalle(null);
      return;
    }
    let activo = true;
    (async () => {
      try {
        const res = await fetch(`/api/casa?obra=${encodeURIComponent(casaSel)}`, { cache: "no-store" });
        if (activo && res.ok) setDetalle((await res.json()) as CasaDetalle);
      } catch {
        // sin datos
      }
    })();
    return () => {
      activo = false;
    };
  }, [casaSel]);

  return (
    <>
      <ScreenCasasProyecto code={codeUp} casas={casas} onBack={() => router.push("/ingeniero")} onCasa={setCasaSel} />
      {casaSel && (
        <div style={{ position: "absolute", inset: 0, zIndex: 100 }}>
          <ScreenCasaDetalle
            code={codeUp}
            detalle={detalle}
            onClose={() => setCasaSel(null)}
            onReasignar={(ids) =>
              router.push(`/ingeniero/proyecto/${codeUp}/reasignar?obra=${encodeURIComponent(casaSel)}&ids=${encodeURIComponent(ids.join(","))}`)
            }
          />
        </div>
      )}
    </>
  );
}
