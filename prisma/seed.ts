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
  // eBay store categories (Sindypink's Vintage Store) – slugs must match mapEbayCategoryToOurs in src/lib/ebay-categories.ts
  const categories = [
    { name: "Vintage Lingerie", slug: "vintage-lingerie" },
    { name: "Shoes & Boots", slug: "shoes-boots" },
    { name: "Dresses", slug: "dresses" },
    { name: "Plus Sizes - Ladies Wear", slug: "plus-sizes" },
    { name: "Handbags", slug: "handbags" },
    { name: "Accessories", slug: "accessories" },
    { name: "Vintage Houseware", slug: "vintage-houseware" },
    { name: "Vintage Dolls & Toys", slug: "vintage-dolls-toys" },
    { name: "Sindy", slug: "sindy" },
    { name: "Sewing/Crafts", slug: "sewing-crafts" },
    { name: "Menswear", slug: "menswear" },
    { name: "Children's Wear", slug: "childrens-wear" },
    { name: "Vintage Furniture", slug: "vintage-furniture" },
    { name: "Coats & Jackets", slug: "coats-jackets" },
    { name: "Dolls' Houses & Accessories", slug: "dolls-houses" },
    { name: "Cosmetics & Perfume", slug: "cosmetics-perfume" },
    { name: "Vintage Millinery", slug: "vintage-millinery" },
    { name: "Vintage Jewellery", slug: "vintage-jewellery" },
    { name: "Vintage Books & Magazines", slug: "vintage-books-magazines" },
    { name: "Separates", slug: "separates" },
    { name: "Swimwear & Beachwear", slug: "swimwear-beachwear" },
    { name: "Film/Music", slug: "film-music" },
    { name: "Bridal/Wedding", slug: "bridal-wedding" },
    { name: "Men's Shoes", slug: "mens-shoes" },
    { name: "Other", slug: "other" },
  ];
  await prisma.category.deleteMany({});
  for (const c of categories) {
    await prisma.category.create({ data: c });
  }
  console.log("Seed done. Admin: username=admin, password=admin123. Categories: 25 eBay store categories.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
