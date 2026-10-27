import 'server-only'
import { db } from './db'

// ─── Self-healing database schema (Postgres) ─────────────────────────────────
// Creates any table/column the app needs directly on Neon, so a fresh deploy
// works with ZERO manual SQL steps. Everything is idempotent
// (CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS) and the whole check
// runs at most once per server process. Local SQLite dev is managed by
// `prisma db push` and is skipped here.
//
// ⚠ Table/index/constraint names MUST match prisma/schema.postgres.prisma
//   exactly (Prisma uses model names verbatim: "User", "Draft", "PublishedCv").

const PG_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username")`,
  `CREATE TABLE IF NOT EXISTS "Draft" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My CV',
    "templateId" TEXT NOT NULL DEFAULT 'modern',
    "themeJson" TEXT NOT NULL DEFAULT '{}',
    "cvJson" TEXT NOT NULL DEFAULT '{}',
    "photoData" TEXT NOT NULL DEFAULT '',
    "portfolioJson" TEXT NOT NULL DEFAULT '{}',
    "publishedUser" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "Draft_userId_idx" ON "Draft"("userId")`,
  `DO $$ BEGIN
     ALTER TABLE "Draft" ADD CONSTRAINT "Draft_userId_fkey"
     FOREIGN KEY ("userId") REFERENCES "User"("id")
     ON DELETE CASCADE ON UPDATE CASCADE;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `CREATE TABLE IF NOT EXISTS "PublishedCv" (
    "id" TEXT PRIMARY KEY,
    "username" TEXT NOT NULL,
    "claimKeyHash" TEXT NOT NULL DEFAULT '',
    "ownerUserId" TEXT,
    "displayName" TEXT NOT NULL DEFAULT 'My CV',
    "templateId" TEXT NOT NULL DEFAULT 'modern',
    "themeJson" TEXT NOT NULL DEFAULT '{}',
    "cvJson" TEXT NOT NULL DEFAULT '{}',
    "photoData" TEXT NOT NULL DEFAULT '',
    "portfolioJson" TEXT NOT NULL DEFAULT '{}',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "PublishedCv_username_key" ON "PublishedCv"("username")`,
  // Upgrades for databases created before v1.1
  `ALTER TABLE "PublishedCv" ADD COLUMN IF NOT EXISTS "ownerUserId" TEXT`,
  `ALTER TABLE "PublishedCv" ADD COLUMN IF NOT EXISTS "portfolioJson" TEXT NOT NULL DEFAULT '{}'`,
  `ALTER TABLE "PublishedCv" ADD COLUMN IF NOT EXISTS "photoData" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "PublishedCv" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
]

let ensured: Promise<void> | null = null

async function run(): Promise<void> {
  const url = process.env.DATABASE_URL || ''
  if (!/^postgres(ql)?:/i.test(url)) return // SQLite dev — schema handled by prisma db push
  const started = Date.now()
  for (const sql of PG_STATEMENTS) {
    try {
      await db.$executeRawUnsafe(sql)
    } catch (err) {
      // Never take requests down because of a DDL hiccup — the real query will
      // surface a proper error if something is genuinely broken.
      console.error('[schema] statement failed:', (err as Error).message)
    }
  }
  console.log(`[schema] database schema verified in ${Date.now() - started}ms`)
}

/** Call at the top of any route handler that touches the database. Never throws. */
export function ensureSchema(): Promise<void> {
  if (!ensured) {
    ensured = run().catch((err) => {
      console.error('[schema] ensureSchema crashed:', (err as Error).message)
    })
  }
  return ensured
}
