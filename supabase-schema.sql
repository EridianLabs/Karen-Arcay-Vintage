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
  "ebayItemId"  TEXT UNIQUE,
  "ebayUrl"     TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,
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

-- Indexes for common lookups (optional but helpful)
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS "Product_ebayItemId_idx" ON "Product"("ebayItemId");
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");

-- Seed: admin user (login: admin / admin123) and categories
INSERT INTO "AdminUser" ("id", "username", "password")
VALUES ('seed-admin-1', 'admin', '$2b$12$ttt3TQYgLdcu7iThgxWGjOhFTidIzobMcy6cUOBUC12ZxQBD9FaJS')
ON CONFLICT ("username") DO NOTHING;

INSERT INTO "Category" ("id", "name", "slug") VALUES
  ('cat-womens', 'Women''s', 'womens'),
  ('cat-mens', 'Men''s', 'mens'),
  ('cat-accessories', 'Accessories', 'accessories'),
  ('cat-dresses', 'Dresses', 'dresses'),
  ('cat-jackets', 'Jackets & Coats', 'jackets-coats'),
  ('cat-sale', 'Sale', 'sale')
ON CONFLICT ("slug") DO NOTHING;
