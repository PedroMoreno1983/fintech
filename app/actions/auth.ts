"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { Prisma } from "@/app/generated/prisma";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";

const LoginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "Ingresa tu contraseña" }),
});

const RegisterSchema = z.object({
  nombre: z.string().min(2, { message: "Nombre muy corto" }),
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(8, { message: "Mínimo 8 caracteres" }),
  nombreEmpresa: z.string().min(2, { message: "Nombre de empresa muy corto" }),
  rut: z.string().optional(),
});

export type AuthState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function login(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  try {
  const usuario = await db.usuario.findUnique({
    where: { email: email.toLowerCase() },
    include: { empresa: true },
  });

  if (!usuario || !usuario.activo) {
    return { message: "Email o contraseña incorrectos" };
  }

  const passwordOk = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordOk) {
    return { message: "Email o contraseña incorrectos" };
  }

  await db.usuario.update({
    where: { id: usuario.id },
    data: { ultimoAcceso: new Date() },
  });

  await createSession({
    usuarioId: usuario.id,
    empresaId: usuario.empresaId,
    rol: usuario.rol,
    nombre: usuario.nombre,
    email: usuario.email,
  });
  } catch (error) {
    console.error("Login failed", error);

    return {
      message:
        "No pudimos iniciar sesion. Revisa que DATABASE_URL y SESSION_SECRET esten configurados en Vercel.",
    };
  }

  redirect("/cfo");
}

export async function register(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validated = RegisterSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    nombreEmpresa: formData.get("nombreEmpresa"),
    rut: formData.get("rut"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { nombre, email, password, nombreEmpresa, rut } = validated.data;
  const normalizedEmail = email.toLowerCase();
  const normalizedRut = rut?.trim() || null;

  const existente = await db.usuario.findUnique({
    where: { email: normalizedEmail },
  });

  if (existente) {
    return { errors: { email: ["Este email ya esta registrado"] } };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await db.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: {
          nombre: nombreEmpresa,
          rut: normalizedRut,
          plan: "SEMILLA",
        },
      });

      const usuario = await tx.usuario.create({
        data: {
          empresaId: empresa.id,
          nombre,
          email: normalizedEmail,
          passwordHash,
          rol: "EMPRESA_ADMIN",
        },
      });

      return {
        empresaId: empresa.id,
        usuarioId: usuario.id,
        usuarioRol: usuario.rol,
        usuarioNombre: usuario.nombre,
        usuarioEmail: usuario.email,
      };
    });

    await createSession({
      usuarioId: result.usuarioId,
      empresaId: result.empresaId,
      rol: result.usuarioRol,
      nombre: result.usuarioNombre,
      email: result.usuarioEmail,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(",")
        : String(error.meta?.target ?? "");

      if (target.includes("email")) {
        return { errors: { email: ["Este email ya esta registrado"] } };
      }

      if (target.includes("rut")) {
        return { errors: { rut: ["Este RUT ya esta registrado"] } };
      }
    }

    return { message: "No pudimos crear la cuenta en este momento." };
  }

  redirect("/cfo");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
