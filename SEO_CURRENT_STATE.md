# FOOLISH ARC — SEO Current State Report
**Date:** 2026-11-17  
**Site:** https://www.foolisharc.com/  
**Repository:** /Users/macbookpro/Music/projects/project zaytoun /

---

## 1. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React (SPA) | 19.1.1 |
| Routing | React Router DOM | 7.9.6 |
| Styling | Tailwind CSS | 3.4.17 |
| Build tool | Vite | 7.1.7 |
| Backend | Express (Node.js ESM) | 5.3.0 |
| Database / ODM | MongoDB / Mongoose | 9.11.2 |
| Auth | JSON Web Tokens, bcryptjs, Google OAuth | — |
| Hosting / Deploy | Vercel (vercel.json) + Express server | — |
| Sitemap generation | `scripts/generate-sitemap.mjs` (runs pre-build) | — |

**Architecture:** Single-page application. All routes render client-side via `index.html` fallback. The Express server serves `/api/*` and falls back to `dist/index.html` for all other paths (server/index.js:1719-1730). Vercel rewrites all non-API routes to `/index.html` (vercel.json).

---

## 2. Routes (src/App.jsx)

| Route | Page | SEO-relevant notes |
|-------|------|-------------------|
| `/` | HomePage | SEOHead meta, product shelf |
| `/shop` | ShopPage | Category filter `?cat=`, type `?type=`, size `?size=`, sort `?sort=`, search `?q=`, saved `?saved=1` |
| `/product/:id` | ProductDetailPage | Product schema (JSON-LD), BreadcrumbList schema, OG/Twitter cards |
| `/shop/:id` | ProductDetailPage (alias) | Same as above |
| `/story` | AboutPage | Brand story, fiber provenance (Unsplash images) |
| `/about` | → `/story` redirect |  |
| `/contact` | ContactPage | Inquiry form |
| `/track` / `/track/:orderId` | OrderTrackingPage | `noindex, nofollow`, canonical `/track` |
| `/studio` | StudioPage | Admin (gated) |
| `/admin` | StudioPage | Admin (gated) |
| `/admin-panel`, `/dashboard` | → `/admin` redirect |  |
| `/cart` | → `/shop` redirect | Cart opens as drawer |
| `/fitting-room`, `/lookbook` | → `/shop` redirect |  |
| `/404` | NotFoundPage | `noindex`, canonical `/404` |
| `*` (catch-all) | NotFoundPage | 404 fallback |

**Missing routes (return 404 via catch-all):** `/privacy`, `/terms`, `/shipping`, `/returns`, `/size-guide`. These exist only as modals (SizeGuideModal) and are not indexable pages.

---

## 3. SEO-Related Files

| File | Purpose | Status |
|------|---------|--------|
| `public/robots.txt` | Robots exclusion | Sitemap points to non-www `https://foolisharc.com/sitemap.xml` |
| `public/sitemap.xml` | Static XML sitemap | 33 URLs (26 products + 7 static), all **non-www** |
| `scripts/generate-sitemap.mjs` | Sitemap generator (pre-build) | `SITE_HOST = "https://foolisharc.com"` (non-www) |
| `src/utils/seoHead.js` | Central SEO helpers | `SITE_HOST = "https://foolisharc.com"` (non-www); `PAGE_META` for all pages; `productMeta()`; `setHeadTags()` |
| `src/components/SEOHead.jsx` | React meta tag component | Sets title, description, canonical, OG, Twitter, robots, JSON-LD via DOM mutation (client-side) |
| `index.html` | Shell HTML | Static homepage meta, canonical, OG, Twitter, JSON-LD (Brand/Organization/WebSite/ClothingStore). **Non-www** URLs throughout. Meta keywords tag present (keyword-stuffed, includes "Folish Arc"). |

---

## 4. Current Metadata (from source)

### index.html (static homepage shell)
- `<title>`: "FOOLISH ARC | Official Store — Luxury Pret, Denim & Atelier Fashion"
- `description`: "Official FOOLISH ARC Store (also searched as Folish Arc or Foolish). ..." — contains misspelling "Folish Arc"
- `keywords`: "foolish arc, folish arc, foolish, foolisharc, folisharc, ..." — keyword-stuffed, includes misspellings
- `canonical`: `https://foolisharc.com/` (non-www)
- `og:url`, `twitter:url`: `https://foolisharc.com/` (non-www)
- `og:title`: "FOOLISH ARC (Folish Arc) | Official Luxury Pret & Atelier Fashion" — contains misspelling
- JSON-LD: Brand, Organization, WebSite, ClothingStore — all **non-www**, Organization alternateName includes "Folish Arc"/"folisharc"

