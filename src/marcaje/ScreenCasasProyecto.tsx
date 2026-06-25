"use client";

// F2: Vista de Proyecto — lista de CASAS (obras) de un proyecto con su estado
// hoy (OK / FALTAN / SOBRA / VACÍA). Se abre al tocar un proyecto en el home
// del Ingeniero. Portada del mockup Marcaje.

import "./marcaje.css";
import { T, PROJECTS, type Project } from "./tokens";

export interface Casa {
  house: string;
  workers: number;
  expected: number;
  status: "ok" | "short" | "over" | "empty";
  desdeUtc: string | null;
  task: string | null;
  foreman: string | null;
}

function horaLocal(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function ScreenCasasProyecto({
  code,
  casas = [],
  onBack,
  onCasa,
}: {
  code: string;
  casas?: Casa[];
  onBack?: () => void;
  onCasa?: (house: string) => void;
}) {
  const project: Project = PROJECTS[code] ?? { code, name: code, color: T.g500, colorBg: T.g200, type: "condo" };
  const cardBg = T.white;
  const border = T.g200;

  const total = casas.reduce((s, c) => s + c.workers, 0);
  const expected = casas.reduce((s, c) => s + c.expected, 0);
  const active = casas.filter((c) => c.workers > 0).length;
  const empty = casas.filter((c) => c.status === "empty").length;

  return (
    <div className="mk-phone" style={{ background: T.paper, color: T.ink, fontFamily: T.fontUI, display: "flex", flexDirection: "column" }}>
      {/* Header negro con back + proyecto */}
      <div style={{ background: T.black, color: T.white, padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onBack}
            aria-label="Volver"
            style={{ width: 32, height: 32, borderRadius: 16, border: `1px solid ${T.g800}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3l-4 4 4 4" stroke={T.white} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.lime, letterSpacing: 2.5, fontWeight: 700 }}>VISTA DE PROYECTO</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
          <div style={{ padding: "4px 10px", background: project.color, borderRadius: 4, fontFamily: T.fontMono, fontSize: 13, fontWeight: 800, color: "#0a0a0a", letterSpacing: 1.2 }}>{project.code}</div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4 }}>{project.name}</div>
        </div>
        <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.g500, marginTop: 4 }}>
          {active} casas activas · {total}/{expected} trabajadores
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "12px 14px 6px", display: "flex", gap: 8 }}>
        <StatMini label="ACTIVAS" value={active} sub={`/${casas.length} hoy`} />
        <StatMini label="EN OBRA" value={total} sub={`/${expected}`} />
        <StatMini label="VACÍAS" value={empty} accent={empty > 0} />
      </div>

      {/* Section header */}
      <div style={{ padding: "14px 18px 6px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.g700, letterSpacing: 2, fontWeight: 700 }}>CASAS PROGRAMADAS HOY</div>
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.g700, letterSpacing: 0.5 }}>{casas.length} CASAS</div>
      </div>

      {/* Lista de casas */}
      <div className="mk-scroll" style={{ flex: 1, overflowY: "auto", padding: "4px 14px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
        {casas.length === 0 ? (
          <div style={{ marginTop: 24, textAlign: "center", fontFamily: T.fontMono, fontSize: 11, color: T.g500, letterSpacing: 1 }}>
            — Sin casas con actividad hoy —
          </div>
        ) : (
          casas.map((c) => <HouseCard key={c.house} row={c} project={project} cardBg={cardBg} border={border} onClick={onCasa} />)
        )}
      </div>
    </div>
  );
}

function StatMini({ label, value, sub, accent = false }: { label: string; value: number; sub?: string; accent?: boolean }) {
  return (
    <div style={{ flex: 1, background: T.ink, color: T.white, border: `1px solid ${T.g800}`, borderRadius: T.rCard, padding: "12px 14px", minWidth: 0 }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.g500, letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{ fontFamily: T.fontUI, fontWeight: 800, fontSize: 26, letterSpacing: -0.5, lineHeight: 1, color: accent ? T.orange : T.white }}>{value}</span>
        {sub && <span style={{ fontFamily: T.fontMono, fontSize: 11, color: T.g500, fontWeight: 600 }}>{sub}</span>}
      </div>
    </div>
  );
}

const STATUS_MAP = {
  ok: { bg: T.greenBg, fg: T.green, label: "OK" },
  short: { bg: T.yellowBg, fg: T.yellow, label: "FALTAN" },
  over: { bg: T.blueBg, fg: T.blue, label: "SOBRA" },
  empty: { bg: T.redBg, fg: T.red, label: "VACÍA" },
} as const;

function HouseCard({ row, project, cardBg, border, onClick }: { row: Casa; project: Project; cardBg: string; border: string; onClick?: (house: string) => void }) {
  const s = STATUS_MAP[row.status];
  const isEmpty = row.status === "empty";
  const desde = horaLocal(row.desdeUtc);

  return (
    <div
      onClick={() => onClick?.(row.house)}
      style={{
        background: cardBg, border: `1px solid ${border}`, borderLeft: `3px solid ${project.color}`,
        borderRadius: T.rCard, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12,
        opacity: isEmpty ? 0.7 : 1, cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* Badge de conteo */}
      <div style={{ minWidth: 60, textAlign: "center", padding: "8px 6px", background: s.bg, border: `1px solid ${s.fg}`, borderRadius: 8 }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 18, fontWeight: 800, color: s.fg, lineHeight: 1, letterSpacing: -0.5 }}>
          {row.workers}
          <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 600 }}>/{row.expected}</span>
        </div>
        <div style={{ fontFamily: T.fontMono, fontSize: 8, fontWeight: 700, color: s.fg, letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
      </div>

      {/* Casa + tarea + jefe */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 13, fontWeight: 800, color: T.ink, letterSpacing: 0.3 }}>{row.house}</div>
          {desde && <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.g700, letterSpacing: 0.2 }}>desde {desde}</div>}
        </div>
        {row.task && (
          <div style={{ fontSize: 12, fontWeight: 600, color: T.ink, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.task}</div>
        )}
        {row.foreman && (
          <div style={{ fontSize: 11, color: T.g700, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.foreman}</div>
        )}
      </div>

      {/* Chevron */}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
        <path d="M5 3l4 4-4 4" stroke={T.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
