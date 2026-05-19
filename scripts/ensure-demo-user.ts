import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no esta definido para asegurar el usuario demo.");
}

const adapter = new PrismaPg(connectionString);
const db = new PrismaClient({ adapter });

const DEMO_COMPANY = {
  rut: "76.543.210-8",
  nombre: "Fintech CFO Demo",
  plan: "PRO" as const,
};

const DEMO_USER = {
  nombre: "Pedro Moreno Demo",
  email: "demo@fintech.local",
  password: "Demo1234!",
  rol: "EMPRESA_ADMIN" as const,
};

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);

  const empresa = await db.empresa.upsert({
    where: { rut: DEMO_COMPANY.rut },
    update: {
      nombre: DEMO_COMPANY.nombre,
      plan: DEMO_COMPANY.plan,
      activa: true,
    },
    create: {
      nombre: DEMO_COMPANY.nombre,
      rut: DEMO_COMPANY.rut,
      plan: DEMO_COMPANY.plan,
    },
  });

  const usuario = await db.usuario.upsert({
    where: { email: DEMO_USER.email },
    update: {
      empresaId: empresa.id,
      nombre: DEMO_USER.nombre,
      passwordHash,
      rol: DEMO_USER.rol,
      activo: true,
    },
    create: {
      empresaId: empresa.id,
      nombre: DEMO_USER.nombre,
      email: DEMO_USER.email,
      passwordHash,
      rol: DEMO_USER.rol,
    },
  });

  console.log("Usuario demo reconciliado:", usuario.email);
  console.log("Empresa demo activa:", empresa.nombre);
}

main()
  .catch((error) => {
    console.error("Error asegurando usuario demo:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
