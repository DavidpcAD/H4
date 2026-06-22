"use client";

// Pantalla C: Reasignar trabajadores (PASO 2 DE 2). Datos de destino simulados.

import { useState } from "react";
import "./marcaje.css";
import { T } from "./tokens";
import { CREW } from "./mock";
import { Btn, CapsLabel, Field, Input, SectionHeader, Select, WorkerRow } from "./ui";

export interface Subpartida {
  id: number;
  codigo: string;
  nombre: string;
}

// "Condominio" en la UI = Proyecto en la BD.
export interface Proyecto {
  id: number;
  nombre: string;
  abreviatura: string;
}

// "Casa" en la UI = Obra (dbo.Obra) en la BD.
export interface Obra {
  id: string;
  numeroObra: string;
  nombre: string | null;
}

export function ScreenReasignar({
  selectedIds,
  subpartidas = [],
  proyectos = [],
  obras = [],
  onBack,
  onConfirm,
}: {
  selectedIds: string[];
  subpartidas?: Subpartida[];
  proyectos?: Proyecto[];
  obras?: Obra[];
  onBack?: () => void;
  onConfirm?: () => void;
}) {
  // Si no llegan IDs (acceso directo), se muestran los 3 primeros como demo.
  const ids = selectedIds.length > 0 ? selectedIds : CREW.slice(0, 3).map((w) => w.id);
  const selected = CREW.filter((w) => ids.includes(w.id));
  const n = selected.length;

  // Condominio = Proyecto (default: el primero).
  const [proyId, setProyId] = useState<string>("");
  const proyecto = proyectos.find((p) => String(p.id) === proyId) ?? proyectos[0];

  // Casa = Obra, filtrada por el prefijo de la abreviatura del proyecto
  // (ej. "VN" → obras "VN-..."). Si no hay coincidencias, se muestran todas.
  const obrasFiltradas = (() => {
    if (!proyecto) return obras;
    const pref = `${proyecto.abreviatura.toUpperCase()}-`;
    const f = obras.filter((o) => o.numeroObra.toUpperCase().startsWith(pref));
    return f.length ? f : obras;
  })();
  const [obraId, setObraId] = useState<string>("");
  const obra = obrasFiltradas.find((o) => String(o.id) === obraId) ?? obrasFiltradas[0];

  // Subpartida elegida en el dropdown (default: la primera disponible).
  const [subId, setSubId] = useState<string>("");
  const sub = subpartidas.find((s) => String(s.id) === subId) ?? subpartidas[0];
  const destinoObra = obra ? obra.numeroObra : "—";
  const destinoCodigo = sub ? sub.codigo : "—";

  return (
    <div className="mk-phone" style={{ background: T.paper, fontFamily: T.fontUI, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", background: T.white, borderBottom: `1px solid ${T.g200}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: T.g700, fontFamily: T.fontMono, fontWeight: 600, letterSpacing: 2 }}>PASO 2 DE 2</div>
            <div style={{ fontSize: 13, color: T.g700, marginTop: 6 }}>Reasignar</div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: T.ink, marginTop: 1 }}>
              {n} {n === 1 ? "trabajador" : "trabajadores"}
            </div>
          </div>
          <button onClick={onBack} aria-label="Cerrar" style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${T.g300}`, background: T.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="#1a1a1a" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div style={{ display: "flex", gap: 5, marginTop: 14 }}>
          <div style={{ flex: 1, height: 3, background: T.orange, borderRadius: 2 }} />
          <div style={{ flex: 1, height: 3, background: T.orange, borderRadius: 2 }} />
        </div>
      </div>

      <div className="mk-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 14px 100px" }}>
        {/* Seleccionados */}
        <SectionHeader badge={String(n)}>SELECCIONADOS</SectionHeader>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {selected.map((w) => (
            <WorkerRow key={w.id} w={w} selected dense />
          ))}
        </div>

        {/* Destino */}
        <div style={{ marginTop: 18 }}>
          <SectionHeader>DESTINO</SectionHeader>
          <Field label="Condominio" hint={proyectos.length ? undefined : "Cargando proyectos…"}>
            <Select
              value={proyecto ? String(proyecto.id) : ""}
              onChange={setProyId}
              placeholder="Elegí el condominio"
              options={proyectos.map((p) => ({ value: String(p.id), label: p.nombre }))}
            />
          </Field>
          <Field label="Casa" hint={obras.length ? undefined : "Cargando obras…"}>
            <Select
              mono
              value={obra ? String(obra.id) : ""}
              onChange={setObraId}
              placeholder="Elegí la casa"
              options={obrasFiltradas.map((o) => ({ value: String(o.id), label: o.nombre ? `${o.numeroObra} — ${o.nombre}` : o.numeroObra }))}
            />
          </Field>
          <Field label="Subpartida" hint={subpartidas.length ? undefined : "Cargando subpartidas…"}>
            <Select
              mono
              focus
              value={sub ? String(sub.id) : ""}
              onChange={setSubId}
              placeholder="Elegí la subpartida"
              options={subpartidas.map((s) => ({ value: String(s.id), label: `${s.codigo} — ${s.nombre}` }))}
            />
          </Field>
          <Field label="Hora del cambio" hint="Última actividad: 10:54"><Input value="11:00" mono /></Field>
        </div>

        {/* Resumen */}
        <div style={{ marginTop: 6, padding: "12px 14px", background: T.g100, borderRadius: T.rCard, border: `1px solid ${T.g200}` }}>
          <CapsLabel style={{ marginBottom: 8 }}>RESUMEN</CapsLabel>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", rowGap: 6, columnGap: 10 }}>
            <div style={{ fontSize: 12, color: T.g700 }}>Cierre tramo actual</div>
            <div style={{ fontFamily: T.fontMono, fontSize: 13, fontWeight: 600, color: T.ink, textAlign: "right" }}>11:00</div>
            <div style={{ fontSize: 12, color: T.g700 }}>Inicio tramo nuevo</div>
            <div style={{ fontFamily: T.fontMono, fontSize: 13, fontWeight: 600, color: T.ink, textAlign: "right" }}>11:00</div>
            <div style={{ fontSize: 12, color: T.g700 }}>Destino</div>
            <div style={{ fontFamily: T.fontMono, fontSize: 13, fontWeight: 700, color: T.orange, textAlign: "right" }}>{destinoObra} · {destinoCodigo}</div>
          </div>
        </div>

        <div style={{ marginTop: 14, padding: "10px 12px", background: T.greenBg, borderRadius: 8, fontFamily: T.fontMono, fontSize: 11, color: T.green, fontWeight: 600 }}>
          ✓ Quedará registrado bajo: Don Roberto · 09:24
        </div>
      </div>

      {/* Action bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 14px 14px", background: T.white, borderTop: `1px solid ${T.g200}`, display: "flex", gap: 8 }}>
        <Btn kind="ghost" onClick={onBack}>Atrás</Btn>
        <Btn kind="primary" full onClick={onConfirm}>Confirmar reasignación</Btn>
      </div>
    </div>
  );
}
