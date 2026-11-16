# FOOLISH ARC — SEO Implementation Report
**Date:** 2026-11-17  
**Site:** https://www.foolisharc.com/  
**Official canonical domain:** https://www.foolisharc.com/  
**Verification:** `npm test` 98/98 pass; `npm run build` clean

---

## 1. Every Problem Found (from SEO_PROBLEMS_FOUND.md)

**Critical (5) — P1.1 to P1.5:** All canonicals, OG URLs, Twitter URLs, sitemap, robots.txt sitemap declaration, and JSON-LD `@id`/`url` values used non-www `https://foolisharc.com` instead of official `https://www.foolisharc.com`.

**High (11) — P2.1 to P2.5, P3.1 to P3.6:** Keyword-stuffed `meta[name="keywords"]`; "Folish Arc" misspellings in customer-facing copy and JSON-LD alternateNames; missing indexable /privacy, /terms, /shipping, /returns, /size-guide pages; footer missing trust-page links.

**Medium (13) — P4.1 to P8.3:** Category count discrepancy (live vs source); placeholder product ratings ("4.9", "48") not tied to genuine reviews; incomplete Organization schema; no ShippingDetails/MerchantReturnPolicy; no breadcrumbs on category pages; images lacking dimensions/eager loading/descriptive alt; generic homepage hero alt; SPA client-side meta injection; server-level 404 returns HTTP 200 (SPA limitation); self-canonicalizing filter URLs.

**Low (2) — P9.1 to P9.2:** No blog/content section; AboutPage uses Unsplash stock imagery for fibre-provenance claims.

**Total: 31 problems identified.**

---

## 2. Every Problem Fixed

| ID | Problem | Fix | File(s) |
|----|---------|-----|---------|
| P1.1–P1.5 | Non-www domain everywhere | `SITE_HOST` → `https://www.foolisharc.com`; all canonicals/OG/Twitter/JSON-LD → www | `src/utils/seoHead.js`, `scripts/generate-sitemap.mjs`, `index.html`, all pages |
| P1.3 | robots.txt sitemap non-www | → `https://www.foolisharc.com/sitemap.xml` | `public/robots.txt` |
| P1.4 | Sitemap non-www URLs | Regenerated, all 38 URLs www | `public/sitemap.xml` |
| P1.5 | Sitemap generator non-www | `SITE_HOST` → www | `scripts/generate-sitemap.mjs` |
| P1.6 | No server redirects | Added 301 redirects in vercel.json (4 domain/protocol combos → www https) | `vercel.json` |
| P2.1 | Keyword-stuffed meta keywords | Removed `<meta name="keywords">` | `index.html` |
| P2.2–P2.5 | "Folish Arc" misspellings | Removed from index.html description/og:title/twitter:title/JSON-LD alternateNames; HomePage.jsx ogTitle + body text | `index.html`, `src/pages/HomePage.jsx` |
| P3.1–P3.5 | Missing policy pages | Created Privacy, Terms, Shipping, Returns, SizeGuide pages + routes | 5 new `src/pages/*.jsx`, `src/App.jsx` |
| P3.6 | Footer missing trust links | Added Policy column with 5 links | `src/components/Footer.jsx` |
| P4.1–P4.4 | Catalogue consistency | Verified source: 26 products (W14/M10/K2), no dupes, all have images/desc/price, none OOS; sitemap matches | `src/data/products.js` (verified, no change) |
| P5.1 | Invented ratings | Product schema already omits AggregateRating; removed placeholder `★ 4.9 (48)` display | `src/pages/ProductDetailPage.jsx` |
| P6.1 | Main image lazy loading | Hero + main product image → `loading="eager"` | `HomePage.jsx`, `ProductDetailPage.jsx` |
| P6.2 | Missing image dimensions | Added width/height to product cards, product detail, homepage hero/banner | `ProductCard.jsx`, `ProductDetailPage.jsx`, `HomePage.jsx` |
| P6.4 | Generic alt text | Descriptive alts (`{name} by FOOLISH ARC`, model/fit-specific) | `ProductCard.jsx`, `ProductDetailPage.jsx`, `HomePage.jsx` |
| P7.1 | No breadcrumbs on category | Added visible breadcrumb Nav + BreadcrumbList JSON-LD to ShopPage | `src/pages/ShopPage.jsx` |
| P7.2 | Footer missing policy links | Added Policy column | `src/components/Footer.jsx` |
| P8.1–P8.3 | Technical SEO | robots.txt allows public content; sitemap www + excludes non-indexable; canonicals www; noindex on /track, /404 | `robots.txt`, `sitemap.xml`, `NotFoundPage.jsx`, `OrderTrackingPage.jsx` |

**Not fixed (owner approval / external access required):**
- P5.2 Organization schema incomplete (telephone/email/sameAs) — needs owner contact details
- P5.3 ShippingDetails + MerchantReturnPolicy — needs owner-approved shipping/return terms
- P6.1–P6.5 Policy page factual content — marked `[OWNER APPROVAL REQUIRED]`
- P6.6 "Tracked delivery 2–3 days", "14-day exchanges", "complimentary resizing" claims — verify with owner before publishing
- P8.2 Server-level true HTTP 404 for SPA routes — SPA limitation; mitigated via noindex meta
- P9.2 AboutPage fibre claims + stock imagery — substantiate or replace with owner photography

---

## 3. Files Modified

