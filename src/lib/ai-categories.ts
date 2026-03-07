/**
 * AI-powered product categorisation using OpenAI. Uses title + description
 * (and optional eBay category) to pick the best site category slug.
 */

const VALID_SLUGS = [
  "vintage-lingerie",
  "shoes-boots",
  "dresses",
  "plus-sizes",
  "handbags",
  "accessories",
  "vintage-houseware",
  "vintage-dolls-toys",
  "sindy",
  "sewing-crafts",
  "menswear",
  "childrens-wear",
  "vintage-furniture",
  "coats-jackets",
  "dolls-houses",
  "cosmetics-perfume",
  "vintage-millinery",
  "vintage-jewellery",
  "vintage-books-magazines",
  "separates",
  "swimwear-beachwear",
  "film-music",
  "bridal-wedding",
  "mens-shoes",
  "collectables-art",
  "other",
] as const;

const CATEGORY_DESCRIPTIONS =
  "Vintage Lingerie (vintage-lingerie), Shoes & Boots (shoes-boots), Dresses (dresses), Plus Sizes (plus-sizes), Handbags (handbags), Accessories (accessories – scarves, belts, ties, gloves), Vintage Houseware (vintage-houseware – typewriters, sewing machines, mannequins), Vintage Dolls & Toys (vintage-dolls-toys – general dolls/toys), Sindy (sindy – Sindy/Pippa/Barbie doll items and outfits), Sewing/Crafts (sewing-crafts – fabric, patterns, trimmings), Menswear (menswear), Children's Wear (childrens-wear), Vintage Furniture (vintage-furniture – chairs, tables, G Plan, Ercol), Coats & Jackets (coats-jackets), Dolls' Houses & Accessories (dolls-houses – miniature furniture, wallpaper), Cosmetics & Perfume (cosmetics-perfume – Avon, Yardley, lipstick, soap), Vintage Millinery (vintage-millinery – hats), Vintage Jewellery (vintage-jewellery – necklaces, brooches), Vintage Books & Magazines (vintage-books-magazines), Separates (separates – skirts, blouses, tops, trousers, jumpers), Swimwear & Beachwear (swimwear-beachwear), Film/Music (film-music – cassettes, vinyl), Bridal/Wedding (bridal-wedding), Men's Shoes (mens-shoes), Collectables & Art (collectables-art – badges, scout/guide), Other (other).";

export type CategorySlug = (typeof VALID_SLUGS)[number];

export function isValidCategorySlug(s: string): s is CategorySlug {
  return (VALID_SLUGS as readonly string[]).includes(s);
}

/**
 * Call OpenAI to choose the best category slug for a product from its title and description.
 * Returns null if the API key is missing or the request fails.
 */
export async function classifyProductCategory(params: {
  title: string;
  description?: string | null;
  ebayCategoryName?: string | null;
  apiKey: string;
}): Promise<CategorySlug | null> {
  const { title, description, ebayCategoryName, apiKey } = params;
  if (!apiKey?.trim()) return null;

  const descriptionSnippet = (description ?? "").trim().slice(0, 800);
  const userContent = [
    `Title: ${title}`,
    descriptionSnippet ? `Description: ${descriptionSnippet}` : "",
    ebayCategoryName?.trim() ? `eBay category (hint only): ${ebayCategoryName.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const systemPrompt = `You are a categoriser for a UK vintage clothing and collectables shop. Given a product title and description, choose the single best category from this exact list. Reply with only a JSON object: {"slug": "<slug>"} using one of these slugs exactly: ${VALID_SLUGS.join(", ")}.

Categories: ${CATEGORY_DESCRIPTIONS}

Rules:
- Sindy/Pippa/Barbie doll clothes and accessories → sindy. Miniature dolls' house furniture/wallpaper → dolls-houses. Other dolls/toys → vintage-dolls-toys.
- Dresses → dresses. Skirts, blouses, tops, jumpers, trousers, cardigans → separates. Coats, jackets, blazers, waistcoats → coats-jackets.
- Hats, millinery → vintage-millinery. Necklaces, brooches, jewellery → vintage-jewellery. Scarves, belts, ties, gloves → accessories.
- Perfume, soap, Avon, lipstick, cosmetics → cosmetics-perfume. Typewriters, sewing machines, mannequins → vintage-houseware. Chairs, tables, G Plan, Ercol → vintage-furniture.
- Shoes, boots, sandals (women's) → shoes-boots. Men's shoes → mens-shoes. Handbags, clutches → handbags.
- Wedding, bridal → bridal-wedding. Swimwear, bikini → swimwear-beachwear. Cassettes, vinyl → film-music. Scout/guide badges → collectables-art.
- If truly unclear or mixed, use "other".`;

  try {
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: apiKey.trim() });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      max_tokens: 50,
    });
    const raw = completion.choices[0]?.message?.content?.trim();
    if (!raw) return "other";
    const parsed = JSON.parse(raw) as { slug?: string };
    const slug = (parsed?.slug ?? "").toLowerCase().trim();
    return isValidCategorySlug(slug) ? slug : "other";
  } catch {
    return null;
  }
}
