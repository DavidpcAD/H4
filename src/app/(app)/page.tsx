"use client";

import { useMemo, useState } from "react";
import { Button, Icon } from "@/design-system";
import { Selector } from "@/components/Selector";
import { ColaboradorCard } from "@/components/ColaboradorCard";
import { useAuth } from "@/lib/auth";
import {
  ACTIVIDADES,
  PROYECTOS,
  actividadesDeEtapa,
  colaboradoresDeCuadrilla,
  cuadrillaPorId,
  etapasDeProyecto,
  subactividadesDeActividad,
} from "@/lib/mock-data";
import type { AsignacionPorColaborador, LineaHoras } from "@/lib/types";

export default function AsignacionPage() {
  const { usuario, logout } = useAuth();

  const [proyectoId, setProyectoId] = useState<string | null>(null);
  const [etapaId, setEtapaId] = useState<string | null>(null);
  const [actividadId, setActividadId] = useState<string | null>(null);
  const [asignaciones, setAsignaciones] = useState<AsignacionPorColaborador>({});
  const [guardado, setGuardado] = useState(false);

  // ── Cascada de selección ──────────────────────────────────────────────
  const etapas = useMemo(
    () => (proyectoId ? etapasDeProyecto(proyectoId) : []),
    [proyectoId],
  );
  const actividades = useMemo(
    () => (etapaId ? actividadesDeEtapa(etapaId) : []),
    [etapaId],
  );
  const actividad = useMemo(
    () => ACTIVIDADES.find((a) => a.id === actividadId) ?? null,
    [actividadId],
  );
  const subactividades = useMemo(
    () => (actividadId ? subactividadesDeActividad(actividadId) : []),
    [actividadId],
  );
  const cuadrilla = actividad ? cuadrillaPorId(actividad.cuadrillaId) : null;
  const colaboradores = cuadrilla
    ? colaboradoresDeCuadrilla(cuadrilla.id)
    : [];

  // ── Handlers que resetean los niveles inferiores ──────────────────────
  const elegirProyecto = (id: string) => {
    setProyectoId(id);
    setEtapaId(null);
    setActividadId(null);
    setAsignaciones({});
    setGuardado(false);
  };
  const elegirEtapa = (id: string) => {
    setEtapaId(id);
    setActividadId(null);
    setAsignaciones({});
    setGuardado(false);
  };
  const elegirActividad = (id: string) => {
    setActividadId(id);
    setAsignaciones({});
    setGuardado(false);
  };

  const setLineas = (colaboradorId: string, lineas: LineaHoras[]) => {
    setAsignaciones((prev) => ({ ...prev, [colaboradorId]: lineas }));
    setGuardado(false);
  };

  // ── Totales ────────────────────────────────────────────────────────────
  const totalHoras = Object.values(asignaciones)
    .flat()
    .reduce((acc, l) => acc + l.horas, 0);
  const colaboradoresConHoras = Object.values(asignaciones).filter(
    (lineas) => lineas.some((l) => l.subactividadId && l.horas > 0),
  ).length;

  const lineasIncompletas = Object.values(asignaciones)
    .flat()
    .some((l) => !l.subactividadId && l.horas > 0);

  const puedeGuardar = colaboradoresConHoras > 0 && !lineasIncompletas;

  const guardar = () => {
    // Sin base de datos todavía: solo se confirma en pantalla.
    setGuardado(true);
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-header__titles">
          <h1 className="app-title">Asignación de horas</h1>
          <p className="app-subtitle">Hola, {usuario?.nombre}</p>
        </div>
        <Button label="Salir" color="white" size="sm" onClick={logout} />
      </header>

      {/* Paso 1 · Selección */}
      <section>
        <p className="app-section-label">1 · Seleccioná dónde se trabajó</p>
        <div className="stack">
          <Selector
            placeholder="Proyecto"
            options={PROYECTOS.map((p) => ({
              id: p.id,
              label: `${p.codigo} · ${p.nombre}`,
            }))}
            value={proyectoId}
            onChange={elegirProyecto}
          />

          {proyectoId && (
            <Selector
              placeholder="Etapa"
              options={etapas.map((e) => ({ id: e.id, label: e.nombre }))}
              value={etapaId}
              onChange={elegirEtapa}
            />
          )}

          {etapaId && (
            <Selector
              placeholder="Actividad"
              options={actividades.map((a) => ({ id: a.id, label: a.nombre }))}
              value={actividadId}
              onChange={elegirActividad}
            />
          )}
        </div>
      </section>

      {/* Paso 2 · Cuadrilla */}
      {actividad && cuadrilla && (
        <section>
          <p className="app-section-label">2 · Asigná horas a la cuadrilla</p>
          <div className="crew-head">
            <span className="crew-head__icon" aria-hidden>
              <Icon name="cuadrillas" size="lg" color="currentColor" />
            </span>
            <div>
              <p className="crew-head__name">{cuadrilla.nombre}</p>
              <p className="app-subtitle">
                {colaboradores.length} colaboradores · {subactividades.length}{" "}
                subactividades
              </p>
            </div>
          </div>

          <div className="stack">
            {colaboradores.map((c) => (
              <ColaboradorCard
                key={c.id}
                colaborador={c}
                subactividades={subactividades}
                lineas={asignaciones[c.id] ?? []}
                onChange={(lineas) => setLineas(c.id, lineas)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Paso 3 · Resumen */}
      {actividad && (
        <section>
          <p className="app-section-label">3 · Resumen</p>
          <div className="resumen">
            <div className="resumen__row">
              <span className="muted">Colaboradores con horas</span>
              <span>{colaboradoresConHoras}</span>
            </div>
            <div className="resumen__row resumen__row--total">
              <span>Total de horas</span>
              <span>{totalHoras}</span>
            </div>

            {lineasIncompletas && (
              <p className="linea-empty">
                Hay líneas con horas pero sin subactividad seleccionada.
              </p>
            )}

            {guardado ? (
              <div className="ok-banner">
                <Icon name="good" size="md" color="var(--ds-color-white)" />
                Asignación registrada (demo, sin base de datos).
              </div>
            ) : (
              <Button
                label="Guardar asignación"
                color={puedeGuardar ? "green" : "gray"}
                state={puedeGuardar ? "standard" : "disabled"}
                fullWidth
                onClick={guardar}
              />
            )}
          </div>
        </section>
      )}
    </main>
  );
}
