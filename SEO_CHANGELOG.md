# FOOLISH ARC — SEO Changelog
**Date started:** 2026-11-17  
**Official canonical domain:** https://www.foolisharc.com/  
**Backup branch:** `seo-audit-backup-20261117`  
**Verification:** `npm test` 98/98 pass; `npm run build` clean (sitemap regenerated with 38 URLs)

---

## [Completed] — 2026-11-17

### Phase 2 — Domain Standardization (DONE)
- [x] Changed `SITE_HOST` to `https://www.foolisharc.com` in `src/utils/seoHead.js`
- [x] Updated `index.html` canonical, `og:url`, `twitter:url`, all JSON-LD `@id`/`url` to www
- [x] Updated `public/robots.txt` sitemap to `https://www.foolisharc.com/sitemap.xml`
- [x] Regenerated `public/sitemap.xml` — all 38 URLs now www (26 products + 12 static)
- [x] Updated `scripts/generate-sitemap.mjs` `SITE_HOST` to www
- [x] Added server-level 301 redirects in `vercel.json`:
    - `http://foolisharc.com/:path*` → `https://www.foolisharc.com/:path*` (301)
    - `https://foolisharc.com/:path*` → `https://www.foolisharc.com/:path*` (301)
    - `http://www.foolisharc.com/:path*` → `https://www.foolisharc.com/:path*` (301)
- [x] Verified zero remaining non-www `https://foolisharc.com/` references in src/public/scripts/index.html/vercel.json

### Phase 3 — SEO Metadata (DONE)
- [x] Removed keyword-stuffed `<meta name="keywords">` from `index.html`
- [x] Removed "Folish Arc" misspellings from `index.html` (description, og:title, twitter:title, JSON-LD alternateNames for Brand/Organization/WebSite/ClothingStore)
- [x] Removed "Folish Arc" from `HomePage.jsx` ogTitle and section 7.5 body text
- [x] Updated homepage title → `FOOLISH ARC | Premium Men's & Women's Clothing in Pakistan`
- [x] Updated homepage description → `Discover contemporary men's and women's clothing at FOOLISH ARC. Shop refined shirts, denim, tailored trousers and timeless everyday fashion.`
- [x] Category metadata (`shopWomen`, `shopMen`, `shopKids`) already unique — preserved

### Phase 4 — Catalogue Consistency (DONE — verified, no source changes needed)
- [x] Verified source catalogue: 26 products (Women 14, Men 10, Kids 2)
- [x] No duplicate IDs; all products have images, descriptions, prices; none out of stock
- [x] Sitemap (38 URLs) matches catalogue; homepage "26 pieces" claim is accurate

### Phase 5 — Structured Data (DONE)
- [x] Confirmed Product schema omits AggregateRating (no genuine review data connected to products) — compliant
- [x] Removed displayed placeholder ratings (`★ 4.9 (48)`) from `ProductDetailPage.jsx` to comply with "never invent customer reviews"
- [x] Product schema retains: name, description, image, brand, sku, mpn, category, offers (PKR, availability, itemCondition, seller), url, BreadcrumbList
- [ ] ShippingDetails + MerchantReturnPolicy schema — deferred pending owner approval of shipping/return terms

### Phase 6 — Policy Pages (DONE)
- [x] Created `src/pages/PrivacyPage.jsx`, `TermsPage.jsx`, `ShippingPage.jsx`, `ReturnsPage.jsx`, `SizeGuidePage.jsx`
- [x] Added routes `/privacy`, `/terms`, `/shipping`, `/returns`, `/size-guide` in `src/App.jsx`
- [x] Added footer Policy column with links to all five pages in `src/components/Footer.jsx`
- [x] Added 5 policy URLs to sitemap generator `staticUrls`
- [x] All factual claims marked `[OWNER APPROVAL REQUIRED]`

### Phase 7 — Image SEO (DONE)
- [x] ProductCard: added width/height (400x533) to primary + hover images; descriptive alt text (`{name} by FOOLISH ARC`, `{name} model view by FOOLISH ARC`)
- [x] ProductDetailPage: main image width/height (800x1067), descriptive alt; thumbnails descriptive alt
- [x] HomePage: hero fallback image `loading="eager"`, width/height, descriptive alt; banner slide image `loading="eager"`, descriptive alt; posture images descriptive alt + `loading="lazy"`
- [x] All product images remain `loading="lazy"` in grids (appropriate for below-fold)

