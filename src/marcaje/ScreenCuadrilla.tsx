"use client";

// Pantalla B: Mi Cuadrilla (Jefe de Cuadrilla). Datos simulados (CREW).

import { useState } from "react";
import "./marcaje.css";
import { T } from "./tokens";
import { CREW, type CrewDot, type CrewWorker } from "./mock";
import { Avatar, Btn, LiveDot, SectionHeader, StatCard, WorkerRow } from "./ui";

export interface ColaboradorCuadrilla {
  id: number;
  nombre: string;
}

// Combina los colaboradores reales de la cuadrilla con estado y horas
// SIMULADOS (la BD aún no tiene marcaje). Estado: el último miembro "sin marcar",
// el penúltimo "prestado" y el resto "activos" — solo para mostrar las 3 categorías.
function simularCrew(colaboradores: ColaboradorCuadrilla[]): CrewWorker[] {
  const DUR = ["2h 41m", "2h 33m", "2h 22m", "2h 44m", "2h 18m", "2h 11m"];
  const START = ["06:43", "06:51", "07:02", "06:40", "07:06", "07:13"];
  const HOUSE = ["VN-J.28", "VN-J.30"];
  const TASK = ["1.1.3 Acero Losa", "1.2.1 Estructura Techo"];
  const last = colaboradores.length - 1;

  return colaboradores.map((c, i) => {
    let dot: CrewDot = "g";
    if (colaboradores.length >= 3 && i === last) dot = "x";
    else if (colaboradores.length >= 3 && i === last - 1) dot = "b";

    if (dot === "x")
      return { id: String(c.id), name: c.nombre, dot, house: null, loc: "Sin marcar entrada", task: "", dur: "—", start: "—" };
    if (dot === "b")
      return { id: String(c.id), name: c.nombre, dot, house: null, loc: "→ Otra cuadrilla", task: "Préstamo", dur: "—", start: "VIE" };

    const house = HOUSE[i % HOUSE.length];
    return { id: String(c.id), name: c.nombre, dot, house, loc: house, task: TASK[i % TASK.length], dur: DUR[i % DUR.length], start: START[i % START.length] };
  });
}

export function ScreenCuadrilla({
  nombre = "Don Roberto",
  colaboradores,
  onLogout,
  onReasignar,
}: {
  nombre?: string;
  colaboradores?: ColaboradorCuadrilla[];
  onLogout?: () => void;
  onReasignar?: (ids: string[]) => void;
}) {
  const cardBg = T.white;
  const border = T.g200;

  // Miembros reales de la cuadrilla (con estado/horas simulados). Si no hay
  // cuadrilla cargada todavía, se usa el mock para no dejar la pantalla vacía.
  const crew = colaboradores && colaboradores.length > 0 ? simularCrew(colaboradores) : CREW;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const counts = {
    active: crew.filter((w) => w.dot === "g").length,
    pending: crew.filter((w) => w.dot === "x").length,
    lent: crew.filter((w) => w.dot === "b").length,
  };

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
          <Avatar initials={ini} size={36} onClick={onLogout} title="Cerrar sesión" />
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "12px 14px", display: "flex", gap: 8 }}>
        <StatCard dark label="ACTIVOS" value={counts.active} />
        <StatCard label="SIN MARCAR" value={counts.pending} />
        <StatCard label="PRESTADOS" value={counts.lent} />
      </div>

      {/* Section header */}
      <div style={{ padding: "4px 14px 6px" }}>
        <SectionHeader badge={`${crew.length} TOTAL`}>MI CUADRILLA</SectionHeader>
      </div>

      {/* Crew list */}
      <div className="mk-scroll" style={{ flex: 1, overflowY: "auto", padding: "0 14px 96px", display: "flex", flexDirection: "column", gap: 8 }}>
        {crew.map((w) => (
          <WorkerRow key={w.id} w={w} selected={selected.has(w.id)} onClick={() => toggle(w.id)} />
        ))}
        <div style={{ marginTop: 8, fontFamily: T.fontMono, fontSize: 10, color: T.g500, textAlign: "center", letterSpacing: 1 }}>
          — Tocá para seleccionar —
        </div>
      </div>

      {/* Action bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 14px 14px", background: cardBg, borderTop: `1px solid ${border}`, display: "flex", gap: 8 }}>
        <Btn kind="primary" full disabled={selected.size === 0} onClick={() => onReasignar?.([...selected])}>
          {selected.size > 0 ? `Reasignar (${selected.size})` : "Reasignar"}
        </Btn>
        <Btn kind="ghost" full>Más</Btn>
      </div>
    </div>
  );
}
