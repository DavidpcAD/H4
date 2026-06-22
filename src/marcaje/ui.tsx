"use client";

import React from "react";
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

export function initials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}
