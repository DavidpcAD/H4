"use client";

// F1: Home del Ingeniero Residente — lista de proyectos (Valles).
// NOTA: por pedido, se omiten por ahora las funciones de ALERTAS y EN VIVO
// (no se muestra el pill "EN VIVO" ni el StatCard/badge de alertas).

import "./marcaje.css";
import { T, PROJECTS, type Project } from "./tokens";
import { PROJECT_STATS, type ProjectStat } from "./mock";
import { AdelanteLogo, StatCard, UserMenu } from "./ui";

export function ScreenIngeniero({
  nombre = "Ing. José Vargas",
  proyectos,
  onLogout,
  onProject,
}: {
  nombre?: string;
  proyectos?: ProjectStat[];
  onLogout?: () => void;
  onProject?: (code: string) => void;
}) {
  const cardBg = T.white;
  const border = T.g200;

  // Datos reales por proyecto desde la BD; si aún no cargan, se usa el mock
  // para no dejar la pantalla vacía.
  const stats = proyectos && proyectos.length > 0 ? proyectos : PROJECT_STATS;
  const total = stats.reduce((s, p) => s + p.workersToday, 0);
  const hasExpected = stats.every((p) => typeof p.workersExpected === "number");
  const expected = stats.reduce((s, p) => s + (p.workersExpected ?? 0), 0);
  const housesActive = stats.reduce((s, p) => s + p.activeHouses, 0);

  const ini = nombre.replace(/^Ing\.?\s*/i, "").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="mk-phone" style={{ color: T.ink, fontFamily: T.fontUI, display: "flex", flexDirection: "column" }}>
      {/* Header negro */}
      <div style={{ background: T.black, color: T.white, padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AdelanteLogo size={20} />
              <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.lime, letterSpacing: 2.5, fontWeight: 700 }}>INGENIERO RESIDENTE</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4, marginTop: 8 }}>{nombre}</div>
          </div>
          <UserMenu initials={ini} nombre={nombre} rol="INGENIERO RESIDENTE" size={36} dark onLogout={onLogout} />
        </div>
      </div>

      {/* Stats globales (sin ALERTAS) */}
      <div style={{ padding: "12px 14px 6px", display: "flex", gap: 8 }}>
        <StatCard dark label="EN OBRA" value={total} sub={hasExpected ? `/${expected} esperados` : undefined} />
        <StatCard label="CASAS" value={housesActive} />
      </div>

      {/* Section header */}
      <div style={{ padding: "14px 18px 6px" }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.g700, letterSpacing: 2, fontWeight: 700 }}>
          PROYECTOS — {stats.filter((p) => p.workersToday > 0).length} ACTIVOS HOY
        </div>
      </div>

      {/* Lista de proyectos */}
      <div className="mk-scroll" style={{ flex: 1, overflowY: "auto", padding: "4px 14px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        {stats.map((s) => (
          <ProjectCard key={s.code} stat={s} project={projectOf(s)} cardBg={cardBg} border={border} onClick={onProject} />
        ))}
        <div style={{ marginTop: 6, fontFamily: T.fontMono, fontSize: 10, color: T.g500, textAlign: "center", letterSpacing: 1 }}>
          — Tap en un proyecto para ver casas activas —
        </div>
      </div>
    </div>
  );
}

// Proyecto para pintar la tarjeta: usa nombre/color que vienen del dato real;
// si no, cae al catálogo estático PROJECTS por código.
function projectOf(s: ProjectStat): Project {
  const base: Project = PROJECTS[s.code] ?? { code: s.code, name: s.code, color: T.g500, colorBg: T.g200, type: "condo" };
  return {
    ...base,
    name: s.name ?? base.name,
    color: s.color ?? base.color,
  };
}

function ProjectCard({ stat, project, cardBg, border, onClick }: { stat: ProjectStat; project: Project; cardBg: string; border: string; onClick?: (code: string) => void }) {
  const isInactive = stat.workersToday === 0;
  const hasExpected = typeof stat.workersExpected === "number";
  const delta = hasExpected ? stat.workersToday - (stat.workersExpected as number) : 0;
  const deltaColor = delta < 0 ? T.red : delta > 0 ? T.blue : T.green;

  return (
    <div
      onClick={isInactive ? undefined : () => onClick?.(stat.code)}
      style={{
        background: cardBg, border: `1px solid ${border}`, borderLeft: `3px solid ${project.color}`,
        borderRadius: T.rCard, padding: "14px 16px", cursor: isInactive ? "default" : "pointer",
        opacity: isInactive ? 0.55 : 1, boxShadow: T.shCard, position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ padding: "2px 7px", background: project.color, borderRadius: 4, fontFamily: T.fontMono, fontSize: 11, fontWeight: 800, color: "#0a0a0a", letterSpacing: 1 }}>{stat.code}</div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginTop: 6, letterSpacing: -0.3 }}>{project.name}</div>

          {!isInactive ? (
            <div style={{ marginTop: 10, display: "flex", alignItems: "baseline", gap: 14 }}>
              <KPI value={stat.workersToday} label="EN OBRA" delta={delta} deltaColor={deltaColor} />
              <VDivider />
              <KPI value={stat.activeHouses} sub={`/${stat.totalHouses}`} label="CASAS ACT." />
              <VDivider />
              <KPI value={stat.foremen} label="JEFES" />
            </div>
          ) : (
            <div style={{ marginTop: 10, fontFamily: T.fontMono, fontSize: 11, color: T.g700, letterSpacing: 0.4 }}>
              SIN ACTIVIDAD HOY · {stat.totalHouses} CASAS PROGRAMADAS
            </div>
          )}
        </div>

        {!isInactive && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginTop: 4, flexShrink: 0 }}>
            <path d="M6 4l4 4-4 4" stroke={T.ink} strokeOpacity="0.4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  );
}

function KPI({ value, sub, label, delta, deltaColor }: { value: number; sub?: string; label: string; delta?: number; deltaColor?: string }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{ fontFamily: T.fontMono, fontSize: 22, fontWeight: 800, color: T.ink, letterSpacing: -0.5, lineHeight: 1 }}>{value}</span>
        {sub && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.g700, fontWeight: 600 }}>{sub}</span>}
        {typeof delta === "number" && delta !== 0 && (
          <span style={{ fontFamily: T.fontMono, fontSize: 10, color: deltaColor, fontWeight: 700, marginLeft: 2 }}>{delta > 0 ? "+" : ""}{delta}</span>
        )}
      </div>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.g700, letterSpacing: 1.2, fontWeight: 700, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function VDivider() {
  return <div style={{ width: 1, height: 24, background: T.g200 }} />;
}
