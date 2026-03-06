/** Map eBay category to our Category slugs. Uses item.categoryPath (e.g. "Clothing|Women|Dresses") or primaryItemCategory.categoryName; any segment can match. UK marketplace paths may use "Clothing, Shoes & Accessories", "Collectables", etc. */
export function mapEbayCategoryToOurs(ebayCategoryName: string | undefined): string | null {
  if (!ebayCategoryName) return null;
  const n = ebayCategoryName.toLowerCase();
  if (n.includes("lingerie")) return "vintage-lingerie";
  if (n.includes("shoes") || n.includes("boots")) return "shoes-boots";
  if (n.includes("dress")) return "dresses";
  if (n.includes("plus size") || n.includes("ladies wear")) return "plus-sizes";
  if (n.includes("handbag") || n.includes("hand bag") || (n.includes("bag") && (n.includes("handle") || n.includes("clutch") || n.includes("purse")))) return "handbags";
  if (n.includes("houseware") || n.includes("house ware") || n.includes("typewriter") || n.includes("mannequin")) return "vintage-houseware";
  if (n.includes("dolls") && n.includes("toys")) return "vintage-dolls-toys";
  if (n.includes("dolls") && n.includes("house")) return "dolls-houses";
  if (n.includes("sindy") || n.includes("barbie") || n.includes("pippa") || n.includes("doll ") || n.includes("doll's") || n.includes("teddy") || n.includes("bear ")) return n.includes("house") ? "dolls-houses" : "sindy";
  if (n.includes("sewing") || n.includes("crafts") || n.includes("fabric") || n.includes("trimming") || n.includes("pattern ")) return "sewing-crafts";
  if (n.includes("menswear") || (n.includes("men") && (n.includes("wear") || n.includes("cloth") || n.includes("tie") || n.includes("shirt")))) return "menswear";
  if (n.includes("children") || n.includes("kids") || n.includes("girl's") || n.includes("boys")) return "childrens-wear";
  if (n.includes("furniture") || n.includes("chair") || n.includes("table") || n.includes("wardrobe") || n.includes("rocking horse")) return "vintage-furniture";
  if (n.includes("coat") || n.includes("jacket") || n.includes("blazer")) return "coats-jackets";
  if (n.includes("cosmetic") || n.includes("perfume") || n.includes("soap") || n.includes("talc") || n.includes("sachet") || n.includes("lavender") || n.includes("lipstick") || n.includes("avon") || n.includes("estee") || n.includes("yardley")) return "cosmetics-perfume";
  if (n.includes("millinery") || n.includes("hat ") || n.includes(" hats")) return "vintage-millinery";
  if (n.includes("jewell") || n.includes("necklace") || n.includes("brooch") || n.includes("badge")) return "vintage-jewellery";
  if (n.includes("book") || n.includes("magazine")) return "vintage-books-magazines";
  if (n.includes("separates")) return "separates";
  if (n.includes("swimwear") || n.includes("beachwear") || n.includes("swimming") || n.includes("bikini")) return "swimwear-beachwear";
  if (n.includes("film") || n.includes("music")) return "film-music";
  if (n.includes("bridal") || n.includes("wedding")) return "bridal-wedding";
  if (n.includes("men") && n.includes("shoes")) return "mens-shoes";
  if (n.includes("skirt") || n.includes("blouse") || n.includes("blouses") || n.includes("shirt") || n.includes("top ") || n.includes("jumper") || n.includes("cardigan") || n.includes("petticoat") || n.includes("nightdress") || n.includes("lingerie")) return n.includes("dress") ? "dresses" : "separates";
  if (n.includes("women") || n.includes("ladies") || n.includes("woman's") || n.includes("ladies'")) return "separates";
  if (n.includes("accessor") || n.includes("tie ") || n.includes("ties") || n.includes("scarf") || n.includes("belt")) return "accessories";
  if (n.includes("other")) return "other";
  return "other";
}
