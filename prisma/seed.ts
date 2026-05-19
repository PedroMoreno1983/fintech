import { PrismaClient } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no esta definido para el seed.");
}

const adapter = new PrismaPg(connectionString);
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Iniciando seed de Fintech CFO...");

  const empresa = await db.empresa.upsert({
    where: { rut: "76.543.210-8" },
    update: {
      nombre: "Holding Demo CFO",
      plan: "PRO",
      activa: true,
    },
    create: {
      nombre: "Holding Demo CFO",
      rut: "76.543.210-8",
      plan: "PRO",
    },
  });
  console.log("Empresa demo:", empresa.nombre);

  const passwordHash = await bcrypt.hash("Demo1234!", 12);
  const usuario = await db.usuario.upsert({
    where: { email: "demo@fintech.io" },
    update: {
      empresaId: empresa.id,
      nombre: "Pedro Moreno Demo",
      passwordHash,
      rol: "ADMIN_FINANZAS",
      activo: true,
    },
    create: {
      empresaId: empresa.id,
      nombre: "Pedro Moreno Demo",
      email: "demo@fintech.io",
      passwordHash,
      rol: "ADMIN_FINANZAS",
    },
  });
  console.log("Usuario demo:", usuario.email);

  console.log("\nSeed completado.");
  console.log("Acceso:");
  console.log("  Email:    demo@fintech.io");
  console.log("  Password: Demo1234!\n");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
