"use client";

// Autenticación mock (sin base de datos). Valida usuario + contraseña contra
// la tabla `Usuario` comparando el hash SHA-256 de la contraseña ingresada con
// el `passwordHash` almacenado. La sesión se persiste en localStorage.
//
// Cuando exista backend real, basta con reemplazar `login()` por una llamada a
// la API y mantener la misma forma del contexto.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { USUARIOS } from "./mock-data";
import type { Usuario } from "./types";

/** Usuario en sesión, sin el hash. */
export type SesionUsuario = Pick<Usuario, "id" | "usuario" | "nombre">;

interface AuthContextValue {
  usuario: SesionUsuario | null;
  cargando: boolean;
  login: (usuario: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const STORAGE_KEY = "h4.sesion";

const AuthContext = createContext<AuthContextValue | null>(null);

async function sha256Hex(texto: string): Promise<string> {
  const data = new TextEncoder().encode(texto);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<SesionUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Rehidratar sesión desde localStorage al montar.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUsuario(JSON.parse(raw) as SesionUsuario);
    } catch {
      // ignorar JSON inválido
    }
    setCargando(false);
  }, []);

  const login = useCallback(async (nombreUsuario: string, password: string) => {
    const registro = USUARIOS.find(
      (u) => u.usuario.toLowerCase() === nombreUsuario.trim().toLowerCase(),
    );
    if (!registro) return false;

    const hash = await sha256Hex(password);
    if (hash !== registro.passwordHash) return false;

    const sesion: SesionUsuario = {
      id: registro.id,
      usuario: registro.usuario,
      nombre: registro.nombre,
    };
    setUsuario(sesion);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ usuario, cargando, login, logout }),
    [usuario, cargando, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
