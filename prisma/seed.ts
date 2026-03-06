import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hash,
    },
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
  console.log("Seed done. Admin: username=admin, password=admin123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
