# FOOLISH ARC — SEO Implementation Plan
**Date:** 2026-11-17  
**Official canonical domain:** https://www.foolisharc.com/

---

## Phase 2 — Domain Standardization (HIGHEST PRIORITY)

**Goal:** All four domain/protocol combinations resolve to https://www.foolisharc.com/; all SEO-generated URLs use www.

### 2.1 Update SITE_HOST
- File: `src/utils/seoHead.js:3`
- Change `SITE_HOST = "https://foolisharc.com"` → `SITE_HOST = "https://www.foolisharc.com"`
- This propagates to all canonicals, OG URLs, Twitter URLs, JSON-LD via `toAbsoluteUrl()`, `setHeadTags()`, `productMeta()`, `PAGE_META`.

### 2.2 Update index.html static shell
- `canonical` href → `https://www.foolisharc.com/`
- `og:url` → `https://www.foolisharc.com/`
- `twitter:url` → `https://www.foolisharc.com/`
- All JSON-LD `@id` and `url` values → `https://www.foolisharc.com/...`

### 2.3 Update robots.txt
- `Sitemap: https://www.foolisharc.com/sitemap.xml`

### 2.4 Update public/sitemap.xml
- All 33 `<loc>` values: `https://foolisharc.com/` → `https://www.foolisharc.com/`

### 2.5 Update scripts/generate-sitemap.mjs
- `SITE_HOST = "https://www.foolisharc.com"`

### 2.6 Server-level redirects (hosting-dependent)
- Vercel: add redirect rules in `vercel.json` or via Vercel project settings for:
  - `http://foolisharc.com/*` → `https://www.foolisharc.com/:splat` (301)
  - `https://foolisharc.com/*` → `https://www.foolisharc.com/:splat` (301)
  - `http://www.foolisharc.com/*` → `https://www.foolisharc.com/:splat` (301)
- Preserve paths and query strings. Avoid chains/loops.
- If Express server is used for production, add redirect middleware in `server/index.js`.

---

## Phase 3 — Fix SEO Metadata

### 3.1 Remove meta keywords
- Delete `<meta name="keywords" ...>` from `index.html:11`.

### 3.2 Remove "Folish Arc" misspellings (customer-facing)
- `index.html:10` description: remove "(also searched as Folish Arc or Foolish)".
- `index.html:22` og:title: remove "(Folish Arc)".
- `HomePage.jsx:171` ogTitle: remove "(Folish Arc)".
- `HomePage.jsx:576`: remove "(also searched by our clients as Folish Arc or simply Foolish)".
- `index.html:56-66` Brand alternateName: remove "Folish Arc", "folish arc", "folisharc".
- `index.html:76-77` Organization alternateName: remove "Folish Arc", "folisharc".
- `index.html:94` WebSite alternateName: remove "Folish Arc".
- `index.html:108` ClothingStore alternateName: remove "Folish Arc".

### 3.3 Improve homepage metadata
- Per task suggestion:
  - Title: `FOOLISH ARC | Premium Men's & Women's Clothing in Pakistan`
  - Description: `Discover contemporary men's and women's clothing at FOOLISH ARC. Shop refined shirts, denim, tailored trousers and timeless everyday fashion.`
- Update `PAGE_META.home` in `src/utils/seoHead.js` and `index.html` title/description/og:title/og:description/twitter:title/twitter:description.

### 3.4 Category page metadata
- Already present in `PAGE_META.shopWomen`, `shopMen`, `shopKids`. Review for uniqueness (they are unique). Keep.

### 3.5 Product page metadata
- Already dynamic via `productMeta()` and ProductDetailPage SEOHead. Ensure canonical uses www (handled by SITE_HOST change).

---

## Phase 4 — Product Catalogue Consistency

- Source catalogue: 26 products (Men 10, Women 14, Kids 2). Internally consistent.
- Sitemap (33 URLs) matches catalogue. No action needed on source data.
- Verify live site returns same counts. If live differs, it's a data/deployment mismatch, not source code.
- Out-of-stock handling: already present in ShopPage filter (`stockPerSize` check). No change needed.
- Deleted products: sitemap generated from live `PRODUCTS` array; deleted products won't appear. No change needed.

---

## Phase 5 — Product Structured Data

### 5.1 Product schema (already present on product pages)
- Keep existing Product schema (name, description, image, brand, sku, mpn, category, offers with PKR price, availability, itemCondition, url, seller).
- **Do NOT add AggregateRating** — no genuine review data connected to products (reviews stored on orders). This is correct.
- Keep BreadcrumbList schema on product pages.

### 5.2 Remove displayed placeholder ratings (compliance)
- `ProductDetailPage.jsx:293-296` displays `★ {product.rating || "4.9"} ({product.reviewCount || "48"})`. These are static defaults not tied to genuine reviews. Per rules "Never invent customer reviews," remove or replace with neutral text. Recommendation: remove rating/reviewCount display or gate behind verified review data. Mark as requiring owner decision.

### 5.3 Organization / WebSite schema
- Already present in index.html. Update URLs to www (Phase 2). Add `sameAs` only if owner provides social URLs.

