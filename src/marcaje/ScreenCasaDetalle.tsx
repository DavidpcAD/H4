"use client";

// F3: Detalle de Casa — personal en obra de una casa. Hoja inferior que se
// abre al tocar una casa en la vista de proyecto (Ingeniero). Portada del
// mockup Marcaje. NOTA: el % de progreso de plan no existe en BD aún, así que
// se muestran las horas-hombre acumuladas reales sin la barra de avance.

import { useState } from "react";
import "./marcaje.css";
import { T, PROJECTS, type Project } from "./tokens";
import { Avatar, Btn } from "./ui";

export interface CasaWorker {
  id: string;
  nombre: string;
  entradaUtc: string | null;
  tramoInicioUtc: string | null;
}

export interface CasaDetalle {
  house: string;
  task: string | null;
  foreman: string | null;
  expected: number;
  workers: CasaWorker[];
}

function fmtHora(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Costa_Rica" });
}

function minutos(iso: string | null): number {
  if (!iso) return 0;
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

function fmtDur(mins: number): string {
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`;
}

function iniciales(nombre: string): string {
  return nombre.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export function ScreenCasaDetalle({
  code,
  detalle,
  onClose,
  onReasignar,
}: {
  code: string;
  detalle: CasaDetalle | null;
  onClose?: () => void;
  onReasignar?: (ids: string[]) => void;
}) {
  const project: Project = PROJECTS[code] ?? { code, name: code, color: T.g500, colorBg: T.g200, type: "condo" };
  const border = T.g200;
  const workers = detalle?.workers ?? [];
  const hhMin = workers.reduce((s, w) => s + minutos(w.tramoInicioUtc), 0);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const nSel = selected.size;

  return (
    <div style={{ background: "rgba(0,0,0,0.55)", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", fontFamily: T.fontUI }}>
      {/* Sheet */}
      <div style={{ background: T.white, borderTopLeftRadius: 18, borderTopRightRadius: 18, height: "88%", display: "flex", flexDirection: "column", boxShadow: "0 -16px 48px rgba(0,0,0,0.35)", overflow: "hidden" }}>
        {/* Drag handle */}
        <div style={{ padding: "10px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: T.g300 }} />
        </div>

        {/* Header */}
        <div style={{ padding: "12px 18px 14px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ padding: "2px 7px", background: project.color, borderRadius: 4, fontFamily: T.fontMono, fontSize: 10, fontWeight: 800, color: "#0a0a0a", letterSpacing: 1 }}>{code}</div>
              <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.green, letterSpacing: 0.6, fontWeight: 700 }}>
                ● {detalle?.house ?? ""} · {workers.length} EN OBRA
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, marginTop: 8, letterSpacing: -0.3 }}>
              {detalle?.task ?? "—"}
            </div>
            <div style={{ fontSize: 12, color: T.g700, marginTop: 3 }}>
              Jefe: <span style={{ color: T.ink, fontWeight: 700 }}>{detalle?.foreman ?? "—"}</span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{ width: 32, height: 32, borderRadius: 16, border: `1px solid ${border}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6" stroke={T.ink} strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Progreso HH (horas-hombre acumuladas hoy) */}
        <div style={{ padding: "14px 18px", background: T.g100, borderBottom: `1px solid ${border}` }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.g700, letterSpacing: 1.5, fontWeight: 700 }}>HH ACUMULADAS HOY</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
            <span style={{ fontFamily: T.fontMono, fontSize: 24, fontWeight: 800, color: T.ink, letterSpacing: -0.5 }}>{fmtDur(hhMin)}</span>
            <span style={{ fontFamily: T.fontMono, fontSize: 12, color: T.g700 }}>{workers.length}/{detalle?.expected ?? 0} asignados</span>
          </div>
        </div>

        {/* Personal en casa */}
        <div style={{ padding: "14px 18px 6px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.g700, letterSpacing: 2, fontWeight: 700 }}>PERSONAL EN CASA</div>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.g700 }}>{workers.length} ACTIVOS</div>
        </div>

        <div className="mk-scroll" style={{ flex: 1, overflowY: "auto", padding: "4px 18px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
          {workers.length === 0 ? (
            <div style={{ marginTop: 16, textAlign: "center", fontFamily: T.fontMono, fontSize: 11, color: T.g500, letterSpacing: 1 }}>— Sin personal en obra —</div>
          ) : (
            workers.map((w) => {
              const sel = selected.has(w.id);
              return (
                <div
                  key={w.id}
                  onClick={onReasignar ? () => toggle(w.id) : undefined}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                    background: sel ? T.orangeBg : T.paper,
                    border: `1px solid ${sel ? T.orange : border}`, borderRadius: 10,
                    cursor: onReasignar ? "pointer" : "default", transition: "all 150ms",
                    boxShadow: sel ? T.shFocus : "none",
                  }}
                >
                  <Avatar initials={iniciales(w.nombre)} size={36} accent={sel} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.nombre}</div>
                    <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.g700, marginTop: 2 }}>
                      ENT {fmtHora(w.entradaUtc)} · {fmtDur(minutos(w.tramoInicioUtc))}
                    </div>
                  </div>
                  {sel ? (
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: T.orange, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6.5L4.8 9.2L10 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  ) : (
                    <div style={{ padding: "3px 7px", background: T.greenBg, color: T.green, fontFamily: T.fontMono, fontSize: 9, fontWeight: 800, letterSpacing: 0.6, borderRadius: 4, border: `1px solid ${T.green}` }}>
                      ● ACTIVO
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Barra de acción — reasignar (como en la vista de jefe de cuadrilla) */}
        {onReasignar && workers.length > 0 && (
          <div style={{ padding: "10px 14px 16px", borderTop: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, fontFamily: T.fontMono, fontSize: 11, color: T.g700, letterSpacing: 0.3 }}>
              {nSel > 0 ? `${nSel} seleccionado${nSel > 1 ? "s" : ""}` : "Tocá para seleccionar"}
            </div>
            <Btn kind="primary" disabled={nSel === 0} onClick={() => onReasignar([...selected])}>
              Reasignar personal
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
