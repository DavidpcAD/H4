"use client";

import { useState } from "react";
import { SelectionDropdown } from "@/design-system";

export interface SelectorOption {
  id: string;
  label: string;
}

interface SelectorProps {
  /** Texto cuando no hay nada seleccionado. */
  placeholder: string;
  options: SelectorOption[];
  value: string | null;
  onChange: (id: string) => void;
}

/**
 * Envuelve el SelectionDropdown del DS para usarlo como un selector de un
 * único valor: muestra el label seleccionado en el header y cierra la lista
 * al elegir una opción.
 */
export function Selector({ placeholder, options, value, onChange }: SelectorProps) {
  const [open, setOpen] = useState(false);
  const seleccionada = options.find((o) => o.id === value);

  return (
    <SelectionDropdown
      label={seleccionada ? seleccionada.label : placeholder}
      isOpen={open}
      onToggle={() => setOpen((o) => !o)}
      items={options.map((o) => ({
        label: o.label,
        onClick: () => {
          onChange(o.id);
          setOpen(false);
        },
      }))}
    />
  );
}
