"use client";

// Tras iniciar sesión, este punto verifica el tipo de usuario (rol) y lo
// envía a la pantalla correspondiente. No renderiza UI propia.

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { homeForRol } from "@/lib/roles";

export default function HomeRedirect() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && usuario) {
      router.replace(homeForRol(usuario.rol));
    }
  }, [cargando, usuario, router]);

  return null;
}
