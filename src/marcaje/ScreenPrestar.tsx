"use client";

// Pantalla D: Prestar trabajador(es) a otra cuadrilla. Crea una solicitud
// (cabecera + detalle) que el jefe destino debe aceptar.

import { useState } from "react";
import "./marcaje.css";
import { T } from "./tokens";
import type { CrewWorker } from "./mock";
import { Btn, CapsLabel, DateInput, Field, Select, SectionHeader, Textarea, WorkerRow } from "./ui";

export interface CuadrillaOpcion {
  id: number;
  nombre: string;
  lider?: string | null;
}

export interface PrestamoPayload {
  idCuadrillaDestino: number;
  fechaDesde: string;
  fechaHasta: string;
  motivo: string;
}

export function ScreenPrestar({
  seleccionados = [],
  cuadrillaOrigen = "Mi cuadrilla",
  cuadrillas = [],
  onCancel,
  onSubmit,
}: {
  seleccionados?: CrewWorker[];
  cuadrillaOrigen?: string;
  cuadrillas?: CuadrillaOpcion[];
  onCancel?: () => void;
  onSubmit?: (p: PrestamoPayload) => void;
}) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [destinoId, setDestinoId] = useState<string>("");
  const [desde, setDesde] = useState<string>(hoy);
  const [hasta, setHasta] = useState<string>(hoy);
  const [motivo, setMotivo] = useState<string>("");
  const [enviando, setEnviando] = useState(false);

  const n = seleccionados.length;
  const destino = cuadrillas.find((c) => String(c.id) === destinoId) ?? cuadrillas[0];
  // En el préstamo se elige al líder de la cuadrilla destino (no la cuadrilla).
  const liderDe = (c?: CuadrillaOpcion) => (c?.lider?.trim() ? c.lider.trim() : c?.nombre ?? "");
  const puede = !!destino && !!desde && !!hasta && hasta >= desde && motivo.trim() !== "" && !enviando;

  const enviar = () => {
    if (!puede || !destino) return;
    setEnviando(true);
    onSubmit?.({ idCuadrillaDestino: destino.id, fechaDesde: desde, fechaHasta: hasta, motivo: motivo.trim() });
  };

  return (
    <div className="mk-phone" style={{ background: T.paper, fontFamily: T.fontUI, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", background: T.white, borderBottom: `1px solid ${T.g200}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 13, color: T.g700 }}>Préstamo</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: T.ink, marginTop: 1 }}>
              {n} {n === 1 ? "trabajador" : "trabajadores"}
            </div>
            <div style={{ fontSize: 12, color: T.g700, marginTop: 2 }}>{cuadrillaOrigen}</div>
          </div>
          <button onClick={onCancel} aria-label="Cerrar" style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${T.g300}`, background: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mk-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 14px 100px" }}>
        {/* Seleccionados */}
        <SectionHeader badge={String(n)}>TRABAJADORES</SectionHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
          {seleccionados.map((w) => (
            <WorkerRow key={w.id} w={w} selected dense />
          ))}
        </div>

        {/* Form */}
        <div style={{ marginTop: 14 }}>
          <Field label="Prestar a" hint={cuadrillas.length ? undefined : "Cargando líderes…"}>
            <Select
              value={destino ? String(destino.id) : ""}
              onChange={setDestinoId}
              placeholder="Elegí el líder de cuadrilla"
              options={cuadrillas.map((c) => ({ value: String(c.id), label: liderDe(c) }))}
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Desde"><DateInput value={desde} onChange={setDesde} /></Field>
            <Field label="Hasta"><DateInput value={hasta} onChange={setHasta} /></Field>
          </div>
          <Field label="Motivo">
            <Textarea value={motivo} onChange={setMotivo} placeholder="Ej. Apoyo techado VN-J.30" />
          </Field>
        </div>

        {/* ¿Qué pasará? */}
        <div style={{ marginTop: 8, padding: 14, background: T.g100, borderRadius: T.rCard, border: `1px solid ${T.g200}` }}>
          <CapsLabel style={{ marginBottom: 10 }}>¿QUÉ PASARÁ?</CapsLabel>
          {[
            `${destino ? liderDe(destino) : "El líder destino"} verá a ${n === 1 ? "este trabajador" : "estos trabajadores"} en su cuadrilla durante el préstamo.`,
            "El líder destino podrá reasignarlos entre subpartidas.",
            "Las horas se cargan al proyecto donde trabajen (no afecta tu costeo).",
            "Al terminar el rango, regresan automáticamente a tu cuadrilla.",
          ].map((line, i, arr) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < arr.length - 1 ? 8 : 0 }}>
              <span style={{ fontFamily: T.fontMono, color: T.orange, fontWeight: 700, flexShrink: 0 }}>→</span>
              <span style={{ fontSize: 13, color: T.ink, lineHeight: 1.45 }}>{line}</span>
            </div>
          ))}
        </div>

        {/* Aviso de aceptación */}
        <div style={{ marginTop: 12, padding: "10px 12px", background: T.yellowBg, borderRadius: 8, border: `1px solid ${T.yellow}33`, display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ color: T.yellow, fontWeight: 800, fontSize: 14 }}>⚠</span>
          <span style={{ fontSize: 12, color: T.slate, fontWeight: 600 }}>
            El líder destino recibirá una notificación. Puede aceptar o rechazar la solicitud.
          </span>
        </div>
      </div>

      {/* Action bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 14px 14px", background: T.white, borderTop: `1px solid ${T.g200}`, display: "flex", gap: 8 }}>
        <Btn kind="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn kind="primary" full disabled={!puede} onClick={enviar}>
          {enviando ? "Enviando…" : "Solicitar préstamo"}
        </Btn>
      </div>
    </div>
  );
}