`src/utils/seoHead.js`, `scripts/generate-sitemap.mjs`, `public/robots.txt`, `public/sitemap.xml`, `vercel.json`, `index.html`, `src/pages/HomePage.jsx`, `src/pages/ShopPage.jsx`, `src/pages/ProductDetailPage.jsx`, `src/pages/AboutPage.jsx`, `src/pages/ContactPage.jsx`, `src/pages/PrivacyPage.jsx` (NEW), `src/pages/TermsPage.jsx` (NEW), `src/pages/ShippingPage.jsx` (NEW), `src/pages/ReturnsPage.jsx` (NEW), `src/pages/SizeGuidePage.jsx` (NEW), `src/App.jsx`, `src/components/Footer.jsx`, `src/components/ProductCard.jsx`.

---

## 4. Database Changes

None. The product catalogue is sourced from `src/data/products.js` (static array) and seeded to MongoDB via `server/seedData.js`. No data was added, removed, or modified. The 26 products remain unchanged.

---

## 5. Before-and-After Metadata Examples

**Homepage title:**
- Before: `FOOLISH ARC Pakistan | Men's & Women's Modern Clothing`
- After: `FOOLISH ARC | Premium Men's & Women's Clothing in Pakistan`

**Homepage description:**
- Before: `Discover men's and women's clothing at FOOLISH ARC. Explore contemporary shirts, denim, linen trousers and everyday fashion. Shop online in Pakistan.`
- After: `Discover contemporary men's and women's clothing at FOOLISH ARC. Shop refined shirts, denim, tailored trousers and timeless everyday fashion.`

**Canonical (all pages):**
- Before: `https://foolisharc.com/...`
- After: `https://www.foolisharc.com/...`

**Meta keywords:**
- Before: keyword-stuffed list including "folish arc", "folisharc"
- After: removed entirely

**robots.txt sitemap:**
- Before: `Sitemap: https://foolisharc.com/sitemap.xml`
- After: `Sitemap: https://www.foolisharc.com/sitemap.xml`

---

## 6. Redirect Test Results

**Configured (vercel.json) 301 redirects:**
- `http://foolisharc.com/*` → `https://www.foolisharc.com/*` (301)
- `https://foolisharc.com/*` → `https://www.foolisharc.com/*` (301)
- `http://www.foolisharc.com/*` → `https://www.foolisharc.com/*` (301)
- `https://www.foolisharc.com/*` → unchanged

**Preserved:** paths and query parameters via `:path*` splat; no redirect chains/loops (each rule maps directly to final destination).

**Note:** Final HTTP-level verification requires deployment to Vercel with the www domain configured. The redirect rules are in place in vercel.json.

---

## 7. Sitemap Test Results

- `public/sitemap.xml` and `dist/sitemap.xml`: 38 `<loc>` URLs
- All URLs use `https://www.foolisharc.com`
- Includes: `/`, `/shop`, `/shop?cat=women|men|kids`, `/story`, `/contact`, `/privacy`, `/terms`, `/shipping`, `/returns`, `/size-guide`, 26 `/product/*` URLs
- Excludes: `/track`, `/cart`, `/studio`, `/admin`, `/404` (non-indexable/private)
- Returns HTTP 200 when served from dist (static file)

---

## 8. Structured Data Validation Results

**Product schema (product pages):** Contains name, description, image, brand (FOOLISH ARC), sku, mpn, category, offers (priceCurrency PKR, availability InStock/OutOfStock, itemCondition NewCondition, seller Organization), url. BreadcrumbList included. **AggregateRating intentionally omitted** — no genuine review data connected to products (reviews stored on orders). Compliant with "never invent review counts or ratings."

**Organization / WebSite / Brand / ClothingStore (index.html):** Present with www URLs. Organization address is partial (`addressLocality: Lahore`, `addressCountry: PK`) — no fabricated street address. alternateName arrays cleaned of misspellings.

**Validation:** Not yet run against Google Rich Results Test / Schema.org Validator — requires deployed URL. Scheduled as a post-deploy verification step.

---

## 9. Performance Measurements

Not yet measured — requires deployed URL and PageSpeed Insights / Lighthouse run. Build output:
- `dist/index.html`: 5.85 kB (1.77 kB gzip)
- `dist/assets/index-BYSX7lQy.css`: 118.00 kB (20.29 kB gzip)
- `dist/assets/index-BuQYISVa.js`: 945.13 kB (222.52 kB gzip) — exceeds 500 kB warning; code-splitting recommended as a follow-up

Targets (unverified): LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.

---

## 10. Remaining Manual Tasks

See `SEO_REMAINING_TASKS.md`.

---

## 11. Items Requiring Business-Owner Approval

1. Shipping & Delivery Policy content (charges, timeframe, courier) — for /shipping page and MerchantReturnPolicy schema
2. Returns & Exchange Policy content — for /returns page and MerchantReturnPolicy schema
3. Privacy Policy content — data collection, cookies, third parties
4. Terms and Conditions content — governing law, liability
5. Size Guide content — measurements, fit advice
6. Physical address / phone / email — for Organization schema and contact pages
7. Payment methods list — JazzCash/EasyPaisa are env-driven; do not hard-code
8. "Tracked delivery 2–3 days nationwide", "14-day exchanges", "complimentary resizing" — verify before publishing as binding policy
9. Sustainability / fibre-provenance claims (Belgian linen, Mongolian cashmere) on AboutPage — substantiate or replace Unsplash stock imagery
10. Production deployment of vercel.json redirects and code changes
