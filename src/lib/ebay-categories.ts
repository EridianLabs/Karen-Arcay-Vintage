/** Map eBay category to our Category slugs. Uses item.categoryPath or primaryItemCategory.categoryName. Matches Sindypink's Vintage Store categories so all 787+ items map to a site category. */
export function mapEbayCategoryToOurs(ebayCategoryName: string | undefined): string | null {
  if (!ebayCategoryName) return null;
  const n = ebayCategoryName.toLowerCase();
  if (n.includes("lingerie")) return "vintage-lingerie";
  if (n.includes("shoes") || n.includes("boots") || n.includes("sandal") || n.includes("slipper") || n.includes("pump") || n.includes("mule") || n.includes("court shoe") || n.includes("footwear")) return "shoes-boots";
  if (n.includes("dress")) return "dresses";
  if (n.includes("plus size") || n.includes("ladies wear")) return "plus-sizes";
  if (n.includes("handbag") || n.includes("hand bag") || (n.includes("bag") && (n.includes("handle") || n.includes("clutch") || n.includes("purse") || n.includes("shoulder")))) return "handbags";
  if (n.includes("houseware") || n.includes("house ware") || n.includes("typewriter") || n.includes("mannequin") || n.includes("lloyd loom") || n.includes("lamp ")) return "vintage-houseware";
  if (n.includes("dolls") && n.includes("toys")) return "vintage-dolls-toys";
  if (n.includes("dolls") && n.includes("house")) return "dolls-houses";
  if (n.includes("sindy") || n.includes("barbie") || n.includes("pippa") || n.includes("doll ") || n.includes("doll's") || n.includes("teddy") || n.includes("bear ") || n.includes("pedigree ")) return n.includes("house") ? "dolls-houses" : "sindy";
  if (n.includes("sewing") || n.includes("crafts") || n.includes("fabric") || n.includes("trimming") || n.includes("pattern ") || n.includes("sewing machine") || n.includes("lace trim")) return "sewing-crafts";
  if (n.includes("menswear") || (n.includes("men") && (n.includes("wear") || n.includes("cloth") || n.includes("tie") || n.includes("shirt") || n.includes("trouser") || n.includes("cravat")))) return "menswear";
  if (n.includes("children") || n.includes("kids") || n.includes("girl's") || n.includes("boys") || n.includes("girls ") || n.includes("age 3") || n.includes("age 4") || n.includes("age 5") || n.includes("age 6") || n.includes("age 7") || n.includes("age 8") || n.includes("age 9")) return "childrens-wear";
  if (n.includes("furniture") || n.includes("chair") || n.includes("table") || n.includes("wardrobe") || n.includes("rocking horse") || n.includes("cabinet") || n.includes("dressing table")) return "vintage-furniture";
  if (n.includes("coat") || n.includes("jacket") || n.includes("blazer") || n.includes("waistcoat")) return "coats-jackets";
  if (n.includes("cosmetic") || n.includes("perfume") || n.includes("soap") || n.includes("talc") || n.includes("sachet") || n.includes("lavender") || n.includes("lipstick") || n.includes("avon") || n.includes("estee") || n.includes("yardley") || n.includes("eau de") || n.includes("aftershave") || n.includes("powder ")) return "cosmetics-perfume";
  if (n.includes("millinery") || n.includes("hat ") || n.includes(" hats") || n.includes("hats ")) return "vintage-millinery";
  if (n.includes("jewell") || n.includes("necklace") || n.includes("brooch") || n.includes("badge") || n.includes("cufflink") || n.includes("sunglasses")) return "vintage-jewellery";
  if (n.includes("book") || n.includes("magazine") || n.includes("catalogue") || n.includes("postcard")) return "vintage-books-magazines";
  if (n.includes("separates")) return "separates";
  if (n.includes("swimwear") || n.includes("beachwear") || n.includes("swimming") || n.includes("bikini") || n.includes("swim ")) return "swimwear-beachwear";
  if (n.includes("film") || n.includes("music") || n.includes("dvd") || n.includes("blu-ray") || n.includes("cassette") || n.includes("cd ") || n.includes("vinyl") || n.includes("record ")) return "film-music";
  if (n.includes("bridal") || n.includes("wedding") || n.includes("brides")) return "bridal-wedding";
  if (n.includes("men") && n.includes("shoes")) return "mens-shoes";
  if (n.includes("skirt") || n.includes("blouse") || n.includes("blouses") || n.includes("shirt") || n.includes("top ") || n.includes(" tops") || n.includes("jumper") || n.includes("cardigan") || n.includes("petticoat") || n.includes("nightdress") || n.includes("jumpsuit") || n.includes("tunic") || n.includes("trouser") || n.includes("pants") || n.includes("jeans") || n.includes("jodhpur") || n.includes("playsuit")) return n.includes("dress") ? "dresses" : "separates";
  if (n.includes("women") || n.includes("ladies") || n.includes("woman's") || n.includes("ladies'") || n.includes("womens ")) return "separates";
  if (n.includes("accessor") || n.includes("tie ") || n.includes("ties") || n.includes("scarf") || n.includes("belt") || n.includes("wrap") || n.includes("stole") || n.includes("shawl") || n.includes("glove")) return "accessories";
  if (n.includes("other")) return "other";
  return "other";
}
