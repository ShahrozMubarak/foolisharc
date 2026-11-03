# FOOLISH ARC security audit and repair notes

The source ZIP includes FIXES.diff, an exact patch against the original project. Apply it only to an unmodified original. The source files in this ZIP already contain the changes.

## Findings and corrections

| Area | Finding | Implemented correction |
| --- | --- | --- |
| Application startup | The React build and API imports referenced five absent modules. The original 90 tests passed without starting either application. | Restored the Fit Finder engine, dialog, data models and rate limiter. Added tests against the live Express API. |
| Checkout | A standalone-database fallback could reserve stock without saving the order. The customer update targeted the same history field with two conflicting operators. | Required MongoDB transactions for multi-document order changes, corrected the history update, and bound idempotency replays to the submitted request. An order retry after a page refresh can reuse a session-scoped reference. |
| Owner and customer sessions | Administrator writes could accept a content-type header alone. Development signing used a public hard-coded fallback. | Used the installed JWT library with restricted algorithm, issuer, audience and expiry. Bound the owner CSRF token to the signed session. Development uses a random per-process secret. Production needs an explicit signing secret. |
| Google sign-in | The redirect handler did not enforce its stored state. Access tokens could be accepted without checking the intended client. | Required a one-time state and cryptographic S256 PKCE. Restricted callback addresses. Checked Google-issued identity and client audience on the server, and bound returning accounts to the Google subject. |
| Measurements and contact data | Caller-selected guest profile identifiers and browser caches exposed sensitive data on shared devices. Failed saves and deletions could appear successful. | Scoped guest access to a random HTTP-only cookie, stored a digest of the token and isolated account profiles. Measurements are saved on explicit request. Sensitive historical browser caches are cleared. |
| Web requests and rendering | Public write endpoints lacked effective throttling. Catalog fields could inject markup into a fitting-room SVG. | Bounded request sizes and rate-limit memory, limited accepted content types, validated SVG attributes, added security headers for Express and Vercel, and limited receipt sizes and checked their file signatures. |
| Dependencies | The original lockfile reported high-severity advisories for Joi and body-parser. | Updated the lockfile and constrained the affected versions. The final npm audit reported zero known dependency vulnerabilities. |

## Storefront changes

Collection links open the requested department. Search, in-stock size filtering, sorting, saved garments and garment-type filters work together. The redesigned page uses supplied editorial photography and adapts to mobile screens. Fit Finder matches body measurements to a garment chart and reports when there is no match. Quick selection, the non-empty bag, the fitting-room route, stock display and order tracking were repaired. Storefront, checkout and server share the same shipping calculation. The admin receipt image is fetched on demand.

## Verification

- The production Vite build completed on Node 24.
- The 98 standard regression and API tests passed. Run them with `npm test`.
- A separate MongoDB 7.0 replica-set integration test passed. It covers rollback after a missing item, concurrent retries, server pricing, cross-request replay rejection, email-gated tracking, concurrent cancellation and guest profile isolation. To repeat, set `TEST_MONGODB_URI` to a disposable replica set and run `npm run test:db`. The test creates and removes its own database.
- A Chromium test selected a department and available size, typed a product search, applied a Fit Finder suggestion, placed a guest cash-on-delivery order, checked the bag cleared, and opened the tracked order. The collection was checked at 390 and 1365 pixels.
- No real customer data, provider accounts or payment transfers were used. Live Google sign-in, SMTP/Resend delivery, manual-payment settlement and production hosting still need verification with deployment credentials.
- Rate limits are per server process. Set platform-level limits for deployments with multiple instances. Set TRUST_PROXY to a trusted address or CIDR when self-hosting behind a proxy. Existing database catalog records are retained; seed-photo and stock corrections apply to a newly seeded catalog.
