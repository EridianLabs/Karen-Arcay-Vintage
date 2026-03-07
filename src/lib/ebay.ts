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

/** Search keywords used to discover seller listings. One search only returns items matching that keyword, so we run several and merge to get closer to the store’s full count (e.g. 787). */
const STORE_SEARCH_KEYWORDS = [
  "vintage",
  "retro",
  "antique",
  "(vintage,retro,antique,1970s,1960s,1950s)",
  "vintage dress",
  "vintage jacket",
  "vintage shoes",
  "vintage clothing",
  "Sindy",
  "Laura Ashley",
  "vintage blouse",
  "vintage skirt",
  "vintage coat",
  "vintage handbag",
  "1980s",
  "1990s",
  "1970s",
  "1960s",
  "1950s",
  "1940s",
  "vintage maxi dress",
  "vintage midi dress",
  "vintage cardigan",
  "vintage jumper",
  "vintage knitwear",
  "vintage blazer",
  "vintage trousers",
  "vintage scarf",
  "vintage hat",
  "vintage millinery",
  "vintage wedding",
  "vintage bridal",
  "vintage lingerie",
  "vintage nightdress",
  "vintage jewellery",
  "vintage necklace",
  "vintage bracelet",
  "vintage brooch",
  "vintage earrings",
  "vintage bag",
  "vintage gloves",
  "vintage belt",
  "vintage waistcoat",
  "vintage tie",
  "vintage playsuit",
  "vintage jumpsuit",
  "vintage shorts",
  "vintage dressing gown",
  "vintage robe",
  "Seasalt",
  "Jaeger",
  "Moschino",
  "Gucci",
  "St Michael",
  "M&S vintage",
  "Pippa doll",
  "Barbie vintage",
  "vintage doll",
  "dolls house",
  "vintage fabric",
  "vintage sewing",
  "vintage typewriter",
  "vintage furniture",
  "vintage lamp",
  "vintage mirror",
  "vintage vase",
  "vintage china",
  "vintage plate",
  "vintage teapot",
  "vintage jug",
  "vintage glass",
  "vintage decanter",
  "Avon vintage",
  "Yardley vintage",
  "Estée Lauder vintage",
  "vintage perfume",
  "vintage cosmetics",
  "Pedigree Sindy",
  "Liberty fabric",
  "BHS vintage",
  "Horrockses",
  "C&A vintage",
  "Wallis vintage",
  "Beyond Retro",
  "Faerie Glen",
  "Frank Usher",
  "Aquascutum",
  "Pierre Cardin vintage",
  "Roland Klein",
  "Jean Muir vintage",
  "Caroline Charles",
  "Valentino vintage",
  "Gianni Versace",
  "Salvatore Ferragamo",
  "Charles Jourdan",
  "Yves Saint Laurent",
  "Dolce Gabbana vintage",
  "Tommy Hilfiger vintage",
  "Clarks vintage",
  "Dr Martens vintage",
  "Hobbs vintage",
  "Rayne shoes",
  "Church shoes vintage",
  "Loake vintage",
  "Kangol vintage",
  "New Look vintage",
  "Topshop vintage",
  "Miss Selfridge vintage",
  "Hell Bunny",
  "Palitoy Pippa",
  "Chad Valley",
  "Mattel Ken",
  "Dinky Toys",
  "G Plan vintage",
  "Ercol vintage",
  "Olivetti typewriter",
  "Royal typewriter",
  "Singer sewing",
  "Pfaff sewing",
  "Viyella vintage",
  "British Airways vintage",
  "Windsmoore",
  "Needlecord skirt",
  "Dirndl vintage",
  "Barkcloth dress",
  "Tea dress vintage",
  "Wiggle dress",
  "Kaftan vintage",
  "Smock dress vintage",
  "Pinafore vintage",
  "Petticoat vintage",
  "Housecoat vintage",
  "Negligee vintage",
  "Jodhpurs vintage",
  "Brocade dress",
  "Sequin vintage",
  "Y2K vintage",
  "Northern Soul vintage",
  "vintage kipper tie",
  "Dorothy Perkins vintage",
  "Lipstick dress",
  "Britta Oldendorf",
  "Pret a Porter vintage",
  "St Michael blouse",
  "M&S skirt vintage",
  "Double Two vintage",
  "vintage nightdress",
  "vintage slip",
  "vintage petticoat",
  "vintage cassette",
  "vintage vinyl",
  "miniature dolls house",
  "cocktail cabinet vintage",
  "vintage overall",
  "vintage pinafore",
  "vintage waistcoat",
  "vintage tie",
  "vintage cravat",
  "vintage scarf",
  "vintage stole",
  "vintage wrap",
  "vintage shawl",
  "vintage suspender",
  "vintage bra",
  "vintage swimsuit",
  "vintage swimming costume",
  "vintage bikini",
  "vintage coat dress",
  "vintage maxi",
  "vintage midi",
  "vintage rockabilly",
  "vintage pin up",
  "vintage mod",
  "vintage boho",
  "vintage hippy",
  "Laura Ashley dress",
  "Laura Ashley skirt",
  "Laura Ashley blouse",
  "Laura Ashley coat",
];

