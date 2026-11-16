# FOOLISH ARC — SEO Problems Found
**Date:** 2026-11-17  
**Site:** https://www.foolisharc.com/

---

## P1 — Domain Standardization (CRITICAL)

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| P1.1 | `SITE_HOST` is `https://foolisharc.com` (non-www). Official canonical domain is `https://www.foolisharc.com`. | `src/utils/seoHead.js:3` | All canonicals, OG URLs, Twitter URLs, JSON-LD `@id`/`url` values use non-www. Dilutes link equity, creates duplicate domain presence. |
| P1.2 | `index.html` canonical, `og:url`, `twitter:url`, and all JSON-LD `@id`/`url` values use non-www. | `index.html:17,21,33,54,68,92,108` | Homepage canonical is non-www. |
| P1.3 | `robots.txt` sitemap declaration is `https://foolisharc.com/sitemap.xml` (non-www). | `public/robots.txt:7` | Search engines directed to non-www sitemap. |
| P1.4 | `public/sitemap.xml` contains 33 URLs, all non-www. | `public/sitemap.xml` | Sitemap URLs non-www. |
| P1.5 | `scripts/generate-sitemap.mjs` uses `SITE_HOST = "https://foolisharc.com"`. | `scripts/generate-sitemap.mjs:7` | Regenerated sitemap will be non-www. |

## P2 — Meta Keywords & Misspellings (HIGH)

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| P2.1 | `meta[name="keywords"]` is keyword-stuffed with ~35 repetitive terms including "Folish Arc", "folisharc", "folish arc". | `index.html:11` | Meta keywords are not a Google ranking signal; keyword stuffing looks spammy. |
| P2.2 | "Folish Arc" misspelling in `og:title`. | `index.html:22`, `HomePage.jsx:171` | Customer-facing misspelling of brand name. |
| P2.3 | "Folish Arc" misspelling in index.html `description` ("also searched as Folish Arc or Foolish"). | `index.html:10` | Customer-facing misspelling. |
| P2.4 | Homepage section 7.5 states brand is "also searched by our clients as Folish Arc or simply Foolish". | `HomePage.jsx:576` | Reinforces misspelling in customer-facing content. |
| P2.5 | JSON-LD `alternateName` arrays include "Folish Arc", "folish arc", "folisharc". | `index.html:56-66,76-77,94,108` | Structured data reinforces misspelled brand variants. |

## P3 — Missing Policy / Trust Pages (HIGH)

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| P3.1 | `/privacy` returns 404 (catch-all NotFoundPage). No indexable Privacy Policy page. | `src/App.jsx` — no route | Missing trust page; hurts E-E-A-T and conversion. |
| P3.2 | `/terms` returns 404. No indexable Terms and Conditions page. | `src/App.jsx` — no route | Missing trust/legal page. |
| P3.3 | `/shipping` returns 404. No indexable Shipping & Delivery page. | `src/App.jsx` — no route | Missing policy; product pages promise "Tracked delivery 2-3 days nationwide" with no backing policy page. |
| P3.4 | `/returns` returns 404. No indexable Returns & Exchange page. | `src/App.jsx` — no route | Missing policy; product pages promise "14-day exchanges" with no backing policy page. |
| P3.5 | `/size-guide` returns 404. Size guide exists only as a modal (SizeGuideModal). | `src/App.jsx` — no route | Missing indexable size guide page; poor for conversion and SEO. |
| P3.6 | Footer does not link to privacy, terms, shipping, returns, or size-guide pages. | `src/components/Footer.jsx` | Poor internal linking to trust pages. |

