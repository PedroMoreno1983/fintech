"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Landmark, LogOut, Sun, Moon, User } from "lucide-react";
import { logout } from "@/app/actions/auth";

const ROL_LABELS: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  EMPRESA_ADMIN: "Admin",
  ADMIN_FINANZAS: "Finanzas",
};

interface TopBarProps {
  usuario: {
    nombre: string;
    email: string;
    rol: string;
    empresa: string;
  };
}

export function TopBar({ usuario }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const currentTheme = (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  return (
    <header className="glass-panel flex h-14 shrink-0 items-center gap-4 border-b border-[var(--color-border)] bg-[var(--glass-bg)] px-4 backdrop-blur lg:px-6 z-10 transition-colors duration-150">
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-fg1)]">
          <Landmark className="h-4 w-4 text-[var(--color-primary)]" />
        </div>
        <span className="font-semibold text-[var(--color-fg1)] tracking-tight">
          Fintech CFO
        </span>
      </div>

      <div className="flex-1" />

      <button
        onClick={toggleTheme}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg3)] transition-all hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-fg1)] active:scale-90"
        aria-label="Cambiar tema"
        title={theme === "light" ? "Modo oscuro" : "Modo claro"}
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </button>

      <div className="hidden items-center gap-1.5 rounded-md border border-[var(--color-border-light)] bg-[var(--color-surface-alt)] px-3 py-1 text-sm text-[var(--color-fg3)] sm:flex">
        <span className="max-w-32 truncate font-medium text-[var(--color-fg2)]">
          {usuario.empresa}
        </span>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((current) => !current)}
          className="flex items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-[var(--color-surface-hover)]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-tint-md)]">
            <span className="text-sm font-semibold text-[var(--color-primary)]">
              {usuario.nombre.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium leading-tight text-[var(--color-fg1)]">
              {usuario.nombre.split(" ")[0]}
            </p>
            <p className="text-xs leading-tight text-[var(--color-fg3)]">
              {ROL_LABELS[usuario.rol] ?? usuario.rol}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 text-[var(--color-fg4)]" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-floating)]">
              <div className="border-b border-[var(--color-border-light)] px-4 py-3">
                <p className="text-sm font-medium text-[var(--color-fg1)]">
                  {usuario.nombre}
                </p>
                <p className="truncate text-xs text-[var(--color-fg3)]">
                  {usuario.email}
                </p>
              </div>
              <div className="py-1">
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-fg3)]">
                  <User className="h-4 w-4" />
                  {ROL_LABELS[usuario.rol] ?? usuario.rol}
                </div>
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesion
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
