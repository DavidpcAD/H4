"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ScreenIngeniero } from "@/marcaje/ScreenIngeniero";
import { useAuth } from "@/lib/auth";
import { homeForRol } from "@/lib/roles";

export default function IngenieroPage() {
  const { usuario, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (usuario && homeForRol(usuario.rol) !== "/ingeniero") {
      router.replace(homeForRol(usuario.rol));
    }
  }, [usuario, router]);

  return (
    <ScreenIngeniero
      nombre={usuario?.nombre ?? "Ingeniero Residente"}
      onLogout={() => logout()}
    />
  );
}
