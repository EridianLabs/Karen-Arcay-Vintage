-- Run this entire file in Supabase: SQL Editor → New query → paste all → Run
-- Creates tables + admin user (admin / admin123) + categories. No need to run anything from your machine.

-- 1. AdminUser
CREATE TABLE IF NOT EXISTS "AdminUser" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "username"  TEXT NOT NULL UNIQUE,
  "password"  TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Category
CREATE TABLE IF NOT EXISTS "Category" (
  "id"   TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE
);

-- 3. Product
CREATE TABLE IF NOT EXISTS "Product" (
  "id"          TEXT NOT NULL PRIMARY KEY,
  "title"       TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price"       DOUBLE PRECISION NOT NULL,
  "salePrice"   DOUBLE PRECISION,
  "categoryId"  TEXT,
  "images"      TEXT NOT NULL,
  "condition"   TEXT,
  "size"        TEXT,
  "published"   BOOLEAN NOT NULL DEFAULT true,
  "ebayItemId"      TEXT UNIQUE,
  "ebayUrl"         TEXT,
  "ebayEndDate"     TIMESTAMP(3),
  "ebayListingType" TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 4. Order
CREATE TABLE IF NOT EXISTS "Order" (
  "id"               TEXT NOT NULL PRIMARY KEY,
  "stripeSessionId"  TEXT UNIQUE,
  "email"             TEXT NOT NULL,
  "totalCents"        INTEGER NOT NULL,
  "status"            TEXT NOT NULL DEFAULT 'pending',
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. OrderItem
CREATE TABLE IF NOT EXISTS "OrderItem" (
  "id"         TEXT NOT NULL PRIMARY KEY,
  "orderId"    TEXT NOT NULL,
  "productId"  TEXT NOT NULL,
  "quantity"   INTEGER NOT NULL DEFAULT 1,
  "priceCents" INTEGER NOT NULL,
  CONSTRAINT "OrderItem_orderId_fkey"   FOREIGN KEY ("orderId")   REFERENCES "Order"("id")   ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_productId_fkey"  FOREIGN KEY ("productId")  REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- If Product table already exists, add ending-soon column: ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "ebayEndDate" TIMESTAMP(3);

-- Indexes for common lookups (optional but helpful)
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_ebayEndDate_idx" ON "Product"("ebayEndDate");
CREATE INDEX IF NOT EXISTS "Product_ebayItemId_idx" ON "Product"("ebayItemId");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");

-- Seed: admin user (login: admin / admin123) and categories
INSERT INTO "AdminUser" ("id", "username", "password")
VALUES ('seed-admin-1', 'admin', '$2b$12$ttt3TQYgLdcu7iThgxWGjOhFTidIzobMcy6cUOBUC12ZxQBD9FaJS')
ON CONFLICT ("username") DO NOTHING;

-- eBay store categories (sindypink) – slugs used by sync mapping
INSERT INTO "Category" ("id", "name", "slug") VALUES
  ('cat-vintage-lingerie', 'Vintage Lingerie', 'vintage-lingerie'),
  ('cat-shoes-boots', 'Shoes & Boots', 'shoes-boots'),
  ('cat-dresses', 'Dresses', 'dresses'),
  ('cat-plus-sizes', 'Plus Sizes - Ladies Wear', 'plus-sizes'),
  ('cat-handbags', 'Handbags', 'handbags'),
  ('cat-accessories', 'Accessories', 'accessories'),
  ('cat-vintage-houseware', 'Vintage Houseware', 'vintage-houseware'),
  ('cat-vintage-dolls-toys', 'Vintage Dolls & Toys', 'vintage-dolls-toys'),
  ('cat-sindy', 'Sindy', 'sindy'),
  ('cat-sewing-crafts', 'Sewing/Crafts', 'sewing-crafts'),
  ('cat-menswear', 'Menswear', 'menswear'),
  ('cat-childrens-wear', 'Children''s Wear', 'childrens-wear'),
  ('cat-vintage-furniture', 'Vintage Furniture', 'vintage-furniture'),
  ('cat-coats-jackets', 'Coats & Jackets', 'coats-jackets'),
  ('cat-dolls-houses', 'Dolls'' Houses & Accessories', 'dolls-houses'),
  ('cat-cosmetics-perfume', 'Cosmetics & Perfume', 'cosmetics-perfume'),
  ('cat-vintage-millinery', 'Vintage Millinery', 'vintage-millinery'),
  ('cat-vintage-jewellery', 'Vintage Jewellery', 'vintage-jewellery'),
  ('cat-vintage-books-magazines', 'Vintage Books & Magazines', 'vintage-books-magazines'),
  ('cat-separates', 'Separates', 'separates'),
  ('cat-swimwear-beachwear', 'Swimwear & Beachwear', 'swimwear-beachwear'),
  ('cat-film-music', 'Film/Music', 'film-music'),
  ('cat-bridal-wedding', 'Bridal/Wedding', 'bridal-wedding'),
  ('cat-mens-shoes', 'Men''s Shoes', 'mens-shoes'),
  ('cat-collectables-art', 'Collectables & Art', 'collectables-art'),
  ('cat-other', 'Other', 'other')
ON CONFLICT ("slug") DO NOTHING;

-- If Product table already exists without ebayListingType, run:
-- ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "ebayListingType" TEXT;
