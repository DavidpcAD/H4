"use client";

import React, { useEffect, useRef, useState } from "react";
import { T } from "./tokens";
import type { CrewWorker } from "./mock";

export function AdelanteLogo({ size = 32, color = T.lime, shadow = "#7a960c" }: { size?: number; color?: string; shadow?: string }) {
  return (
    <svg width={size * 1.7} height={size} viewBox="0 0 100 60" fill="none" style={{ display: "block" }}>
      <path d="M 4 4 L 38 4 L 22 56 L 4 56 Z" fill={color} />
      <path d="M 38 4 L 50 30 L 38 56 L 22 56 Z" fill={shadow} />
      <path d="M 38 4 L 70 4 L 78 30 L 50 30 Z" fill={color} />
      <path d="M 70 4 L 96 4 L 78 30 Z" fill={color} />
      <path d="M 78 30 L 96 4 L 96 18 Z" fill={shadow} opacity="0.7" />
    </svg>
  );
}

export function CapsLabel({ children, color, size = 10, style }: { children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ fontFamily: T.fontMono, fontSize: size, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: color || T.g700, ...style }}>
      {children}
    </div>
  );
}

export function LiveDot({ size = 8, color }: { size?: number; color?: string }) {
  const c = color || T.green;
  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: c, boxShadow: `0 0 0 2px ${c}33`, animation: "mkPulse 1.5s ease-in-out infinite" }} />
    </span>
  );
}

export function Avatar({ initials, size = 36, accent = false, dark = false, onClick, title }: { initials: string; size?: number; accent?: boolean; dark?: boolean; onClick?: () => void; title?: string }) {
  return (
    <div
      onClick={onClick}
      title={title}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: accent ? T.orange : dark ? T.ink : T.slate,
        color: T.white, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: T.fontUI, fontWeight: 700, fontSize: size * 0.4, letterSpacing: -0.3,
        flexShrink: 0, cursor: onClick ? "pointer" : "default",
      }}
    >
      {initials}
    </div>
  );
}

// Avatar con menú desplegable: lista de notificaciones del usuario + cerrar
// sesión. Se usa en los headers de Jefe de Cuadrilla e Ingeniero.
export interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string | null;
  idReferencia: string | null;
  esLeida: boolean;
  fechaCreacionUtc: string;
}

interface PrestamoDetalle {
  idPrestamo: string;
  estado: string;
  fechaDesde: string;
  fechaHasta: string;
  motivo: string;
  cuadrillaOrigen: string;
  solicitante: string | null;
  colaboradores: { id: number; nombre: string }[];
}

function tiempoRelativo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

