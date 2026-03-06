# Database setup for Vercel

The app uses **PostgreSQL** on Vercel (SQLite is not supported on serverless). Use one of the options below.

**Important:** This app uses **Prisma** and its own tables (AdminUser, Category, Product, Order, OrderItem). Do **not** create the Supabase quickstart "notes" table or use Supabase client — just use the Postgres connection string as `DATABASE_URL` and run Prisma migrations.

---

## Option A: Supabase (Vercel integration)

If you already connected Supabase in Vercel (Storage → Supabase):

1. In **Vercel** → your project → **Settings** → **Environment Variables**.
2. Supabase may have already added vars. Add (or override) **one** that Prisma needs:
   - **Name:** `DATABASE_URL`
   - **Value:** use the **Prisma** connection string from Supabase. From the list you saw, use:
     - **`POSTGRES_PRISMA_URL`** (recommended for Prisma), or  
     - **`POSTGRES_URL`** if that’s what’s available.
   - Example value (yours will differ):  
     `postgres://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`
   - **Environment:** Production (and Preview if you use it).
3. **Run migrations once** (see “Run migrations” below). Ignore the Supabase “create notes table” quickstart — our app uses Prisma and creates its own tables.

---

## Option B: Vercel Postgres

1. In the **Vercel dashboard**, open your project (Karen-Arcay-Vintage).
2. Go to the **Storage** tab → **Create Database**.
3. Choose **Postgres** → follow the prompts (name it e.g. `karen-arcay-db`).
4. After it’s created, open the database → ****.env** tab** (or **Connect**).
5. Copy the **`.env` snippet** or the `POSTGRES_URL` (or `DATABASE_URL`) value.
6. In the project go to **Settings** → **Environment Variables**.
7. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** the connection string (starts with `postgresql://` or `postgres://`).
   - **Environment:** Production (and Preview if you use it).
8. **Run migrations once** (see “Run migrations” below).

---

## Option C: Neon (free tier)

1. Go to [neon.tech](https://neon.tech) and sign up (GitHub is fine).
2. **New project** → pick a name and region.
3. On the project dashboard, copy the **connection string** (Connection string / URI).
   - It looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
4. In **Vercel** → your project → **Settings** → **Environment Variables**.
5. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** the Neon connection string.
   - **Environment:** Production (and Preview if you want).
6. **Run migrations once** (see below).

---

## Run migrations (one time)

After `DATABASE_URL` is set, create the tables. Do this **once** from your computer (or from a one-off script).

**From your project folder:**

```bash
cd "/Users/alexarcay/Desktop/Think Vintage"
```

**If using Vercel Postgres:**  
In Vercel → Storage → your Postgres DB → copy the **connection string** (or the `POSTGRES_URL` from the .env snippet).

**Set the URL and run migrations:**

```bash
# Use the real connection string from Vercel or Neon (no quotes in the value when pasting)
export DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
npx prisma migrate deploy
```

If you don’t have a migration yet, create and apply it:

```bash
export DATABASE_URL="postgresql://..."
npx prisma migrate dev --name init
```

Then seed the admin user and categories:

```bash
npx prisma db seed
```

**Result:** Tables exist in the Postgres DB, admin user `admin` / `admin123` and categories are created.

---

## Local development

- Use the **same** `DATABASE_URL` in your local `.env` (e.g. the Neon URL) so you share one database, or  
- Create a **second** Neon (or Vercel Postgres) project and put that URL in `.env` for local only.

Your `prisma/schema.prisma` is already set to `provider = "postgresql"`, so local and Vercel both use Postgres.

---

## Checklist

| Step | Done |
|------|------|
| Create Postgres DB (Vercel Storage or Neon) | ☐ |
| Add `DATABASE_URL` in Vercel project env vars | ☐ |
| Run `npx prisma migrate deploy` (and seed) once | ☐ |
| Redeploy the Vercel project | ☐ |
