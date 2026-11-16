import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { PRODUCTS } from "../src/data/products.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const SITE_HOST = "https://www.foolisharc.com";
const TODAY = new Date().toISOString().split("T")[0];

const escapeXml = (text) =>
  String(text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

const staticUrls = [
  { loc: "/", lastmod: TODAY, changefreq: "daily", priority: "1.0" },
  { loc: "/shop", lastmod: TODAY, changefreq: "daily", priority: "0.9" },
  { loc: "/shop?cat=women", lastmod: TODAY, changefreq: "daily", priority: "0.8" },
  { loc: "/shop?cat=men", lastmod: TODAY, changefreq: "daily", priority: "0.8" },
  { loc: "/shop?cat=kids", lastmod: TODAY, changefreq: "daily", priority: "0.8" },
  { loc: "/story", lastmod: TODAY, changefreq: "monthly", priority: "0.7" },
  { loc: "/contact", lastmod: TODAY, changefreq: "monthly", priority: "0.7" },
  { loc: "/privacy", lastmod: TODAY, changefreq: "monthly", priority: "0.6" },
  { loc: "/terms", lastmod: TODAY, changefreq: "monthly", priority: "0.6" },
  { loc: "/shipping", lastmod: TODAY, changefreq: "monthly", priority: "0.6" },
  { loc: "/returns", lastmod: TODAY, changefreq: "monthly", priority: "0.6" },
  { loc: "/size-guide", lastmod: TODAY, changefreq: "monthly", priority: "0.6" },
];

const productUrls = PRODUCTS.map((p) => {
  const rawImage = (p.images && p.images[0]) || p.image || "/images/catalog/men_barrel_jeans_flat.jpg";
  const imageLoc = rawImage.startsWith("http") ? rawImage : `${SITE_HOST}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`;
  return {
    loc: `/product/${encodeURIComponent(p.id)}`,
    lastmod: TODAY,
    changefreq: "weekly",
    priority: "0.7",
    image: {
      loc: imageLoc,
      title: p.name,
      caption: p.description || p.name
    }
  };
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(SITE_HOST + u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join("\n")}
${productUrls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(SITE_HOST + u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
    <image:image>
      <image:loc>${escapeXml(u.image.loc)}</image:loc>
      <image:title>${escapeXml(u.image.title)}</image:title>
      <image:caption>${escapeXml(u.image.caption)}</image:caption>
    </image:image>
  </url>`
  )
  .join("\n")}
</urlset>
`;

const totalUrls = staticUrls.length + productUrls.length;
const outPath = join(__dirname, "..", "public", "sitemap.xml");
writeFileSync(outPath, xml, "utf8");
console.log(`Sitemap generated with ${totalUrls} URLs (${productUrls.length} products).`);