export function UserMenu({
  initials,
  nombre,
  rol,
  size = 36,
  dark = false,
  onLogout,
}: {
  initials: string;
  nombre?: string;
  rol?: string;
  size?: number;
  dark?: boolean;
  onLogout?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notificacion[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [prestamoId, setPrestamoId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const recargarNotifs = async () => {
    try {
      const res = await fetch("/api/notificaciones", { cache: "no-store" });
      const data = (await res.json()) as { notificaciones: Notificacion[] };
      setNotifs(res.ok ? data.notificaciones : []);
    } catch {
      setNotifs([]);
    }
  };

  // Al tocar una notificación de solicitud de préstamo, abrir el popup.
  const abrirNotif = (n: Notificacion) => {
    if (n.tipo === "PrestamoSolicitud" && n.idReferencia) {
      setOpen(false);
      setPrestamoId(n.idReferencia);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Carga las notificaciones reales al abrir el menú.
  useEffect(() => {
    if (!open) return;
    let activo = true;
    setCargando(true);
    (async () => {
      try {
        const res = await fetch("/api/notificaciones", { cache: "no-store" });
        const data = (await res.json()) as { notificaciones: Notificacion[] };
        if (activo) setNotifs(res.ok ? data.notificaciones : []);
      } catch {
        if (activo) setNotifs([]);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [open]);

  const sinLeer = notifs?.filter((n) => !n.esLeida).length ?? 0;

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ position: "relative" }}>
        <Avatar
          initials={initials}
          size={size}
          dark={dark}
          onClick={() => setOpen((o) => !o)}
          title="Cuenta"
        />
        {sinLeer > 0 && !open && (
          <span
            style={{
              position: "absolute", top: -2, right: -2, minWidth: 16, height: 16,
              padding: "0 4px", borderRadius: 999, background: T.red, color: T.white,
              fontFamily: T.fontMono, fontSize: 9, fontWeight: 800, lineHeight: "16px",
              textAlign: "center", border: `2px solid ${dark ? T.black : T.white}`,
            }}
          >
            {sinLeer}
          </span>
        )}
      </div>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", top: size + 8, right: 0, width: 280, zIndex: 50,
            background: T.white, color: T.ink, border: `1px solid ${T.g200}`,
            borderRadius: T.rCard, boxShadow: "0 12px 32px rgba(0,0,0,0.18)", overflow: "hidden",
          }}
        >
          {(nombre || rol) && (
            <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.g200}` }}>
              {nombre && <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: -0.3, color: T.ink }}>{nombre}</div>}
              {rol && <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.g700, fontWeight: 700, letterSpacing: 1.5, marginTop: 3 }}>{rol}</div>}
            </div>
          )}

          <div style={{ padding: "10px 14px 6px" }}>
            <CapsLabel style={{ marginBottom: 8 }}>Notificaciones</CapsLabel>
            <div style={{ maxHeight: 260, overflowY: "auto", margin: "0 -4px" }}>
              {cargando && notifs === null ? (
                <div style={{ padding: "14px 4px", fontSize: 12, color: T.g500, fontFamily: T.fontMono }}>Cargando…</div>
              ) : notifs && notifs.length > 0 ? (
                notifs.map((n) => {
                  const accionable = n.tipo === "PrestamoSolicitud" && !!n.idReferencia;
                  return (
                    <div
                      key={n.id}
                      onClick={accionable ? () => abrirNotif(n) : undefined}
                      role={accionable ? "button" : undefined}
                      style={{
                        display: "flex", gap: 10, padding: "9px 8px", borderRadius: 8,
                        background: n.esLeida ? "transparent" : T.orangeBg,
                        cursor: accionable ? "pointer" : "default",
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: n.esLeida ? T.g300 : T.orange }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: T.fontUI, fontSize: 13, fontWeight: 700, color: T.ink }}>{n.titulo}</div>
                        {n.mensaje && <div style={{ fontSize: 11.5, color: T.g700, marginTop: 2, lineHeight: 1.35 }}>{n.mensaje}</div>}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                          <div style={{ fontFamily: T.fontMono, fontSize: 9.5, color: T.g500, letterSpacing: 0.3 }}>{tiempoRelativo(n.fechaCreacionUtc)}</div>
                          {accionable && <div style={{ fontFamily: T.fontMono, fontSize: 9.5, color: T.orange, fontWeight: 700, letterSpacing: 0.5 }}>VER →</div>}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: "16px 4px", textAlign: "center", fontSize: 12.5, color: T.g500, fontFamily: T.fontUI }}>Sin notificaciones</div>
              )}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${T.g200}`, padding: 8 }}>
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout?.();
              }}
              style={{
                width: "100%", height: 40, display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8, background: T.white, color: T.red,
                border: `1px solid ${T.g300}`, borderRadius: T.rInput,
                fontFamily: T.fontUI, fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H3.5A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14H6" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" />
                <path d="M10.5 11l3-3-3-3M13 8H6" stroke={T.red} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {prestamoId && (
        <PrestamoModal
          idPrestamo={prestamoId}
          onClose={() => setPrestamoId(null)}
          onResuelto={async () => {
            setPrestamoId(null);
            await recargarNotifs();
          }}
        />
      )}
    </div>
  );
}

// Popup para aceptar/rechazar una solicitud de préstamo desde la notificación.
function PrestamoModal({
  idPrestamo,
  onClose,
  onResuelto,
}: {
  idPrestamo: string;
  onClose: () => void;
  onResuelto: () => void;
}) {
  const [det, setDet] = useState<PrestamoDetalle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await fetch(`/api/prestamos/${idPrestamo}`, { cache: "no-store" });
        const data = await res.json();
        if (!activo) return;
        if (res.ok) setDet(data as PrestamoDetalle);
        else setError(data?.message ?? "No se pudo cargar la solicitud");
      } catch {
        if (activo) setError("No se pudo contactar al servidor");
      }
    })();
    return () => {
      activo = false;
    };
  }, [idPrestamo]);

  const responder = async (aceptar: boolean) => {
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`/api/prestamos/${idPrestamo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aceptar }),
      });
      if (res.ok) onResuelto();
      else {
        const data = await res.json();
        setError(data?.message ?? "No se pudo procesar la solicitud");
        setEnviando(false);
      }
    } catch {
      setError("No se pudo contactar al servidor");
      setEnviando(false);
    }
  };

  const n = det?.colaboradores.length ?? 0;
  const resuelto = det && det.estado !== "Pendiente";

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 340, background: T.white, color: T.ink, borderRadius: T.rCard, boxShadow: "0 16px 48px rgba(0,0,0,0.35)", overflow: "hidden", fontFamily: T.fontUI }}
      >
        {/* Header */}
        <div style={{ padding: "14px 16px", background: T.ink, color: T.white, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 10, letterSpacing: 2, fontWeight: 700, color: T.lime }}>SOLICITUD DE PRÉSTAMO</div>
          <button onClick={onClose} aria-label="Cerrar" style={{ width: 28, height: 28, borderRadius: 14, border: `1px solid ${T.g800}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke={T.white} strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div style={{ padding: 16 }}>
          {!det && !error && <div style={{ fontSize: 12, color: T.g500, fontFamily: T.fontMono }}>Cargando…</div>}
          {error && <div style={{ fontSize: 12.5, color: T.red, marginBottom: 8 }}>{error}</div>}

          {det && (
            <>
              <div style={{ fontSize: 12, color: T.g700 }}>
                De <span style={{ fontWeight: 700, color: T.ink }}>{det.cuadrillaOrigen}</span>
                {det.solicitante ? ` · ${det.solicitante}` : ""}
              </div>
              <div style={{ fontFamily: T.fontMono, fontSize: 12, color: T.ink, marginTop: 6 }}>
                {det.fechaDesde} → {det.fechaHasta}
              </div>
              <div style={{ fontSize: 12.5, color: T.g700, marginTop: 6, lineHeight: 1.4 }}>{det.motivo}</div>

              <CapsLabel style={{ margin: "14px 0 6px" }}>{n} {n === 1 ? "colaborador" : "colaboradores"}</CapsLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {det.colaboradores.map((c) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: T.paper, border: `1px solid ${T.g200}`, borderRadius: 8 }}>
                    <Avatar initials={initials(c.nombre)} size={28} />
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{c.nombre}</div>
                  </div>
                ))}
              </div>

              {resuelto ? (
                <div style={{ marginTop: 14, padding: "10px 12px", background: T.g100, borderRadius: 8, fontFamily: T.fontMono, fontSize: 11, color: T.g700, fontWeight: 600 }}>
                  Esta solicitud ya fue {det.estado.toLowerCase()}.
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <Btn kind="ghost" onClick={() => responder(false)} disabled={enviando}>Rechazar</Btn>
                  <Btn kind="primary" full onClick={() => responder(true)} disabled={enviando}>
                    {enviando ? "Procesando…" : "Aceptar e integrar"}
                  </Btn>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, sub, dark = false, accent = false }: { label: string; value: React.ReactNode; sub?: string; dark?: boolean; accent?: boolean }) {
  const bg = dark ? T.ink : T.white;
  const fg = dark ? T.white : T.ink;
  const lblColor = dark ? T.g500 : T.g700;
  return (
    <div style={{ flex: 1, background: bg, color: fg, border: `1px solid ${dark ? "#2a2a2a" : T.g200}`, borderRadius: T.rCard, padding: "12px 14px", minWidth: 0 }}>
      <CapsLabel color={lblColor} style={{ marginBottom: 6 }}>{label}</CapsLabel>
      <div style={{ fontFamily: T.fontUI, fontWeight: 800, fontSize: 26, letterSpacing: -0.5, color: accent ? T.orange : fg, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ marginTop: 6, fontSize: 11, color: dark ? T.g500 : T.g700, fontFamily: T.fontMono, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

export function StatusDot({ status = "g", size = 10 }: { status?: string; size?: number }) {
  const colors: Record<string, string> = { g: T.green, b: T.blue, x: T.g300, y: T.yellow, r: T.red };
  const c = colors[status] || T.g300;
  if (status === "g") {
    return (
      <span style={{ position: "relative", display: "inline-block", width: size, height: size, flexShrink: 0 }}>
        <span style={{ position: "absolute", inset: -3, borderRadius: "50%", border: `1.5px solid ${c}`, animation: "mkRing 1.5s ease-out infinite" }} />
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: c }} />
      </span>
    );
  }
  return <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", background: c, flexShrink: 0 }} />;
}

export function WorkerRow({ w, selected = false, onClick, dense = false }: { w: CrewWorker; selected?: boolean; onClick?: () => void; dense?: boolean }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: `${dense ? 10 : 12}px 14px`,
        background: selected ? T.orangeBg : T.white,
        border: `1px solid ${selected ? T.orange : T.g200}`,
        borderRadius: T.rCard, cursor: onClick ? "pointer" : "default",
        transition: "all 150ms", boxShadow: selected ? T.shFocus : "none",
      }}
    >
      <StatusDot status={w.dot} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.fontUI, fontWeight: 700, fontSize: 14, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.name}</div>
        <div style={{ fontFamily: T.fontMono, fontSize: 11, color: T.g700, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {w.loc}{w.task ? ` · ${w.task}` : ""}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: T.fontMono, fontSize: 13, fontWeight: 600, color: T.ink, letterSpacing: -0.2 }}>{w.dur}</div>
        <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.g500, marginTop: 2 }}>{w.start}</div>
      </div>
      {selected && (
        <div style={{ width: 22, height: 22, borderRadius: 6, background: T.orange, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6.5L4.8 9.2L10 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );
}

// Fila compacta para la vista agrupada por casa (no repite la ubicación,
// que ya está en el header de la casa).
export function HouseWorkerRow({ w, selected = false, onClick }: { w: CrewWorker; selected?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
        background: selected ? T.orangeBg : "transparent",
        border: `1px solid ${selected ? T.orange : "transparent"}`,
        borderRadius: 8, cursor: onClick ? "pointer" : "default", transition: "all 150ms",
      }}
    >
      <StatusDot status={w.dot} />
      <div style={{ flex: 1, minWidth: 0, fontFamily: T.fontUI, fontWeight: 600, fontSize: 13.5, color: T.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {w.name}
      </div>
      <div style={{ fontFamily: T.fontMono, fontSize: 11, fontWeight: 600, color: T.g700, letterSpacing: -0.2, flexShrink: 0 }}>
        {w.dur}
      </div>
    </div>
  );
}

export function Btn({ children, kind = "primary", onClick, full = false, disabled = false }: { children: React.ReactNode; kind?: "primary" | "ghost" | "dark" | "danger"; onClick?: () => void; full?: boolean; disabled?: boolean }) {
  const styles = {
    primary: { bg: T.orange, fg: T.black, border: T.orange },
    ghost: { bg: T.white, fg: T.ink, border: T.g300 },
    dark: { bg: T.ink, fg: T.white, border: T.ink },
    danger: { bg: T.red, fg: T.white, border: T.red },
  }[kind];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 44, padding: "0 16px",
        background: disabled ? T.g200 : styles.bg,
        color: disabled ? T.g500 : styles.fg,
        border: `1px solid ${disabled ? T.g300 : styles.border}`,
        borderRadius: T.rInput, fontFamily: T.fontUI, fontWeight: 700, fontSize: 14, letterSpacing: -0.2,
        cursor: disabled ? "not-allowed" : "pointer", width: full ? "100%" : "auto",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 150ms",
      }}
    >
      {children}
    </button>
  );
}