### Phase 8 — Internal Linking (DONE)
- [x] Added visible breadcrumb Nav to `ShopPage.jsx` (Home > Collection > [Men/Women/Kids])
- [x] Added BreadcrumbList JSON-LD to `ShopPage.jsx` SEOHead
- [x] Footer Policy column links to privacy, terms, shipping, returns, size-guide
- [x] ProductDetailPage already has breadcrumbs + related products ("Complete The Collection")

### Phase 9 — Technical SEO (DONE)
- [x] robots.txt: `Allow: /`, Disallow `/admin`, `/studio`, `/api/`; sitemap www; does not block products/collections/images/CSS/JS
- [x] Sitemap: www, 38 URLs, excludes /track, /cart, /studio, /admin, /404
- [x] Canonical tags: www via SITE_HOST on all pages
- [x] OrderTrackingPage: `noindex, nofollow`, canonical `/track` — preserved
- [x] NotFoundPage: `noindex`, canonical `/404` — preserved
- [x] 404 catch-all route renders NotFoundPage (SPA serves index.html with HTTP 200 at server level — documented limitation; noindex meta mitigates)

### Verification
- [x] `npm test`: 98/98 pass, 0 fail
- [x] `npm run build`: clean, sitemap regenerated with 38 URLs
- [x] dist/sitemap.xml: 38 `<loc>` entries, all www, includes policy pages
- [x] dist/robots.txt: `Sitemap: https://www.foolisharc.com/sitemap.xml`

---

## [In Progress / Requires External Access] — Not implemented (no account access)

- Google Search Console verification & sitemap submission (requires owner GSC account)
- Google Analytics 4 installation verification (requires owner GA4 property)
- Google Merchant Center product feed (requires owner account)
- Semrush keyword research, Site Audit, Position Tracking, Backlink Analytics (requires paid Semrush access)
- Production deployment (requires owner deployment approval)

---

## Files Modified (this session)

| File | Change |
|------|--------|
| `src/utils/seoHead.js` | `SITE_HOST` → www |
| `scripts/generate-sitemap.mjs` | `SITE_HOST` → www |
| `public/robots.txt` | Sitemap URL → www |
| `public/sitemap.xml` | Regenerated, all www, 38 URLs |
| `vercel.json` | Added 301 redirects (non-www/http → www/https) |
| `index.html` | Removed meta keywords; removed "Folish Arc"; all URLs → www; improved title/description |
| `src/pages/HomePage.jsx` | Removed "Folish Arc"; improved homepage meta via PAGE_META; SITE_HOST for OG image; image dimensions/alts/eager loading |
| `src/pages/ShopPage.jsx` | Added breadcrumb Nav + BreadcrumbList JSON-LD |
| `src/pages/ProductDetailPage.jsx` | Removed invented rating display; image dimensions/alts |
| `src/pages/AboutPage.jsx` | SITE_HOST for OG/Twitter images |
| `src/pages/ContactPage.jsx` | SITE_HOST for OG/Twitter images |
| `src/pages/PrivacyPage.jsx` | NEW |
| `src/pages/TermsPage.jsx` | NEW |
| `src/pages/ShippingPage.jsx` | NEW |
| `src/pages/ReturnsPage.jsx` | NEW |
| `src/pages/SizeGuidePage.jsx` | NEW |
| `src/App.jsx` | Imported + routed 5 policy pages |
| `src/components/Footer.jsx` | Added Policy column links |
| `src/components/ProductCard.jsx` | Image dimensions + descriptive alt text |

---

## Files Created (reports)

| File | Purpose |
|------|---------|
| `SEO_CURRENT_STATE.md` | Phase 1 audit baseline |
| `SEO_PROBLEMS_FOUND.md` | 31 problems catalogued (5 critical, 11 high, 13 medium, 2 low) |
| `SEO_IMPLEMENTATION_PLAN.md` | Remediation plan with owner-approval items flagged |
| `SEO_CHANGELOG.md` | This file — change record |
