# FOOLISH ARC — Google Search Console Setup
**Date:** 2026-11-17  
**Status:** Instructions prepared — owner GSC account access required to complete.  
**Note:** No verification tokens were fabricated. No GSC property was connected.

---

## Prerequisites (owner-side)

1. **Domain ownership:** Confirm `https://www.foolisharc.com/` is the official canonical domain (www).
2. **DNS access:** Ability to add a DNS TXT record, OR ability to upload an HTML file to the site root / edit site HTML.
3. **Hosting:** Vercel (per `vercel.json`) — domain must be added in Vercel project settings with SSL enabled.

---

## Step 1 — Add Property (Domain or URL-prefix)

**Recommended:** Domain property `foolisharc.com` (covers www + non-www + all subdomains).
- Verification method: DNS TXT record.
- GSC provides a TXT value; owner adds it to the domain's DNS zone.
- Alternative: URL-prefix property `https://www.foolisharc.com/` with HTML tag verification (meta tag added to `index.html` `<head>` — comment placeholder already present at `index.html:15`).

---

## Step 2 — Set Preferred Canonical

- The site's canonical tags all point to `https://www.foolisharc.com/` (implemented).
- Ensure 301 redirects are live (vercel.json rules) so non-www and http variants resolve to www https before GSC indexes.
- In GSC, the domain property treats www/non-www as one; for URL-prefix properties, register the www variant.

---

## Step 3 — Submit Sitemap

- Sitemap URL: `https://www.foolisharc.com/sitemap.xml`
- In GPC: Sitemaps → Add a new sitemap → enter `https://www.foolisharc.com/sitemap.xml` → Submit.
- The sitemap contains 38 URLs (26 products + 12 static pages) and is regenerated automatically on every `npm run build`.

---

## Step 4 — URL Inspection (post-deploy)

Inspect and request indexing (selectively — not indiscriminately):
1. `https://www.foolisharc.com/` (homepage)
2. `https://www.foolisharc.com/shop` (main shop)
3. `https://www.foolisharc.com/shop?cat=men`
4. `https://www.foolisharc.com/shop?cat=women`
5. `https://www.foolisharc.com/shop?cat=kids`
6. 3–5 representative product pages (e.g. `/product/men-jeans-01`, `/product/women-shirt-01`)
7. `https://www.foolisharc.com/story`
8. `https://www.foolisharc.com/contact`

**Do NOT request indexing for:** `/track` (noindex), `/404`, `/studio`, `/admin`, `/api/*`.

---

## Step 5 — Review Reports

| Report | What to check |
|--------|---------------|
| Page Indexing | Indexed vs not-indexed pages; why pages aren't indexed |
| Crawl Stats | Crawl rate, host status, responses |
| Canonical issues | Duplicate canonicals; non-www URLs still indexed |
| Structured data enhancements | Product, BreadcrumbList, Organization rich results eligibility |
| Enhancements | Breadcrumbs, product rich results |

---

## Step 6 — Robots.txt Confirmation

- Confirm GSC can fetch `https://www.foolisharc.com/robots.txt` (HTTP 200).
- Confirm sitemap line: `Sitemap: https://www.foolisharc.com/sitemap.xml`
- Confirm no accidental blocking of `/shop`, `/product/*`, images, CSS, JS.

---

## What Was NOT Done (no account access)

- No GSC property created.
- No verification token generated or embedded.
- No sitemap submitted.
- No URL inspection performed.
- No indexing requests made.

All of the above require the business owner to log into their Google Search Console account.
