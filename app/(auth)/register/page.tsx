"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Landmark, Loader2 } from "lucide-react";
import { register } from "@/app/actions/auth";

const initialState = { errors: {}, message: "" };

const fieldBase =
  "h-10 w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-fg1)] placeholder:text-[var(--color-fg4)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]";
const labelBase = "mb-1 block text-sm font-medium text-[var(--color-fg2)]";
const errorText = "mt-1 text-sm text-[var(--color-danger)]";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] p-6">
      <div className="w-full max-w-lg rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-fg1)]">
            <Landmark className="h-4 w-4 text-[var(--color-primary)]" />
          </div>
          <span className="text-base font-semibold text-[var(--color-fg1)] tracking-tight">
            Fintech CFO
          </span>
        </div>

        <h1 className="mb-1 text-xl font-semibold tracking-tight text-[var(--color-fg1)]">
          Crea tu cuenta
        </h1>
        <p className="mb-6 text-sm text-[var(--color-fg3)]">
          Parte con una base financiera para controlar, consolidar y reportar.
        </p>

        <form action={formAction} className="space-y-4">
          {state.message && (
            <div className="rounded-md border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
              {state.message}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelBase}>Tu nombre *</label>
              <input
                name="nombre"
                required
                placeholder="Pedro Gonzalez"
                className={fieldBase}
              />
              {state.errors?.nombre && (
                <p className={errorText}>{state.errors.nombre[0]}</p>
              )}
            </div>
            <div>
              <label className={labelBase}>Nombre de empresa *</label>
              <input
                name="nombreEmpresa"
                required
                placeholder="Holding Demo"
                className={fieldBase}
              />
              {state.errors?.nombreEmpresa && (
                <p className={errorText}>{state.errors.nombreEmpresa[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelBase}>RUT empresa (opcional)</label>
            <input
              name="rut"
              placeholder="76.543.210-8"
              className={fieldBase}
            />
            {state.errors?.rut && (
              <p className={errorText}>{state.errors.rut[0]}</p>
            )}
          </div>

          <div>
            <label className={labelBase}>Email *</label>
            <input
              name="email"
              type="email"
              required
              placeholder="pedro@empresa.cl"
              className={fieldBase}
            />
            {state.errors?.email && (
              <p className={errorText}>{state.errors.email[0]}</p>
            )}
          </div>

          <div>
            <label className={labelBase}>Contrasena *</label>
            <input
              name="password"
              type="password"
              required
              placeholder="Minimo 8 caracteres"
              className={fieldBase}
            />
            {state.errors?.password && (
              <p className={errorText}>{state.errors.password[0]}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Creando cuenta..." : "Crear cuenta gratis"}
          </button>

          <p className="text-center text-xs text-[var(--color-fg4)]">
            Al registrarte aceptas nuestros{" "}
            <a href="#" className="underline">
              terminos de servicio
            </a>{" "}
            y{" "}
            <a href="#" className="underline">
              politica de privacidad
            </a>
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-fg3)]">
          Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
          >
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
