import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "./db";
import {
  decryptSessionToken,
  encryptSessionToken,
  type SessionPayload,
} from "./session-token";

const COOKIE_NAME = "agrosuite-session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 dias

export type { SessionPayload };

export async function encryptSession(payload: SessionPayload) {
  return encryptSessionToken(payload);
}

export async function decryptSession(
  token: string
): Promise<SessionPayload | null> {
  return decryptSessionToken(token);
}

export async function createSession(payload: Omit<SessionPayload, "expiresAt">) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  const sessionData: SessionPayload = { ...payload, expiresAt };
  const token = await encryptSession(sessionData);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decryptSession(token);
});

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("No autenticado");
  }
  return session;
}

export async function requireEmpresaSession(): Promise<SessionPayload> {
  const session = await requireSession();
  if (!session.empresaId) {
    throw new Error("Sin empresa asociada");
  }
  return session;
}

export async function getUsuarioCompleto() {
  const session = await getSession();
  if (!session) return null;

  return db.usuario.findUnique({
    where: { id: session.usuarioId },
    include: { empresa: true },
  });
}
