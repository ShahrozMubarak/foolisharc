# FOOLISH ARC — SEO Remaining Tasks
**Date:** 2026-11-17  
**Status:** Implementation complete; external-account and owner-approval tasks remain.

---

## A. Requires Business-Owner Approval (do not publish without sign-off)

| # | Task | Why approval needed |
|---|------|---------------------|
| A1 | Finalise Shipping & Delivery Policy content (charges, timeframe, courier) | Binding customer promise; advertised "2–3 days nationwide" must be verified |
| A2 | Finalise Returns & Exchange Policy content (eligibility, timeframe, conditions) | Binding customer promise; advertised "14-day exchanges", "complimentary resizing" must be verified |
| A3 | Finalise Privacy Policy content (data collection, cookies, third parties) | Legal obligation |
| A4 | Finalise Terms and Conditions (governing law, liability, order acceptance) | Legal obligation |
| A5 | Finalise Size Guide content (measurements per size, fit advice) | Conversion accuracy |
| A6 | Provide physical address, phone, email for Organization schema & contact pages | Required for complete Organization data; must not be fabricated |
| A7 | Confirm payment methods (Cash on Delivery, JazzCash, EasyPaisa) | Must match actual configured methods; do not invent |
| A8 | Confirm "Tracked delivery / 2–3 days nationwide / 14-day exchanges / complimentary resizing" claims on product pages | Must be true before publishing as binding policy |
| A9 | Substantiate sustainability/fibre claims (Belgian linen, Mongolian cashmere, Japanese selvedge) on AboutPage; replace Unsplash stock imagery with owner photography | Must not fabricate certifications or sourcing claims |

---

## B. Requires External Account Access (cannot be completed without credentials)

| # | Task | Account needed | Notes |
|---|------|----------------|-------|
| B1 | Verify preferred domain property in Google Search Console | Google Search Console (owner) | Prepare TXT record or HTML tag verification; token not fabricated |
| B2 | Submit www sitemap to GSC | Google Search Console | Sitemap: `https://www.foolisharc.com/sitemap.xml` |
| B3 | Inspect homepage / collections / products in GSC URL Inspection | Google Search Console | Post-deploy |
| B4 | Review GSC Page Indexing, Crawl Stats, canonical issues, structured data enhancements | Google Search Console | Post-deploy |
| B5 | Verify GA4 installation; configure ecommerce events (product views, add-to-cart, checkout, purchase) | Google Analytics 4 | Measurement ID not fabricated |
| B6 | Verify purchase revenue and currency (PKR) in GA4 | Google Analytics 4 | |
| B7 | Assess Google Merchant Center eligibility; prepare accurate product feed | Google Merchant Center | Product URLs/prices/availability/images must match live store |
| B8 | Run Semrush Keyword Magic, Organic Research, Keyword Gap, Site Audit, Position Tracking, Backlink Analytics, On Page SEO Checker | Semrush (paid) | Paid access required |
| B9 | Deploy code + vercel.json redirects to production | Hosting/Vercel + domain DNS | Owner deployment approval |
| B10 | Configure domain DNS (www + non-www) and SSL | DNS host / domain registrar | Required for 301 redirects to function |

---

## C. Post-Deploy Verification (after B9)

| # | Task |
|---|------|
| C1 | Run Google PageSpeed Insights + Lighthouse (mobile); confirm LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 |
| C2 | Run Google Rich Results Test + Schema.org Validator on homepage and representative product page |
| C3 | Confirm all 4 domain variants resolve to https://www.foolisharc.com/ with 301, no chains/loops |
| C4 | Confirm sitemap returns HTTP 200; robots.txt returns HTTP 200 with www sitemap |
| C5 | Confirm canonical tags render www on homepage, shop, categories, 5 products, brand story, contact |
| C6 | Confirm /privacy, /terms, /shipping, /returns, /size-guide return HTTP 200 and are indexed |
| C7 | Confirm /track has noindex/nofollow; /404 returns noindex |
| C8 | Confirm product filters, sorting, add-to-cart, checkout, tracking still function |

---

## D. Content / Growth (after approvals)

| # | Task |
|---|------|
| D1 | Publish owner-approved policy pages content (replace `[OWNER APPROVAL REQUIRED]` placeholders) |
| D2 | Add ShippingDetails + MerchantReturnPolicy JSON-LD once terms approved |
| D3 | Complete Organization schema (telephone, email, sameAs, full address) once details approved |
| D4 | Publish keyword-mapped blog content (7 planned articles) — no thin/ AI-filler articles |
| D5 | Set up Semrush Position Tracking campaign for Pakistan (commercial keywords) |
| D6 | Submit product feed to Google Merchant Center (once eligibility confirmed) |

---

## E. Deliverables Still to Produce (templates provided; owner/GSC/Semrush data to fill)

| File | Status |
|------|--------|
| KEYWORD_MAPPING.csv | Template created; keyword data requires Semrush access |
| SEMRUSH_RESEARCH_REPORT.md | Template created; data requires Semrush access |
| TECHNICAL_SEO_TEST_RESULTS.md | Post-deploy measurements required |
| GOOGLE_SEARCH_CONSOLE_SETUP.md | Instructions created; verification tokens require owner GSC account |
| 90_DAY_SEO_GROWTH_PLAN.md | Plan created; execution requires approvals above |