export function SectionHeader({ children, badge, action }: { children: React.ReactNode; badge?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "6px 0 10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <CapsLabel>{children}</CapsLabel>
        {badge && <span style={{ fontFamily: T.fontMono, fontSize: 10, fontWeight: 700, color: T.g700, background: T.g100, padding: "2px 6px", borderRadius: 4, letterSpacing: 0.5 }}>{badge}</span>}
      </div>
      {action}
    </div>
  );
}

export function Field({ label, children, error, hint }: { label: string; children: React.ReactNode; error?: string; hint?: string }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <CapsLabel style={{ marginBottom: 6 }}>{label}</CapsLabel>
      {children}
      {error && <div style={{ marginTop: 5, fontSize: 11, color: T.red, fontFamily: T.fontMono }}>{error}</div>}
      {hint && !error && <div style={{ marginTop: 5, fontSize: 11, color: T.g700, fontFamily: T.fontMono }}>{hint}</div>}
    </label>
  );
}

export function Input({ value, mono = false, focus = false, disabled = false, suffix, error = false }: { value: React.ReactNode; mono?: boolean; focus?: boolean; disabled?: boolean; suffix?: string; error?: boolean }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", height: 44, padding: "0 12px",
        background: disabled ? T.g100 : T.white,
        border: `${focus ? 2 : 1}px solid ${error ? T.red : focus ? T.orange : T.g300}`,
        borderRadius: T.rInput, boxShadow: focus ? T.shFocus : "none",
      }}
    >
      <span style={{ flex: 1, fontFamily: mono ? T.fontMono : T.fontUI, fontSize: 14, fontWeight: mono ? 600 : 500, color: disabled ? T.g500 : T.ink }}>{value}</span>
      {suffix && <span style={{ color: T.g500, fontSize: 13, fontFamily: T.fontMono }}>{suffix}</span>}
      {!disabled && !suffix && (
        <svg width="10" height="6" viewBox="0 0 10 6" style={{ opacity: 0.5 }}>
          <path d="M1 1l4 4 4-4" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  mono = false,
  focus = false,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  mono?: boolean;
  focus?: boolean;
  placeholder?: string;
}) {
  return (
    <div
      style={{
        position: "relative", display: "flex", alignItems: "center", height: 44,
        background: T.white,
        border: `${focus ? 2 : 1}px solid ${focus ? T.orange : T.g300}`,
        borderRadius: T.rInput, boxShadow: focus ? T.shFocus : "none",
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1, appearance: "none", WebkitAppearance: "none", border: "none",
          background: "transparent", outline: "none", padding: "0 32px 0 12px",
          height: "100%", fontFamily: mono ? T.fontMono : T.fontUI, fontSize: 14,
          fontWeight: mono ? 600 : 500, color: T.ink, cursor: "pointer",
        }}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg width="10" height="6" viewBox="0 0 10 6" style={{ position: "absolute", right: 12, opacity: 0.5, pointerEvents: "none" }}>
        <path d="M1 1l4 4 4-4" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function TimeInput({ value, onChange, focus = false }: { value: string; onChange: (value: string) => void; focus?: boolean }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", height: 44, padding: "0 12px",
        background: T.white,
        border: `${focus ? 2 : 1}px solid ${focus ? T.orange : T.g300}`,
        borderRadius: T.rInput, boxShadow: focus ? T.shFocus : "none",
      }}
    >
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1, border: "none", outline: "none", background: "transparent",
          fontFamily: T.fontMono, fontSize: 14, fontWeight: 600, color: T.ink,
        }}
      />
    </div>
  );
}

export function DateInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", height: 44, padding: "0 12px", background: T.white, border: `1px solid ${T.g300}`, borderRadius: T.rInput }}>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: T.fontMono, fontSize: 13, fontWeight: 600, color: T.ink }}
      />
    </div>
  );
}

export function Textarea({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width: "100%", minHeight: 64, padding: "10px 12px", background: T.white, border: `1px solid ${T.g300}`, borderRadius: T.rInput, fontFamily: T.fontUI, fontSize: 14, color: T.ink, lineHeight: 1.4, resize: "vertical", outline: "none" }}
    />
  );
}

export function initials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}