## P4 — Product Catalogue Consistency (MEDIUM)

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| P4.1 | Source catalogue: 26 products (Men 10, Women 14, Kids 2). Live inspection reported Women = 8 (discrepancy vs source's 14). | `src/data/products.js` | Need to verify live site matches source; source is internally consistent (26 total). |
| P4.2 | Homepage shows only 8 of 26 products in grids but text says "{count} Pieces Available". UI choice, not an error. | `HomePage.jsx:375,540` | Visitors see 8; text states 26. Acceptable if text is accurate. |
| P4.3 | Sitemap (33 URLs) matches catalogue (26 products). No deleted products present. | `public/sitemap.xml` | Consistent. |
| P4.4 | No out-of-stock product in current catalogue (all have stock > 0). OOS handling logic exists in ShopPage filter. | `ShopPage.jsx:61-66` | Logic present; no OOS products to test against. |

## P5 — Structured Data (MEDIUM)

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| P5.1 | Product schema omits `AggregateRating` — correct (no genuine review data), but page **displays** `rating`/`reviewCount` with static defaults ("4.9", "48") that are not tied to actual reviews (reviews stored on orders, not products). | `ProductDetailPage.jsx:293-296` | Displayed ratings may be perceived as invented/fabricated. |
| P5.2 | Organization schema lacks `telephone`, `email`, `sameAs`, full `PostalAddress`. Address is partial (Lahore, PK only — not fabricated, good). | `index.html:73-88` | Incomplete Organization data. |
| P5.3 | No `ShippingDetails` or `MerchantReturnPolicy` schema. | — | Missing ecommerce trust signals. |
| P5.4 | BreadcrumbList schema exists only on product pages, not category pages. | `ProductDetailPage.jsx:183-205` | Category pages lack breadcrumb structured data. |

## P6 — Image SEO (MEDIUM)

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| P6.1 | Product images use `loading="lazy"` including the main/hero product image. | `ProductCard.jsx:90,101`, `ProductDetailPage.jsx:258` | Main image should be `loading="eager"` for LCP. |
| P6.2 | Most images lack explicit `width`/`height` attributes → layout shift (CLS) risk. | Multiple components | CLS impact. |
| P6.3 | All product images are JPG; no WebP/AVIF variants. | `public/images/` | Larger file sizes, slower LCP. |
| P6.4 | Alt text is generic (`product.name` only on ProductCard; `alt={product.name}` on main image). | `ProductCard.jsx:86,97`, `ProductDetailPage.jsx:257` | Not descriptive enough for image search. |
| P6.5 | Homepage hero images have generic alts ("Foolish Arc Model", "Barrel Fit Jeans", etc.). | `HomePage.jsx:196,276` | Non-descriptive. |
| P6.6 | AboutPage fiber showcase images are Unsplash stock photos with generic alts. | `AboutPage.jsx:41-62,188-192` | Stock imagery used for fiber provenance claims. |

## P7 — Internal Linking (MEDIUM)

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| P7.1 | No breadcrumb navigation component on category pages. | `ShopPage.jsx` | Users/search engines lack hierarchical context. |
| P7.2 | Footer lacks links to privacy, terms, shipping, returns, size-guide. | `Footer.jsx` | Orphan trust pages (once created), weak internal linking. |
| P7.3 | Navbar has no link to Brand Story (/story) or Size Guide. | `Navbar.jsx` | Brand story under-linked. |

## P8 — Technical SEO (MEDIUM)

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| P8.1 | SPA: meta tags/canonical/JSON-LD injected client-side via DOM mutation after hydration. Search engines that don't render JS see only `index.html` shell metadata (homepage only). | `src/components/SEOHead.jsx`, `src/utils/seoHead.js` | Non-homepage pages may not have server-rendered SEO tags. |
| P8.2 | 404 routes (`*`, `/404`) render NotFoundPage client-side. Express/Vercel serve `index.html` with HTTP 200 for all non-API paths — nonexistent URLs may return HTTP 200 instead of 404 at the server level. | `server/index.js:1719-1730`, `vercel.json:12-14` | Soft 404 risk at server level. Client-side `noindex` meta mitigates for Googlebot but HTTP status is 200. |
| P8.3 | Sorting/filter URLs (`?sort=`, `?size=`, `?saved=1`) are self-referential canonicals (each filter URL canonicalizes to itself). | `ShopPage.jsx:103-111` | Parameter URLs are indexable and self-canonicalized; could create duplicate content. |

## P9 — Content (LOW)

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| P9.1 | No blog / content section. No SEO content targeting informational queries (fit guides, styling). | — | Missing content marketing opportunity. |
| P9.2 | AboutPage uses Unsplash stock images for "fiber provenance" claims (Belgian linen, Mongolian cashmere, Japanese selvedge). | `AboutPage.jsx:41-62` | Claims of sourcing from specific regions are unverified and paired with stock imagery. Requires owner substantiation (Per Phase rules: never fabricate sustainability certifications). |

---

## Summary of Severity

| Severity | Count | Examples |
|----------|-------|----------|
| Critical | 5 | P1.1–P1.5 (non-www domain everywhere) |
| High | 11 | P2.1–P2.5, P3.1–P3.6 |
| Medium | 13 | P4.1–P4.4, P5.1–P5.4, P6.1–P6.6, P7.1–P7.3, P8.1–P8.3 |
| Low | 2 | P9.1–P9.2 |

**Total: 31 problems identified.**
