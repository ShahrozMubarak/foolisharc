import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { PRODUCTS } from "../src/data/products.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SITE_HOST = "https://www.foolisharc.com";

const escapeXml = (text) =>
  String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const itemsXml = PRODUCTS.map((p) => {
  const link = `${SITE_HOST}/product/${encodeURIComponent(p.id)}`;
  const rawImage = (p.images && p.images[0]) || p.image || "/images/catalog/men_barrel_jeans_flat.jpg";
  const imageLink = rawImage.startsWith("http") ? rawImage : `${SITE_HOST}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;

  const isKids = p.person === "kids" || p.gender === "kids";
  const isMen = p.person === "men" || p.gender === "men";
  const gender = isKids ? "unisex" : isMen ? "male" : "female";
  const ageGroup = isKids ? "kids" : "adult";

  const colorName = p.colorName || p.primaryColor || (p.colors && p.colors[0]?.name) || "Assorted";
  const sizeList = Array.isArray(p.sizes) ? p.sizes.join("/") : "M";

  const stock = Number(p.stock ?? 10);
  const availability = stock > 0 ? "in_stock" : "out_of_stock";

  return `    <item>
      <g:id>${escapeXml(p.id)}</g:id>
      <g:title>${escapeXml(p.name)} | FOOLISH ARC</g:title>
      <g:description>${escapeXml(p.description || p.name)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:brand>FOOLISH ARC</g:brand>
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${p.price} PKR</g:price>
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing</g:google_product_category>
      <g:gender>${gender}</g:gender>
      <g:age_group>${ageGroup}</g:age_group>
      <g:color>${escapeXml(colorName)}</g:color>
      <g:size>${escapeXml(sizeList)}</g:size>
      <g:shipping>
        <g:country>PK</g:country>
        <g:service>Nationwide Tracked Express</g:service>
        <g:price>0 PKR</g:price>
      </g:shipping>
    </item>`;
}).join("\n");

const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>FOOLISH ARC Official Product Feed</title>
    <link>${SITE_HOST}/</link>
    <description>Official Google Merchant Center catalog feed for FOOLISH ARC. Luxury pret, denim, and atelier apparel in Pakistan.</description>
${itemsXml}
  </channel>
</rss>
`;

const outPath = join(__dirname, "..", "public", "merchant-feed.xml");
writeFileSync(outPath, feedXml, "utf8");
console.log(`Merchant Center feed generated with ${PRODUCTS.length} products at public/merchant-feed.xml`);