### 5.4 Add ShippingDetails + MerchantReturnPolicy
- Only after owner confirms shipping/return terms. Mark as requiring owner approval.

### 5.5 Validate
- Google Rich Results Test, Schema.org Validator (after deploy).

---

## Phase 6 — Customer Trust & Policy Pages

### 6.1 Create new page components
- `src/pages/PrivacyPage.jsx`
- `src/pages/TermsPage.jsx`
- `src/pages/ShippingPage.jsx`
- `src/pages/ReturnsPage.jsx`
- `src/pages/SizeGuidePage.jsx`

### 6.2 Add routes in src/App.jsx
- `/privacy`, `/terms`, `/shipping`, `/returns`, `/size-guide`
- Content must use `[OWNER APPROVAL REQUIRED]` placeholders for any factual claims (delivery charges, return eligibility, refund periods, addresses, phone numbers, payment methods).

### 6.3 Add footer links
- Update `src/components/Footer.jsx` to link to all five pages.

### 6.4 Add to sitemap
- Add 5 static URLs to `scripts/generate-sitemap.mjs` `staticUrls` and regenerate `public/sitemap.xml`.

---

## Phase 7 — Image SEO

### 7.1 Product images
- Add `width`/`height` to `ProductCard` main + hover images (aspect 3:4, e.g. 400x533).
- Change main product image `loading="lazy"` → `loading="eager"` on ProductDetailPage hero image.
- Add descriptive alt text: `"{product.name} {fitLine} by FOOLISH ARC"` + color variant.

### 7.2 Homepage images
- Hero video poster / fallback image: `loading="eager"`, explicit dimensions, descriptive alt.
- Banner slide images: `loading="lazy"`, descriptive alts from slide data.
- Posture images: descriptive alts.

### 7.3 AboutPage fiber images
- Replace Unsplash stock images or mark as illustrative only. Add disclaimer that imagery is illustrative pending owner-provided photography. (Per rules: never fabricate; do not replace genuine product images with unrelated stock.)

### 7.4 Image sitemap
- Optional; Google can discover images via page markup. Not critical. Defer.

---

## Phase 8 — Internal Linking

### 8.1 Breadcrumbs on category pages
- Add breadcrumb Nav (Home > Collection > [Men/Women/Kids]) to `ShopPage.jsx`.
- Add BreadcrumbList JSON-LD to ShopPage SEOHead.

### 8.2 Footer policy links
- Add Privacy, Terms, Shipping, Returns, Size Guide links to Footer (new "Policy" column).

### 8.3 Navbar
- Add Brand Story link to Navbar desktop/mobile.

### 8.4 Related products
- Already present on ProductDetailPage ("Complete The Collection"). Keep.

---

## Phase 9 — Technical SEO

### 9.1 robots.txt
- Keep Allow: /, Disallow: /admin, /studio, /api/. Update sitemap to www. No changes to disallow rules (product/collection/image/CSS/JS not blocked).

### 9.2 Sitemap
- www URLs, 26 products + 7 static + 5 new policy pages = 38 URLs. Exclude /track, /cart, /checkout, /studio, /admin, /404.

### 9.3 404 handling
- NotFoundPage has `noindex` and canonical `/404`. Good for Googlebot.
- Server-level: Express/Vercel serve index.html with HTTP 200 for unknown paths (SPA limitation). Add Vercel redirect header or note as limitation. Cannot easily return true HTTP 404 for client-side routes without SSR. Mitigate via noindex meta (already present).

### 9.4 Canonical tags
- All pages use relative canonical resolved via SITE_HOST → www. Sort URLs self-canonicalize (acceptable per Phase 2 note "sorting URLs already appear to canonicalize to their category pages" — actually they canonicalize to themselves; consider canonicalizing filter URLs to /shop?cat=X). Defer filter canonicalization to avoid breaking filter UX; mark as investigation.

---

## Phase 10 — Performance / Core Web Vitals

- Cannot measure without deployed URL. After deploy, run PageSpeed Insights / Lighthouse.
- Candidate optimizations: preload hero image, font-display swap (Google Fonts already `display=swap`), defer hero video, compress images, convert to WebP.
- Targets: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1.

---

## Phase 11–17 — External accounts & deliverables

- GSC, GA4, Merchant Center, Semrush: require owner account access. Prepare manual instructions, do not fabricate tokens.
- Final deliverables: reports + test results + 90-day plan.

---

## Items Requiring Business-Owner Approval (do not publish without approval)

1. Shipping & Delivery Policy content (charges, delivery timeframe, courier).
2. Returns & Exchange Policy content (eligibility, refund period, conditions).
3. Privacy Policy content (data collection, cookies, third parties).
4. Terms and Conditions content.
5. Size Guide content (measurements, fit advice).
6. Physical address / phone / email for Organization schema and contact pages.
7. Payment methods list (JazzCash/EasyPaisa enabled states are env-driven; do not hard-code).
8. "Tracked delivery 2-3 days nationwide", "14-day exchanges", "Complimentary resizing" claims on product pages — verify before publishing as binding policy.
9. Sustainability/fiber provenance claims (Belgian linen, Mongolian cashmere) paired with Unsplash stock imagery on AboutPage — substantiate or replace.
