import { SignJWT, jwtVerify } from "jose";

function getSessionKey() {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    throw new Error("SESSION_SECRET is required");
  }

  return new TextEncoder().encode(sessionSecret);
}

export type SessionPayload = {
  usuarioId: string;
  empresaId: string;
  rol: string;
  nombre: string;
  email: string;
  expiresAt: Date;
};

export async function encryptSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionKey());
}

export async function decryptSessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const key = getSessionKey();
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
