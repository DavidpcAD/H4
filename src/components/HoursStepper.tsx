"use client";

import { Icon, haptic } from "@/design-system";

interface HoursStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/** Control compacto +/- para asignar horas. */
export function HoursStepper({
  value,
  onChange,
  min = 0,
  max = 24,
  step = 1,
}: HoursStepperProps) {
  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next));
    haptic.select();
    onChange(Number(clamped.toFixed(2)));
  };

  return (
    <div className="stepper" role="group" aria-label="Horas">
      <button
        type="button"
        className="stepper__btn"
        onClick={() => set(value - step)}
        disabled={value <= min}
        aria-label="Quitar hora"
      >
        <Icon name="minus" size="md" color="currentColor" />
      </button>
      <span className="stepper__value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => set(value + step)}
        disabled={value >= max}
        aria-label="Agregar hora"
      >
        <Icon name="plus" size="md" color="currentColor" />
      </button>
    </div>
  );
}
