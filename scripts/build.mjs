import { execSync } from "node:child_process";

const databaseUrl =
  process.env.DATABASE_POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.PRISMA_DATABASE_URL ??
  process.env.DATABASE_URL;

const directUrl =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.DATABASE_POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DIRECT_URL;

if (databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

if (directUrl) {
  process.env.DIRECT_URL = directUrl;
}

function run(command) {
  execSync(command, {
    stdio: "inherit",
    env: process.env,
  });
}

run("npx prisma generate");

if (process.env.VERCEL) {
  if (databaseUrl) {
    run("npx prisma migrate deploy");
    run("npm run db:ensure-demo");
  } else {
    console.warn(
      "Skipping prisma migrate deploy: no DATABASE_URL/POSTGRES_PRISMA_URL is configured."
    );
  }
}

run("next build");
