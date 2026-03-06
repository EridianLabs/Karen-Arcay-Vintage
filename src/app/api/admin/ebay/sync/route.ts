import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  fetchStoreItemIds,
  fetchItemDetailsBatch,
  type EbaySyncResult,
} from "@/lib/ebay";
import { mapEbayCategoryToOurs } from "@/lib/ebay-categories";

/** Allow up to 5 minutes for sync (Vercel Pro supports 300s; Hobby 10s). */
export const maxDuration = 300;

/** Only products from this eBay seller are allowed on the site. Seller username: sindypink */
const ALLOWED_EBAY_SELLER = "sindypink";
const DEFAULT_STORE_NAME = ALLOWED_EBAY_SELLER;

/** Max items to process per sync run to stay under Vercel/serverless timeout. Run sync again to get more. */
const MAX_ITEMS_PER_RUN = 200;
const BATCH_SIZE = 20;
const DELAY_BETWEEN_BATCHES_MS = 200;

function streamSyncResponse(
  appId: string,
  clientSecret: string,
  sellerUsername: string,
  limit: number,
  skipExisting: boolean
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (obj: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };
      const result: EbaySyncResult = { created: 0, updated: 0, failed: 0, totalFetched: 0, errors: [] };
      try {
        emit({ type: "log", ts: Date.now(), message: "Starting sync…" });
        emit({ type: "log", ts: Date.now(), message: "Fetching item IDs from eBay (search + seller filter, 200 per page)…" });
        const { itemIds: allItemIds, errors: idErrors } = await fetchStoreItemIds(
          appId,
          clientSecret,
          sellerUsername,
          (offset, totalSoFar, keyword) => {
            const q = keyword ? ` "${keyword}"` : "";
            emit({
              type: "log",
              ts: Date.now(),
              message: `  Search${q} page (offset ${offset}): ${totalSoFar} item IDs so far`,
            });
          }
        );
        result.errors.push(...idErrors);
        emit({ type: "log", ts: Date.now(), message: `Item ID fetch done. Total: ${allItemIds.length} IDs.` });
        let itemIds: string[];
        if (skipExisting && allItemIds.length > 0) {
          const { prisma } = await import("@/lib/db");
          const existing = await prisma.product.findMany({
            where: { ebayItemId: { in: allItemIds } },
            select: { ebayItemId: true },
          });
          const existingSet = new Set((existing.map((p) => p.ebayItemId)).filter(Boolean));
          itemIds = allItemIds.filter((id) => !existingSet.has(id)).slice(0, limit);
          const alreadyCount = allItemIds.length - itemIds.length;
          emit({
            type: "log",
            ts: Date.now(),
            message: `Fetched ${allItemIds.length} from eBay; ${alreadyCount} already on site. Syncing ${itemIds.length} new (limit ${limit}).`,
          });
        } else {
          itemIds = allItemIds.slice(0, limit);
          emit({ type: "log", ts: Date.now(), message: `Fetched ${itemIds.length} item IDs (limit ${limit}).` });
        }
        result.totalFetched = itemIds.length;
        if (idErrors.length > 0) {
          idErrors.slice(0, 3).forEach((e) => emit({ type: "log", ts: Date.now(), message: `  ⚠ ${e}` }));
        }

        if (itemIds.length === 0) {
          emit({ type: "result", ...result });
          controller.close();
          return;
        }

        emit({ type: "log", ts: Date.now(), message: "Loading category list from database…" });
        const { prisma } = await import("@/lib/db");
        const categories = await prisma.category.findMany();
        const slugToCategoryId = new Map(categories.map((c) => [c.slug, c.id]));
        const allowedSeller = (sellerUsername || ALLOWED_EBAY_SELLER).toLowerCase();
        const totalBatches = Math.ceil(itemIds.length / BATCH_SIZE);
        emit({ type: "log", ts: Date.now(), message: `Processing ${itemIds.length} items in ${totalBatches} batch(es) (${BATCH_SIZE} per batch)…` });

        for (let offset = 0; offset < itemIds.length; offset += BATCH_SIZE) {
          const batchIndex = Math.floor(offset / BATCH_SIZE) + 1;
          const batch = itemIds.slice(offset, offset + BATCH_SIZE);
          emit({ type: "log", ts: Date.now(), message: `Batch ${batchIndex}/${totalBatches}: Fetching item details from eBay (${batch.length} getItem calls)…` });
          const detailsMap = await fetchItemDetailsBatch(appId, clientSecret, batch);
          emit({ type: "log", ts: Date.now(), message: `  Got details. Writing to database…` });
          if (offset + BATCH_SIZE < itemIds.length) {
            await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
          }

          let batchCreated = 0;
          let batchUpdated = 0;
          let batchFailed = 0;
          for (const itemId of batch) {
            const details = detailsMap.get(itemId);
            if (!details) {
              result.failed++;
              batchFailed++;
              continue;
            }
            result.errors.push(...details.errors);
            const itemSeller = (details.sellerUsername ?? "").toLowerCase();
            if (itemSeller !== allowedSeller) {
              result.failed++;
              batchFailed++;
              continue;
            }
            if (!details.title || details.price == null || !details.viewItemURL) {
              result.failed++;
              batchFailed++;
              continue;
            }
            const slug = mapEbayCategoryToOurs(details.primaryCategoryName);
            const categoryId = slug ? slugToCategoryId.get(slug) ?? null : null;
            const existing = await prisma.product.findUnique({ where: { ebayItemId: itemId } });
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
              ebayEndDate: details.ebayEndDate ? new Date(details.ebayEndDate) : null,
            };
            if (existing) {
              await prisma.product.update({ where: { id: existing.id }, data: payload });
              result.updated++;
              batchUpdated++;
            } else {
              await prisma.product.create({ data: payload });
              result.created++;
              batchCreated++;
            }
          }
          emit({
            type: "log",
            ts: Date.now(),
            message: `  Batch ${batchIndex} done: ${batchCreated} created, ${batchUpdated} updated, ${batchFailed} failed`,
          });
          if (batchIndex < totalBatches) {
            emit({ type: "log", ts: Date.now(), message: `  Waiting ${DELAY_BETWEEN_BATCHES_MS}ms before next batch…` });
          }
        }

        emit({ type: "log", ts: Date.now(), message: "Sync complete." });
        emit({ type: "result", ...result });
      } catch (err) {
        emit({
          type: "result",
          created: 0,
          updated: 0,
          failed: 0,
          totalFetched: 0,
          errors: [err instanceof Error ? err.message : String(err)],
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
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
  let limit = MAX_ITEMS_PER_RUN;
  let stream = false;
  let skipExisting = true;
  try {
    const body = await req.json().catch(() => ({}));
    if (body?.storeName) sellerUsername = body.storeName;
    if (body?.sellerUsername) sellerUsername = body.sellerUsername;
    if (typeof body?.limit === "number" && body.limit > 0) limit = Math.min(500, body.limit);
    if (body?.stream === true) stream = true;
    if (typeof body?.skipExisting === "boolean") skipExisting = body.skipExisting;
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

  if (stream) {
    return streamSyncResponse(appId, clientSecret, sellerUsername, limit, skipExisting);
  }

  const result: EbaySyncResult = { created: 0, updated: 0, failed: 0, totalFetched: 0, errors: [] };

  const { itemIds: allItemIds, errors: idErrors } = await fetchStoreItemIds(
    appId,
    clientSecret,
    sellerUsername
  );
  result.errors.push(...idErrors);
  let itemIds: string[];
  if (skipExisting && allItemIds.length > 0) {
    const existing = await prisma.product.findMany({
      where: { ebayItemId: { in: allItemIds } },
      select: { ebayItemId: true },
    });
    const existingSet = new Set((existing.map((p) => p.ebayItemId)).filter(Boolean));
    itemIds = allItemIds.filter((id) => !existingSet.has(id)).slice(0, limit);
  } else {
    itemIds = allItemIds.slice(0, limit);
  }
  result.totalFetched = itemIds.length;

  if (itemIds.length === 0 && idErrors.length > 0) {
    return NextResponse.json(result, { status: 200 });
  }

  const categories = await prisma.category.findMany();
  const slugToCategoryId = new Map(categories.map((c) => [c.slug, c.id]));

  const allowedSeller = (sellerUsername || ALLOWED_EBAY_SELLER).toLowerCase();

  for (let offset = 0; offset < itemIds.length; offset += BATCH_SIZE) {
    const batch = itemIds.slice(offset, offset + BATCH_SIZE);
    const detailsMap = await fetchItemDetailsBatch(appId, clientSecret, batch);
    if (offset + BATCH_SIZE < itemIds.length) {
      await new Promise((r) => setTimeout(r, DELAY_BETWEEN_BATCHES_MS));
    }

    for (const itemId of batch) {
      const details = detailsMap.get(itemId);
      if (!details) {
        result.failed++;
        continue;
      }
      result.errors.push(...details.errors);

      const itemSeller = (details.sellerUsername ?? "").toLowerCase();
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
        ebayEndDate: details.ebayEndDate ? new Date(details.ebayEndDate) : null,
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
    }
  }

  return NextResponse.json(result);
}
