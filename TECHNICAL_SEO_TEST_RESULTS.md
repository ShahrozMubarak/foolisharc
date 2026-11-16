# FOOLISH ARC — Technical SEO Test Results
**Date:** 2026-11-17  
**Site:** https://www.foolisharc.com/  
**Note:** Tests below are source/build-level verifications. Deployed-URL tests (PageSpeed, GSC URL Inspection, Rich Results Test) require production deployment and are scheduled as post-deploy steps.

---

## Build & Test Verification

| Command | Result |
|---------|--------|
| `npm test` | 98/98 pass, 0 fail |
| `npm run build` | Clean, built in 4.88s |
| Sitemap regeneration | 38 URLs (26 products + 12 static) |

---

## Domain Standardization (source-level)

| Check | Result |
|-------|--------|
| `SITE_HOST` = `https://www.foolisharc.com` | PASS (`src/utils/seoHead.js`, `scripts/generate-sitemap.mjs`) |
| No remaining `https://foolisharc.com/` non-www refs | PASS (grep clean across src/, public/, scripts/, index.html, vercel.json) |
| `index.html` canonical | `https://www.foolisharc.com/` |
| `index.html` og:url / twitter:url | www |
| `robots.txt` sitemap | `https://www.foolisharc.com/sitemap.xml` |
| vercel.json 301 redirects | 3 rules: http non-www, https non-www, http www → https www (all preserve path/query) |

---

## Sitemap (dist/sitemap.xml)

| Check | Result |
|-------|--------|
| URL count | 38 `<loc>` entries |
| All URLs www | PASS |
| Includes 26 products | PASS |
| Includes 5 new policy pages | PASS (/privacy, /terms, /shipping, /returns, /size-guide) |
| Excludes /track, /cart, /studio, /admin, /404 | PASS |
| Excludes filter/sort URLs | PASS (only canonical /shop?cat=X) |

---

## Robots.txt (dist/robots.txt)

| Check | Result |
|-------|--------|
| Sitemap declaration | `https://www.foolisharc.com/sitemap.xml` |
| Blocks /admin, /studio, /api/ | PASS |
| Allows product/collection/image/CSS/JS | PASS (no disallow for these) |

---

## Metadata Spot-Check (source)

| Page | Unique title | Unique description | Canonical www | noindex? |
|------|-------------|-------------------|---------------|----------|
| Homepage | Yes | Yes | Yes | No |
| Shop | Yes | Yes | Yes | No |
| Men (/shop?cat=men) | Yes | Yes | Yes | No |
| Women (/shop?cat=women) | Yes | Yes | Yes | No |
| Kids (/shop?cat=kids) | Yes | Yes | Yes | No |
| Product (each) | Yes (dynamic) | Yes (dynamic) | Yes | No |
| Brand story (/story) | Yes | Yes | Yes | No |
| Contact (/contact) | Yes | Yes | Yes | No |
| Privacy / Terms / Shipping / Returns / Size Guide | Yes | Yes | Yes | No |
| Order Tracking (/track) | Yes | Yes | Yes | YES (noindex, nofollow) |
| 404 | Yes | Yes | Yes (/404) | YES (noindex) |

---

## Meta Keywords / Misspellings

| Check | Result |
|-------|--------|
| `<meta name="keywords">` removed | PASS |
| "Folish Arc" / "folish arc" / "folisharc" removed from customer-facing copy | PASS |
| JSON-LD alternateNames cleaned of misspellings | PASS |

---

## Structured Data (source-level)

| Check | Result |
|-------|--------|
| Product schema omits AggregateRating | PASS (no invented ratings) |
| Product schema: name, description, image, brand, sku, mpn, category, offers (PKR), availability, itemCondition, url | PASS |
| BreadcrumbList on product pages | PASS |
| BreadcrumbList on ShopPage (category) | PASS (added) |
| Placeholder rating display removed | PASS |

---

## Image SEO (source-level)

| Check | Result |
|-------|--------|
| Hero/main image `loading="eager"` | PASS |
| Grid images `loading="lazy"` | PASS |
| Explicit width/height on key images | PASS (ProductCard 400x533, ProductDetail 800x1067, Homepage hero/banner) |
| Descriptive, unique alt text | PASS |
| No WebP/AVIF conversion | DEFER (design preservation; post-deploy optimisation) |

---

## Internal Linking

| Check | Result |
|-------|--------|
| Breadcrumbs on ShopPage | PASS (added) |
| Footer Policy column (5 links) | PASS |
| Related products on product pages | PASS (existing, preserved) |
| Navbar: Collection, Women, Men, Track | PASS (existing) |

---

## Deployed-URL Tests (PENDING — require production deployment)

| Test | Tool | Status |
|------|------|--------|
| PageSpeed Insights (mobile) | Google | PENDING |
| Lighthouse audit | Chrome DevTools | PENDING |
| Rich Results Test | Google | PENDING |
| Schema.org Validator | Schema.org | PENDING |
| Mobile-friendly check | Google | PENDING |
| HTTP status codes (200/301/404) | curl/browser | PENDING |
| Redirect chain/loop check | curl | PENDING |
| GSC URL Inspection (homepage, collections, products) | GSC | PENDING |

---

## Known Limitations (documented)

- SPA architecture: meta tags injected client-side; server returns index.html (HTTP 200) for all non-API routes including 404 paths. Mitigated via `noindex` meta on NotFoundPage and OrderTrackingPage. True server-level HTTP 404 requires SSR or hosting-level 404 configuration.
- vercel.json 301 redirects require Vercel deployment with www domain configured to take effect.
- Core Web Vitals cannot be claimed as passed until measured on the live deployed URL.