/** Max keywords per sync so the ID phase fits within serverless timeout (~5 min). Each keyword = 1+ eBay request. */
const MAX_KEYWORDS_FOR_SYNC = 70;

/**
 * Fetch all active listing item IDs for a seller using keyword search + seller filter.
 * Runs multiple keyword searches and merges results so we don’t miss items that don’t match “vintage” (e.g. store shows 787 but one search only returns ~414).
 * Optional onPage(offset, totalSoFar, keyword?) called after each page for progress.
 */
export async function fetchStoreItemIds(
  appId: string,
  clientSecret: string,
  sellerUsername: string,
  onPage?: (offset: number, totalSoFar: number, keyword?: string) => void,
  onKeywordStart?: (keyword: string, index: number, total: number) => void,
  onPageStart?: (offset: number, keyword: string) => void
): Promise<{ itemIds: string[]; errors: string[] }> {
  const seen = new Set<string>();
  const itemIds: string[] = [];
  const errors: string[] = [];
  const keywords = STORE_SEARCH_KEYWORDS.slice(0, MAX_KEYWORDS_FOR_SYNC);
  const totalKeywords = keywords.length;

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

  let keywordIndex = 0;
  for (const keyword of keywords) {
    if (seen.size >= maxItems) break;
    keywordIndex++;
    onKeywordStart?.(keyword, keywordIndex, totalKeywords);
    let offset = 0;
    for (;;) {
      if (seen.size >= maxItems) break;
      const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
      url.searchParams.set("q", keyword);
      url.searchParams.set("filter", sellerFilter);
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("offset", String(offset));

      onPageStart?.(offset, keyword);
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

      onPage?.(offset, itemIds.length, keyword);

      if (summaries.length === 0) break;
      if (newOnThisPage === 0) break;
      offset += limit;
    }
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
  /** FIXED_PRICE (Buy It Now) or AUCTION from buyingOptions */
  ebayListingType?: string;
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

  const normalizedId = /^\d+$/.test(String(itemId).trim())
    ? `v1|${itemId}|0`
    : String(itemId);
  const itemIdEnc = encodeURIComponent(normalizedId);
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
    categoryPath?: string;
    categoryId?: string;
    categoryIdPath?: string;
    itemEndDate?: string;
    primaryItemCategory?: { categoryName?: string; categoryId?: string };
    categories?: Array<{ categoryName?: string; categoryId?: string }>;
    seller?: { username?: string };
    buyingOptions?: string[];
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
    (item?.categoryPath as string | undefined) ??
    item?.primaryItemCategory?.categoryName ??
    (Array.isArray(item?.categories) && item.categories.length > 0
      ? item.categories[0].categoryName
      : undefined) ??
    "";
  const sellerUsername = item?.seller?.username ?? "";
  const ebayEndDate = item?.itemEndDate ?? undefined;
  const buyingOptions = item?.buyingOptions ?? [];
  const ebayListingType =
    buyingOptions.includes("AUCTION")
      ? "AUCTION"
      : buyingOptions.includes("FIXED_PRICE")
        ? "FIXED_PRICE"
        : buyingOptions[0] ?? undefined;

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
    ebayListingType,
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
