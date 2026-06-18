"use client";

import { Button, Icon } from "@/design-system";
import type { Colaborador, LineaHoras, Subactividad } from "@/lib/types";
import { HoursStepper } from "./HoursStepper";

interface ColaboradorCardProps {
  colaborador: Colaborador;
  subactividades: Subactividad[];
  lineas: LineaHoras[];
  onChange: (lineas: LineaHoras[]) => void;
}

function iniciales(nombre: string): string {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function nuevoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `l_${Math.round(performance.now() * 1000)}`;
}

/**
 * Tarjeta de un colaborador con su distribución de horas: una o varias líneas,
 * cada una con la subactividad y la cantidad de horas. Permite agregar más
 * líneas para repartir la jornada entre subactividades.
 */
export function ColaboradorCard({
  colaborador,
  subactividades,
  lineas,
  onChange,
}: ColaboradorCardProps) {
  const total = lineas.reduce((acc, l) => acc + l.horas, 0);

  const actualizar = (id: string, cambios: Partial<LineaHoras>) =>
    onChange(lineas.map((l) => (l.id === id ? { ...l, ...cambios } : l)));

  const agregar = () =>
    onChange([...lineas, { id: nuevoId(), subactividadId: null, horas: 1 }]);

  const eliminar = (id: string) => onChange(lineas.filter((l) => l.id !== id));

  // Subactividades ya tomadas por otras líneas (para no repetirlas).
  const usadas = new Set(
    lineas.map((l) => l.subactividadId).filter((x): x is string => Boolean(x)),
  );

  return (
    <div className="colab-card">
      <div className="colab-card__head">
        <span className="colab-avatar" aria-hidden>
          {iniciales(colaborador.nombre)}
        </span>
        <div>
          <p className="colab-card__name">{colaborador.nombre}</p>
          <p className="colab-card__rol">{colaborador.rol}</p>
        </div>
        <div className="colab-total">
          <span className="colab-total__num">{total}</span>
          <span className="colab-total__unit">horas</span>
        </div>
      </div>

      {lineas.length === 0 && (
        <p className="linea-empty">Sin horas asignadas todavía.</p>
      )}

      {lineas.map((linea) => {
        const opciones = subactividades.filter(
          (s) => !usadas.has(s.id) || s.id === linea.subactividadId,
        );
        return (
          <div className="linea" key={linea.id}>
            <select
              className="ds-select linea__select"
              value={linea.subactividadId ?? ""}
              onChange={(e) =>
                actualizar(linea.id, { subactividadId: e.target.value || null })
              }
              aria-label="Subactividad"
            >
              <option value="" disabled>
                Elegí la subactividad
              </option>
              {opciones.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>

            <HoursStepper
              value={linea.horas}
              onChange={(h) => actualizar(linea.id, { horas: h })}
            />

            <button
              type="button"
              className="linea__remove"
              onClick={() => eliminar(linea.id)}
              aria-label="Eliminar línea"
            >
              <Icon name="delete" size="md" color="currentColor" />
            </button>
          </div>
        );
      })}

      <Button
        label="Agregar subactividad"
        color="white"
        size="sm"
        layout="icon-left"
        icon="plus"
        onClick={agregar}
      />
    </div>
  );
}
