"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, FormField, Icon } from "@/design-system";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login, usuario, cargando } = useAuth();
  const router = useRouter();

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  // Si ya hay sesión, no mostrar el login.
  useEffect(() => {
    if (!cargando && usuario) router.replace("/");
  }, [cargando, usuario, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const ok = await login(nombreUsuario, password);
    setEnviando(false);
    if (ok) {
      router.replace("/");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  }

  const puedeEnviar = nombreUsuario.trim() !== "" && password !== "" && !enviando;

  return (
    <main className="app-shell" style={{ justifyContent: "center" }}>
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand__mark" aria-hidden>
            <Icon name="cuadrillas" size="lg" color="var(--ds-color-black)" />
          </span>
          <h1 className="app-title">Asignación de horas</h1>
          <p className="app-subtitle">Ingresá con tu usuario para continuar</p>
        </div>

        <form className="stack" onSubmit={onSubmit} noValidate>
          <FormField
            label="Usuario"
            placeholder="usuario"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            state={error ? "advertencia" : "standard"}
          />
          <FormField
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            state={error ? "advertencia" : "standard"}
            helperText={error ?? undefined}
          />

          <Button
            label={enviando ? "Ingresando…" : "Ingresar"}
            type="submit"
            color={puedeEnviar ? "green" : "gray"}
            state={puedeEnviar ? "standard" : "disabled"}
            fullWidth
          />
        </form>

        <p className="muted login-hint">
          Demo: <strong>admin</strong> / admin123
        </p>
      </div>
    </main>
  );
}
