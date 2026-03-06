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
 */
export async function fetchStoreItemIds(
  appId: string,
  clientSecret: string,
  sellerUsername: string
): Promise<{ itemIds: string[]; errors: string[] }> {
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
  const sellerFilter = `sellers:{${sellerUsername}}`;
  const expectedSellerLower = sellerUsername.toLowerCase();

  let offset = 0;
  for (;;) {
    const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    url.searchParams.set("q", "vintage");
    url.searchParams.set("filter", sellerFilter);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      const text = await res.text();
      errors.push(`Browse API search HTTP ${res.status}: ${text.slice(0, 200)}`);
      break;
    }

    const data = (await res.json()) as {
      itemSummaries?: Array<{ itemId?: string; seller?: { username?: string } }>;
    };
    const summaries = data?.itemSummaries ?? [];

    for (const s of summaries) {
      if (!s?.itemId) continue;
      const itemSeller = (s.seller?.username ?? "").toLowerCase();
      if (itemSeller !== expectedSellerLower) continue;
      itemIds.push(s.itemId);
    }

    if (summaries.length === 0) break;
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
  const primaryCategoryName = item?.primaryItemCategory?.categoryName;
  const sellerUsername = item?.seller?.username ?? "";

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
    errors,
  };
}

const ITEM_DETAIL_SHAPE = {
  title: undefined as string | undefined,
  description: undefined as string | undefined,
  price: undefined as number | undefined,
  currency: "GBP" as string,
  viewItemURL: undefined as string | undefined,
  imageUrls: undefined as string[] | undefined,
  condition: undefined as string | undefined,
  primaryCategoryName: undefined as string | undefined,
  sellerUsername: undefined as string | undefined,
  errors: [] as string[],
};

/** Fetch up to 20 items in one request (Browse API getItems). Returns same shape as fetchItemDetails per item. */
export async function fetchItemDetailsBatch(
  appId: string,
  clientSecret: string,
  itemIds: string[]
): Promise<Map<string, Awaited<ReturnType<typeof fetchItemDetails>>>> {
  const out = new Map<string, Awaited<ReturnType<typeof fetchItemDetails>>>();
  const slice = itemIds.slice(0, 20);
  if (slice.length === 0) return out;

  let token: string;
  try {
    token = await getAccessToken(appId, clientSecret);
  } catch {
    for (const id of slice) {
      out.set(id, { ...ITEM_DETAIL_SHAPE, itemId: id, errors: ["Failed to get eBay OAuth token"] });
    }
    return out;
  }

  const idsParam = slice.map((id) => encodeURIComponent(id)).join(",");
  const url = `https://api.ebay.com/buy/browse/v1/item?item_ids=${idsParam}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "X-EBAY-C-MARKETPLACE-ID": EBAY_MARKETPLACE_UK,
    },
  });

  if (!res.ok) {
    const err = `Browse API getItems HTTP ${res.status}`;
    for (const id of slice) {
      out.set(id, { ...ITEM_DETAIL_SHAPE, itemId: id, errors: [err] });
    }
    return out;
  }

  const data = (await res.json()) as {
    items?: Array<{
      itemId?: string;
      title?: string;
      shortDescription?: string;
      itemDescription?: string;
      price?: { value?: string; currency?: string };
      itemWebUrl?: string;
      image?: { imageUrl?: string };
      additionalImages?: Array<{ imageUrl?: string }>;
      condition?: string;
      conditionId?: string;
      primaryItemCategory?: { categoryName?: string };
      seller?: { username?: string };
    }>;
  };

  const items = data?.items ?? [];
  for (const item of items) {
    const itemId = item?.itemId ?? "";
    const title = item?.title ?? "";
    const desc =
      item?.shortDescription ??
      (typeof item?.itemDescription === "string" ? item.itemDescription : "");
    const description = (desc || title)
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);
    const priceVal = item?.price?.value;
    const price = priceVal != null ? parseFloat(priceVal) : undefined;
    const viewItemURL = item?.itemWebUrl ?? "";
    const imageUrls: string[] = [];
    if (item?.image?.imageUrl) imageUrls.push(item.image.imageUrl);
    for (const img of item?.additionalImages ?? []) {
      if (img?.imageUrl) imageUrls.push(img.imageUrl);
    }
    const condition = item?.condition ?? item?.conditionId ?? "";
    const primaryCategoryName = item?.primaryItemCategory?.categoryName;
    const sellerUsername = item?.seller?.username ?? "";

    out.set(itemId, {
      itemId,
      title,
      description,
      price,
      currency: item?.price?.currency ?? "GBP",
      viewItemURL,
      imageUrls: imageUrls.length ? imageUrls : undefined,
      condition,
      primaryCategoryName,
      sellerUsername,
      errors: [],
    });
  }
  for (const id of slice) {
    if (!out.has(id)) {
      out.set(id, { ...ITEM_DETAIL_SHAPE, itemId: id, errors: ["Item not in response"] });
    }
  }
  return out;
}
