"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Building2, FileBarChart, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  icon: typeof Landmark;
  label: string;
};

const items: NavItem[] = [
  { href: "/cfo", icon: Landmark, label: "Cockpit" },
  { href: "/cfo#consolidacion", icon: Building2, label: "Cierre" },
  { href: "/cfo#planificacion", icon: BarChart3, label: "Plan" },
  { href: "/cfo#reporting", icon: FileBarChart, label: "Reportes" },
];

function isActive(pathname: string, href: string) {
  const path = href.split("#")[0];
  return path === "/cfo" ? pathname === "/cfo" : pathname.startsWith(path);
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur lg:hidden">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors",
              active
                ? "text-[var(--color-fg1)]"
                : "text-[var(--color-fg3)] hover:text-[var(--color-fg2)]"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