### PAGE_META (src/utils/seoHead.js:15-65)
- `home`: title "FOOLISH ARC Pakistan | Men's & Women's Modern Clothing", canonical `/`
- `shop`: title "Men's & Women's Clothing Online in Pakistan | FOOLISH ARC", canonical `/shop`
- `shopWomen`: Women's collection, canonical `/shop?cat=women`
- `shopMen`: Men's collection, canonical `/shop?cat=men`
- `shopKids`: Kids collection, canonical `/shop?cat=kids`
- `story`, `contact`: present

### Product pages (ProductDetailPage.jsx)
- Title: `${product.name} | ${fitLine || category} for ${person} | FOOLISH ARC`
- Description: product.description or fallback generic text
- Canonical: `/product/${id}` (relative, resolved via SITE_HOST → non-www)
- JSON-LD: Product + BreadcrumbList. **No AggregateRating** in schema (good — no invented ratings).
- Page **displays** `rating` and `reviewCount` with hardcoded defaults ("4.9", "48") — these appear to be static placeholder data not tied to actual reviews.

### OrderTrackingPage
- `noindex, nofollow`, canonical `/track` — correct, preserve.

### NotFoundPage
- `noindex`, canonical `/404` — correct, preserve.

---

## 5. Product Catalogue (src/data/products.js)

Total products in `PRODUCTS`: **26**

| Category | Product IDs | Count |
|----------|-------------|-------|
| Men | forme-07, forme-08, men-jeans-01..05, men-tee-01,02, men-shirt-01 | 10 |
| Women | forme-01..06, women-jeans-01,02,03, women-pant-01,02, women-shirt-01,02, women-tee-01 | 14 |
| Kids | forme-13, forme-14 | 2 |
| **Total** | | **26** |

**Sitemap (public/sitemap.xml):** 26 product URLs + 7 static = 33 URLs. Matches catalogue.

**Homepage display:** Shows `products.slice(0, 8)` new arrivals + `filteredProducts.slice(0, 8)` collection grid. Text states "{filteredProducts.length} Pieces Available" (= 26 when all).

**Category counts (source):**
- Men: 10 (matches live inspection report of 10)
- Women: 14 (live inspection reported 8 — discrepancy suggests live site data differs from source, or filtering difference)
- Kids: 2 (matches)

---

## 6. Structured Data (existing)

- **index.html JSON-LD:** Brand (`@id: https://foolisharc.com/#brand`), Organization (`@id: https://foolisharc.com/#organization`), WebSite, ClothingStore — all non-www, Organization has a (partial) PostalAddress with only `addressLocality: Lahore` and `addressCountry: PK` (no street address — good, not fabricated).
- **Product pages:** Product schema + BreadcrumbList schema injected client-side. Product schema includes name, description, image, brand, sku/mpn, category, offers (priceCurrency PKR, availability, itemCondition NewCondition, seller Organization), url. **No AggregateRating** (correct — no genuine review data connected to products).
- **Organization schema** lacks: telephone, email, sameAs, full address. Address is partial (Lahore, PK only — not a fabricated street address, good).

---

## 7. robots.txt (public/robots.txt)

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /studio
Disallow: /api/

Sitemap: https://foolisharc.com/sitemap.xml
```
- Sitemap URL is **non-www** — must be updated to www.
- Does not block product, collection, or image URLs. Good.

---

## 8. Known Issues (summary, detailed in SEO_PROBLEMS_FOUND.md)

1. All canonical/OG/Twitter/sitemap URLs use **non-www** `https://foolisharc.com` instead of official `https://www.foolisharc.com`.
2. `robots.txt` sitemap declaration is non-www.
3. `index.html` contains keyword-stuffed `meta[name="keywords"]` including misspelling "Folish Arc".
4. "Folish Arc" misspelling appears in customer-facing OG title, homepage text, index.html description, and JSON-LD alternateName arrays.
5. No indexable policy pages: `/privacy`, `/terms`, `/shipping`, `/returns`, `/size-guide` return 404.
6. Footer lacks links to policy pages, size guide, shipping, returns.
7. Product images: most lack explicit width/height; hero/main images use `loading="lazy"`; no WebP/AVIF; alt text is generic (`product.name` only).
8. Product rating/reviewCount displayed with static defaults ("4.9", "48") — potentially invented data not tied to genuine reviews (schema correctly omits AggregateRating).
9. No breadcrumb structured data on category pages (only product pages).
10. SPA: meta tags set client-side via DOM mutation; search engines that don't execute JS may see only index.html shell metadata.
