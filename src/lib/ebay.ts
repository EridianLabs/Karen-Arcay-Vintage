/**
 * eBay store sync using Browse API (Finding/Shopping APIs were decommissioned Feb 2025).
 * Requires OAuth app token (EBAY_APP_ID + EBAY_CLIENT_SECRET).
 * Search by seller: filter=sellers:{username}. Item details via getItem.
 */

const EBAY_MARKETPLACE_UK = "EBAY_GB";
const BROWSE_SCOPE = "https://api.ebay.com/oauth/api_scope";

export type EbaySyncResult = {
  created: number;
  updated: number;
  failed: number;
  totalFetched: number;
  errors: string[];
};

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(appId: string, clientSecret: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }
  const credentials = Buffer.from(`${appId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: BROWSE_SCOPE,
    }).toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eBay OAuth failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 7200) * 1000,
  };
  return cachedToken.token;
}

/**
 * Fetch all active listing item IDs for a seller using keyword search + seller filter.
 * No category_ids – uses q=vintage and filter=sellers:{username}, paginated.
 * Optional onPage(offset, totalSoFar) called after each page for progress.
 */
export async function fetchStoreItemIds(
  appId: string,
  clientSecret: string,
  sellerUsername: string,
  onPage?: (offset: number, totalSoFar: number) => void
): Promise<{ itemIds: string[]; errors: string[] }> {
  const seen = new Set<string>();
  const itemIds: string[] = [];
  const errors: string[] = [];

  let token: string;
  try {
    token = await getAccessToken(appId, clientSecret);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Failed to get eBay OAuth token");
    return { itemIds, errors };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "X-EBAY-C-MARKETPLACE-ID": EBAY_MARKETPLACE_UK,
  };

  const limit = 200;
  const maxItems = 5000;
  const requestTimeoutMs = 25000;
  const sellerFilter = `sellers:{${sellerUsername}}`;
  const expectedSellerLower = sellerUsername.toLowerCase();

  let offset = 0;
  for (;;) {
    if (seen.size >= maxItems) break;
    const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    url.searchParams.set("q", "vintage");
    url.searchParams.set("filter", sellerFilter);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);
    let res: Response;
    try {
      res = await fetch(url.toString(), { headers, signal: controller.signal });
    } catch (e) {
      clearTimeout(timeoutId);
      errors.push(e instanceof Error ? e.message : "Search request failed");
      break;
    }
    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text();
      errors.push(`Browse API search HTTP ${res.status}: ${text.slice(0, 200)}`);
      break;
    }

    const data = (await res.json()) as {
      itemSummaries?: Array<{ itemId?: string; seller?: { username?: string } }>;
    };
    const summaries = data?.itemSummaries ?? [];

    let newOnThisPage = 0;
    for (const s of summaries) {
      if (seen.size >= maxItems) break;
      if (!s?.itemId) continue;
      const itemSeller = (s.seller?.username ?? "").toLowerCase();
      if (itemSeller !== expectedSellerLower) continue;
      if (seen.has(s.itemId)) continue;
      seen.add(s.itemId);
      itemIds.push(s.itemId);
      newOnThisPage++;
    }

    onPage?.(offset, itemIds.length);

    if (summaries.length === 0) break;
    if (summaries.length === limit && newOnThisPage === 0) break;
    offset += limit;
  }

  return { itemIds, errors };
}

export async function fetchItemDetails(
  appId: string,
  clientSecret: string,
  itemId: string
): Promise<{
  itemId: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  viewItemURL?: string;
  imageUrls?: string[];
  condition?: string;
  primaryCategoryName?: string;
  sellerUsername?: string;
  /** ISO date string when listing/auction ends (Browse API itemEndDate) */
  ebayEndDate?: string;
  errors: string[];
}> {
  const errors: string[] = [];

  let token: string;
  try {
    token = await getAccessToken(appId, clientSecret);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Failed to get eBay OAuth token");
    return { itemId, errors };
  }

  const itemIdEnc = encodeURIComponent(itemId);
  const res = await fetch(
    `https://api.ebay.com/buy/browse/v1/item/${itemIdEnc}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-EBAY-C-MARKETPLACE-ID": EBAY_MARKETPLACE_UK,
      },
    }
  );

  if (!res.ok) {
    errors.push(`Browse API getItem HTTP ${res.status} for ${itemId}`);
    return { itemId, errors };
  }

  const item = (await res.json()) as {
    title?: string;
    shortDescription?: string;
    itemDescription?: string;
    price?: { value?: string; currency?: string };
    itemWebUrl?: string;
    image?: { imageUrl?: string };
    additionalImages?: Array<{ imageUrl?: string }>;
    condition?: string;
    conditionId?: string;
    /** Browse API: top-level category path (e.g. "Clothing|Women|Dresses") – use this for mapping */
    categoryPath?: string;
    categoryId?: string;
    /** When the listing/auction ends (ISO string) – for "ending soon" */
    itemEndDate?: string;
    primaryItemCategory?: { categoryName?: string };
    seller?: { username?: string };
  };

  const title = item?.title ?? "";
  const desc =
    item?.shortDescription ??
    (typeof item?.itemDescription === "string"
      ? item.itemDescription
      : "");
  const description = (desc || title)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);

  const priceVal = item?.price?.value;
  const price = priceVal != null ? parseFloat(priceVal) : undefined;
  const currency = item?.price?.currency ?? "GBP";
  const viewItemURL = item?.itemWebUrl ?? "";

  const imageUrls: string[] = [];
  if (item?.image?.imageUrl) imageUrls.push(item.image.imageUrl);
  const extra = item?.additionalImages ?? [];
  for (const img of extra) {
    if (img?.imageUrl) imageUrls.push(img.imageUrl);
  }

  const condition = item?.condition ?? item?.conditionId ?? "";
  const primaryCategoryName =
    item?.categoryPath ?? item?.primaryItemCategory?.categoryName ?? "";
  const sellerUsername = item?.seller?.username ?? "";
  const ebayEndDate = item?.itemEndDate ?? undefined;

  return {
    itemId,
    title,
    description,
    price,
    currency,
    viewItemURL,
    imageUrls: imageUrls.length ? imageUrls : undefined,
    condition,
    primaryCategoryName,
    sellerUsername,
    ebayEndDate,
    errors,
  };
}

/** Fetch up to 20 items using getItem per item (getItems batch is Limited Release and returns 403 for most apps). */
export async function fetchItemDetailsBatch(
  appId: string,
  clientSecret: string,
  itemIds: string[]
): Promise<Map<string, Awaited<ReturnType<typeof fetchItemDetails>>>> {
  const slice = itemIds.slice(0, 20);
  if (slice.length === 0) return new Map();

  const out = new Map<string, Awaited<ReturnType<typeof fetchItemDetails>>>();
  for (let i = 0; i < slice.length; i++) {
    const detail = await fetchItemDetails(appId, clientSecret, slice[i]);
    out.set(slice[i], detail);
    if (i < slice.length - 1) {
      await new Promise((r) => setTimeout(r, 150));
    }
  }
  return out;
}
