import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  fetchStoreItemIds,
  fetchItemDetails,
  type EbaySyncResult,
} from "@/lib/ebay";

/** Only products from this eBay seller are allowed on the site. Seller username: sindypink */
const ALLOWED_EBAY_SELLER = "sindypink";
const DEFAULT_STORE_NAME = ALLOWED_EBAY_SELLER;

function mapEbayCategoryToOurs(ebayCategoryName: string | undefined): string | null {
  if (!ebayCategoryName) return null;
  const name = ebayCategoryName.toLowerCase();
  // Map eBay category names to our category slugs (from seed)
  if (name.includes("women") || name.includes("ladies")) return "womens";
  if (name.includes("men")) return "mens";
  if (name.includes("accessor") || name.includes("jewell") || name.includes("watch")) return "accessories";
  if (name.includes("dress")) return "dresses";
  if (name.includes("jacket") || name.includes("coat")) return "jackets-coats";
  return null;
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appId = process.env.EBAY_APP_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  let sellerUsername = process.env.EBAY_STORE_NAME || process.env.EBAY_SELLER_USERNAME || DEFAULT_STORE_NAME;
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.storeName) sellerUsername = body.storeName;
    if (body?.sellerUsername) sellerUsername = body.sellerUsername;
  } catch {
    // leave as env or default
  }

  if (!appId || !clientSecret) {
    return NextResponse.json(
      {
        error:
          "EBAY_APP_ID and EBAY_CLIENT_SECRET (Cert ID) are required for eBay sync. Add both in cPanel. Browse API uses OAuth.",
      },
      { status: 400 }
    );
  }

  const result: EbaySyncResult = { created: 0, updated: 0, failed: 0, totalFetched: 0, errors: [] };

  const { itemIds, errors: idErrors } = await fetchStoreItemIds(
    appId,
    clientSecret,
    sellerUsername
  );
  result.errors.push(...idErrors);
  result.totalFetched = itemIds.length;

  if (itemIds.length === 0 && idErrors.length > 0) {
    return NextResponse.json(result, { status: 200 });
  }

  const categories = await prisma.category.findMany();
  const slugToCategoryId = new Map(categories.map((c) => [c.slug, c.id]));

  for (let i = 0; i < itemIds.length; i++) {
    const itemId = itemIds[i];
    const details = await fetchItemDetails(appId, clientSecret, itemId);
    result.errors.push(...details.errors);

    const itemSeller = (details.sellerUsername ?? "").toLowerCase();
    const allowedSeller = (sellerUsername || ALLOWED_EBAY_SELLER).toLowerCase();
    if (itemSeller !== allowedSeller) {
      result.failed++;
      continue;
    }

    if (!details.title || details.price == null || !details.viewItemURL) {
      result.failed++;
      continue;
    }

    const slug = mapEbayCategoryToOurs(details.primaryCategoryName);
    const categoryId = slug ? slugToCategoryId.get(slug) ?? null : null;

    const existing = await prisma.product.findUnique({
      where: { ebayItemId: itemId },
    });

    const payload = {
      title: details.title,
      description: details.description ?? details.title,
      price: details.price,
      salePrice: null as number | null,
      categoryId,
      images: JSON.stringify(details.imageUrls?.length ? details.imageUrls : []),
      condition: details.condition ?? null,
      size: null as string | null,
      published: true,
      ebayItemId: itemId,
      ebayUrl: details.viewItemURL,
    };

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: payload,
      });
      result.updated++;
    } else {
      await prisma.product.create({ data: payload });
      result.created++;
    }

    // Rate limit: ~5000 calls/day for Shopping API – throttle to ~1 per 0.2s
    if (i < itemIds.length - 1) {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  return NextResponse.json(result);
}
