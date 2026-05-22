"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileBarChart,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  icon: typeof Landmark;
  label: string;
  description: string;
};

const navItems: NavItem[] = [
  {
    href: "/cfo",
    icon: Landmark,
    label: "CFO Cockpit",
    description: "Cierre, control y vision ejecutiva",
  },
  {
    href: "/cfo#consolidacion",
    icon: Building2,
    label: "Consolidacion",
    description: "Sociedades, eliminaciones y cierre",
  },
  {
    href: "/cfo#planificacion",
    icon: BarChart3,
    label: "Planificacion",
    description: "Presupuesto, forecast y escenarios",
  },
  {
    href: "/cfo#reporting",
    icon: FileBarChart,
    label: "Reporting",
    description: "Estados, ESG y reportes ejecutivos",
  },
];

function isItemActive(pathname: string, href: string) {
  const path = href.split("#")[0];
  return path === "/cfo" ? pathname === "/cfo" : pathname.startsWith(path);
}

const itemBase =
  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-150";
const itemIdle =
  "text-[var(--color-fg2)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-fg1)] hover:translate-x-[2px]";
const itemActive =
  "bg-gradient-to-r from-[var(--color-primary-tint)] to-[var(--color-surface-hover)] border-l-2 border-[var(--color-primary)] font-semibold text-[var(--color-fg1)] shadow-[var(--shadow-glow-blue)]";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "glass-panel hidden h-screen shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--glass-bg)] backdrop-blur-md transition-all duration-300 lg:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b border-[var(--color-border)] px-3">
        <Link href="/cfo" className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-fg1)]">
            <Landmark className="h-3.5 w-3.5 text-[var(--color-primary)]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[var(--color-fg1)] tracking-tight">
                Fintech CFO
              </div>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto rounded-md p-1 text-[var(--color-fg4)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-fg2)]"
          aria-label={collapsed ? "Expandir" : "Colapsar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!collapsed && (
          <div className="px-3 pb-1 pt-1">
            <p className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--color-fg4)]">
              Plataforma CFO
            </p>
          </div>
        )}
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = isItemActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(itemBase, isActive ? itemActive : itemIdle)}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive
                        ? "text-[var(--color-fg1)]"
                        : "text-[var(--color-fg3)] group-hover:text-[var(--color-fg2)]"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
