import "server-only";
import { NextResponse } from "next/server";

// Helpers de respuesta HTTP para los Route Handlers. Centralizan el shape de
// error que el cliente espera ({ message, details? }).

export function ok<T>(body: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(body, { status: 200, ...init });
}

export function bad(message: string, status = 400, details?: unknown): NextResponse {
  return NextResponse.json(
    { message, ...(details !== undefined ? { details } : {}) },
    { status },
  );
}

export function fail(err: unknown): NextResponse {
  const status =
    err && typeof err === "object" && "status" in err
      ? ((err as { status?: number }).status ?? 500)
      : 500;
  const message = err instanceof Error ? err.message : String(err);
  return NextResponse.json({ message }, { status });
}
