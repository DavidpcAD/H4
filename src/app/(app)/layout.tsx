import { RequireAuth } from "@/components/RequireAuth";

// Layout del área autenticada: todo lo que cuelga de aquí exige sesión.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth>{children}</RequireAuth>;
}
