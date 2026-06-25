"use client";

// Pantalla B: Mi Cuadrilla (Jefe de Cuadrilla). Datos simulados (CREW).

import { useState } from "react";
import "./marcaje.css";
import { T } from "./tokens";
import { CREW, type CrewWorker } from "./mock";
import { toCrewList, type MiembroEstado } from "./crew";
import { Btn, HouseWorkerRow, LiveDot, StatCard, UserMenu, WorkerRow } from "./ui";

export type { MiembroEstado } from "./crew";

export function ScreenCuadrilla({
  nombre = "Don Roberto",
  colaboradores,
  onLogout,
  onReasignar,
  onPrestar,
}: {
  nombre?: string;
  colaboradores?: MiembroEstado[];
  onLogout?: () => void;
  onReasignar?: (ids: string[]) => void;
  onPrestar?: (ids: string[]) => void;
}) {
  const cardBg = T.white;
  const border = T.g200;
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Miembros reales de la cuadrilla con estado/horas desde la BD. Si no hay
  // cuadrilla cargada todavía, se usa el mock para no dejar la pantalla vacía.
  const crew = colaboradores && colaboradores.length > 0 ? toCrewList(colaboradores) : CREW;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"flat" | "byHouse">("flat");

  // No se puede reasignar/prestar a quien está comprometido en un préstamo:
  // 'b' = prestado a otra cuadrilla (activo allá), o prestado entrante (temporal).
  // Evita conflictos (doble asignación, re-préstamo).
  const bloqueado = (w: CrewWorker) => w.dot === "b" || !!w.prestado || !!w.prestadoSaliente;

  const toggle = (id: string) => {
    const w = crew.find((x) => x.id === id);
    if (w && bloqueado(w)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const counts = {
    active: crew.filter((w) => w.dot === "g").length,
    pending: crew.filter((w) => w.dot === "x").length,
    lent: crew.filter((w) => w.dot === "b").length,
  };

  // Agrupado por casa (obra). Trabajadores sin casa → grupo "SIN ASIGNAR".
  const byHouse = (() => {
    const groups: Record<string, typeof crew> = {};
    const orphans: typeof crew = [];
    crew.forEach((w) => {
      if (w.house) (groups[w.house] = groups[w.house] ?? []).push(w);
      else orphans.push(w);
    });
    const ordered = Object.keys(groups).sort().map((h) => ({ house: h, workers: groups[h] }));
    return { ordered, orphans };
  })();

  const ini = nombre.split(" ").map((p) => p[0]).slice(-2).join("").toUpperCase();

  return (
    <div className="mk-phone" style={{ color: T.ink, fontFamily: T.fontUI, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px 10px", background: cardBg, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, color: T.g700 }}>Buenos días</div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4, marginTop: 1 }}>{nombre}</div>
          <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.orange, fontWeight: 700, letterSpacing: 2, marginTop: 2 }}>JEFE DE CUADRILLA</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LiveDot size={7} />
          <UserMenu initials={ini} nombre={nombre} rol="JEFE DE CUADRILLA" size={36} onLogout={onLogout} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "12px 14px", display: "flex", gap: 8 }}>
        <StatCard dark label="ACTIVOS" value={counts.active} />
        <StatCard label="SIN MARCAR" value={counts.pending} />
        <StatCard label="PRESTADOS" value={counts.lent} />
      </div>

      {/* Section header: toggle de vista (izquierda) + conteo (derecha) */}
      <div style={{ padding: "4px 14px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "inline-flex", border: `1px solid ${T.g300}`, borderRadius: T.rPill, overflow: "hidden" }}>
          {([["flat", "Lista"], ["byHouse", "Por casa"]] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: "6px 14px", border: "none", cursor: "pointer",
                fontFamily: T.fontUI, fontWeight: 700, fontSize: 12,
                background: view === v ? T.orange : T.white,
                color: view === v ? T.black : T.g700,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <span style={{ fontFamily: T.fontMono, fontSize: 10, fontWeight: 700, color: T.g700, background: T.g100, padding: "3px 7px", borderRadius: 4, letterSpacing: 0.5 }}>
          {view === "byHouse" ? `${byHouse.ordered.length} CASAS` : `${crew.length} TOTAL`}
        </span>
      </div>

      {/* Crew list */}
      <div className="mk-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 14px 96px", display: "flex", flexDirection: "column", gap: view === "byHouse" ? 14 : 8 }}>
        {view === "flat" &&
          crew.map((w) => (
            <WorkerRow key={w.id} w={w} selected={selected.has(w.id)} onClick={bloqueado(w) ? undefined : () => toggle(w.id)} />
          ))}

        {view === "byHouse" && (
          <>
            {byHouse.ordered.map(({ house, workers }) => {
              const tasks = [...new Set(workers.map((w) => w.task).filter(Boolean))];
              const multi = tasks.length > 1;
              // Si hay varias subpartidas en la obra, agrupar trabajadores por subpartida.
              const grupos = multi
                ? [...new Set(workers.map((w) => w.task))].sort().map((task) => ({
                    task,
                    ws: workers.filter((w) => w.task === task),
                  }))
                : null;
              return (
                <div key={house} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: T.rCard, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", background: T.paper, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontFamily: T.fontMono, fontSize: 13, fontWeight: 700, color: T.orange, letterSpacing: 0.5 }}>{house}</span>
                      <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.g700, letterSpacing: 1 }}>
                        {workers.length} {workers.length === 1 ? "TRABAJADOR" : "TRABAJADORES"}
                      </span>
                    </div>
                    {/* Si todos comparten subpartida, se muestra a la derecha. */}
                    {!multi && tasks.length === 1 && (
                      <span style={{ fontFamily: T.fontMono, fontSize: 10, color: T.g700, letterSpacing: 0.3, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {tasks[0]}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "4px 8px 8px" }}>
                    {multi
                      ? grupos!.map(({ task, ws }) => (
                          <div key={task || "—"}>
                            <div style={{ padding: "8px 8px 3px", fontFamily: T.fontMono, fontSize: 10.5, fontWeight: 700, color: T.g500, letterSpacing: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {task || "Sin subpartida"}
                            </div>
                            {ws.map((w) => (
                              <HouseWorkerRow key={w.id} w={w} selected={selected.has(w.id)} onClick={bloqueado(w) ? undefined : () => toggle(w.id)} />
                            ))}
                          </div>
                        ))
                      : workers.map((w) => (
                          <HouseWorkerRow key={w.id} w={w} selected={selected.has(w.id)} onClick={bloqueado(w) ? undefined : () => toggle(w.id)} />
                        ))}
                  </div>
                </div>
              );
            })}

            {byHouse.orphans.length > 0 && (
              <div style={{ background: cardBg, border: `1px dashed ${border}`, borderRadius: T.rCard, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${border}` }}>
                  <span style={{ fontFamily: T.fontMono, fontSize: 11, fontWeight: 700, color: T.g700, letterSpacing: 1 }}>SIN ASIGNAR</span>
                </div>
                <div style={{ padding: "4px 8px 8px" }}>
                  {byHouse.orphans.map((w) => (
                    <HouseWorkerRow key={w.id} w={w} selected={selected.has(w.id)} onClick={() => toggle(w.id)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: 8, fontFamily: T.fontMono, fontSize: 10, color: T.g500, textAlign: "center", letterSpacing: 1 }}>
          — Tocá para seleccionar —
        </div>
      </div>

      {/* Menú "Más" */}
      {menuAbierto && (
        <>
          <div onClick={() => setMenuAbierto(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 5 }} />
          <div style={{ position: "absolute", left: 14, right: 14, bottom: 84, zIndex: 6, background: cardBg, borderRadius: T.rCard, border: `1px solid ${border}`, boxShadow: T.shCardHv, overflow: "hidden" }}>
            <button
              onClick={() => { setMenuAbierto(false); if (selected.size > 0) onPrestar?.([...selected]); }}
              disabled={selected.size === 0}
              style={{
                width: "100%", textAlign: "left", padding: "14px 16px", border: "none", background: "transparent",
                fontFamily: T.fontUI, fontWeight: 700, fontSize: 15,
                color: selected.size > 0 ? T.ink : T.g500, cursor: selected.size > 0 ? "pointer" : "not-allowed",
              }}
            >
              Prestar a otra cuadrilla{selected.size > 0 ? ` (${selected.size})` : ""}
            </button>
          </div>
        </>
      )}

      {/* Action bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 14px 14px", background: cardBg, borderTop: `1px solid ${border}`, display: "flex", gap: 8, zIndex: 6 }}>
        <Btn kind="primary" full disabled={selected.size === 0} onClick={() => onReasignar?.([...selected])}>
          {selected.size > 0 ? `Reasignar (${selected.size})` : "Reasignar"}
        </Btn>
        <Btn kind="ghost" full onClick={() => setMenuAbierto((v) => !v)}>Más</Btn>
      </div>
    </div>
  );
}
