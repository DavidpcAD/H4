"use client";

// Autenticación contra la API real (/api/auth/*). La sesión vive en una cookie
// httpOnly que setea el servidor; el cliente solo conoce los datos no sensibles
// del usuario, que rehidrata con GET /api/auth/me al montar.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface SesionUsuario {
  id: number;
  username: string;
  nombre: string;
  rol: string | null;
}

export interface LoginResult {
  ok: boolean;
  /** Mensaje a mostrar cuando falla (credenciales, conexión, config…). */
  message?: string;
}

interface AuthContextValue {
  usuario: SesionUsuario | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<SesionUsuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Rehidratar sesión desde la cookie al montar.
  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (activo && res.ok) setUsuario((await res.json()) as SesionUsuario);
      } catch {
        // sin sesión
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResult> => {
      let res: Response;
      try {
        res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
      } catch {
        return { ok: false, message: "No se pudo contactar al servidor" };
      }

      if (res.ok) {
        const data = (await res.json()) as { user: SesionUsuario };
        setUsuario(data.user);
        return { ok: true };
      }

      // 401 = credenciales; otros (500…) = config/conexión: mostramos el motivo.
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      const message =
        res.status === 401
          ? "Usuario o contraseña incorrectos"
          : (body?.message ?? `Error del servidor (${res.status})`);
      return { ok: false, message };
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUsuario(null);
    }
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
