/** Map eBay category to our Category slugs. Uses item.categoryPath (e.g. "Clothing|Women|Dresses") or primaryItemCategory.categoryName; any segment can match. */
export function mapEbayCategoryToOurs(ebayCategoryName: string | undefined): string | null {
  if (!ebayCategoryName) return null;
  const n = ebayCategoryName.toLowerCase();
  if (n.includes("lingerie")) return "vintage-lingerie";
  if (n.includes("shoes") || n.includes("boots")) return "shoes-boots";
  if (n.includes("dress")) return "dresses";
  if (n.includes("plus size") || n.includes("ladies wear")) return "plus-sizes";
  if (n.includes("handbag")) return "handbags";
  if (n.includes("houseware")) return "vintage-houseware";
  if (n.includes("dolls") && n.includes("toys")) return "vintage-dolls-toys";
  if (n.includes("sindy") && !n.includes("house")) return "sindy";
  if (n.includes("sewing") || n.includes("crafts")) return "sewing-crafts";
  if (n.includes("menswear") || (n.includes("men") && n.includes("wear"))) return "menswear";
  if (n.includes("children") || n.includes("kids")) return "childrens-wear";
  if (n.includes("furniture")) return "vintage-furniture";
  if (n.includes("coat") || n.includes("jacket")) return "coats-jackets";
  if (n.includes("dolls") && n.includes("house")) return "dolls-houses";
  if (n.includes("cosmetic") || n.includes("perfume")) return "cosmetics-perfume";
  if (n.includes("millinery") || n.includes("hat")) return "vintage-millinery";
  if (n.includes("jewell")) return "vintage-jewellery";
  if (n.includes("book") || n.includes("magazine")) return "vintage-books-magazines";
  if (n.includes("separates")) return "separates";
  if (n.includes("swimwear") || n.includes("beachwear")) return "swimwear-beachwear";
  if (n.includes("film") || n.includes("music")) return "film-music";
  if (n.includes("bridal") || n.includes("wedding")) return "bridal-wedding";
  if (n.includes("men") && n.includes("shoes")) return "mens-shoes";
  if (n.includes("accessor")) return "accessories";
  if (n.includes("other")) return "other";
  return null;
}
