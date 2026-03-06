import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * One-time database setup when you don't have Terminal/SSH.
 * Call: GET /api/setup-db?secret=YOUR_SETUP_SECRET
 * Add SETUP_SECRET to env (e.g. a random string). Remove or change it after use.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");
  const expected = process.env.SETUP_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const cwd = process.cwd();

    // 1. Apply schema (create/update tables)
    execSync("npx prisma db push --accept-data-loss", {
      cwd,
      stdio: "pipe",
      encoding: "utf-8",
    });
  } catch (e) {
    console.error("[setup-db] prisma db push failed:", e);
    return NextResponse.json(
      { error: "db push failed", detail: String(e) },
      { status: 500 }
    );
  }

  try {
    // 2. Seed: admin user + categories
    const hash = await bcrypt.hash("admin123", 12);
    await prisma.adminUser.upsert({
      where: { username: "admin" },
      update: {},
      create: { username: "admin", password: hash },
    });
    const categories = [
      { name: "Women's", slug: "womens" },
      { name: "Men's", slug: "mens" },
      { name: "Accessories", slug: "accessories" },
      { name: "Dresses", slug: "dresses" },
      { name: "Jackets & Coats", slug: "jackets-coats" },
      { name: "Sale", slug: "sale" },
    ];
    for (const c of categories) {
      await prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: c,
      });
    }
  } catch (e) {
    console.error("[setup-db] seed failed:", e);
    return NextResponse.json(
      { error: "seed failed", detail: String(e) },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Database ready. Admin: username=admin, password=admin123. Remove or change SETUP_SECRET.",
  });
}
