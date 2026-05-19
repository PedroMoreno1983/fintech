"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Landmark, Loader2 } from "lucide-react";
import { login } from "@/app/actions/auth";

const initialState = { errors: {}, message: "" };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <div className="hidden w-2/5 flex-col justify-between bg-[var(--color-fg1)] p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
            <Landmark className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Fintech CFO</span>
        </div>
        <div className="max-w-sm">
          <blockquote className="mb-4 text-2xl font-medium leading-snug tracking-tight">
            &ldquo;Cierre, control y reporting financiero en una sola plataforma.&rdquo;
          </blockquote>
          <p className="text-sm leading-relaxed text-white/60">
            Consolida datos financieros, arma escenarios, controla presupuesto y
            prepara reportes ejecutivos con trazabilidad.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6 text-xs text-white/50">
          <div>
            <div className="tnum text-base font-semibold text-white/90">CFO</div>
            <div className="mt-0.5">decision</div>
          </div>
          <div>
            <div className="tnum text-base font-semibold text-white/90">360</div>
            <div className="mt-0.5">control</div>
          </div>
          <div>
            <div className="text-base font-semibold text-white/90">Cloud</div>
            <div className="mt-0.5">Vercel + Neon</div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-fg1)]">
              <Landmark className="h-4 w-4 text-[var(--color-primary)]" />
            </div>
            <span className="text-base font-semibold text-[var(--color-fg1)] tracking-tight">
              Fintech CFO
            </span>
          </div>

          <h1 className="mb-1 text-xl font-semibold tracking-tight text-[var(--color-fg1)]">
            Iniciar sesion
          </h1>
          <p className="mb-6 text-sm text-[var(--color-fg3)]">
            Ingresa a tu cuenta financiera para continuar
          </p>

          <form action={formAction} className="space-y-4">
            {state.message && (
              <div className="rounded-md border border-[var(--color-danger-soft)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
                {state.message}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-[var(--color-fg2)]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="tu@email.com"
                className="h-10 w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-fg1)] placeholder:text-[var(--color-fg4)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
              />
              {state.errors?.email && (
                <p className="mt-1 text-sm text-[var(--color-danger)]">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-[var(--color-fg2)]"
              >
                Contrasena
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="********"
                className="h-10 w-full rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-fg1)] placeholder:text-[var(--color-fg4)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)]"
              />
              {state.errors?.password && (
                <p className="mt-1 text-sm text-[var(--color-danger)]">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary-active)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-fg3)]">
            No tienes cuenta?{" "}
            <Link
              href="/register"
              className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
            >
              Registrate gratis
            </Link>
          </p>

          <div className="mt-8 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--color-fg4)]">
              Credenciales demo
            </p>
            <p className="text-xs text-[var(--color-fg3)]">
              Email:{" "}
              <span className="font-mono font-medium text-[var(--color-fg2)]">
                demo@fintech.local
              </span>
            </p>
            <p className="text-xs text-[var(--color-fg3)]">
              Contrasena:{" "}
              <span className="font-mono font-medium text-[var(--color-fg2)]">
                Demo1234!
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
