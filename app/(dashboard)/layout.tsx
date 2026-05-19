import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { Sidebar } from "@/app/components/layout/sidebar";
import { TopBar } from "@/app/components/layout/topbar";
import { MobileNav } from "@/app/components/layout/mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const empresa = await db.empresa
    .findUnique({
      where: { id: session.empresaId },
      select: { nombre: true },
    })
    .catch(() => null);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          usuario={{
            nombre: session.nombre,
            email: session.email,
            rol: session.rol,
            empresa: empresa?.nombre ?? "Fintech CFO",
          }}
        />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
