# Andrews Gym — Developer Launch Readiness Audit

**Audit date:** 1 November 2026  
**Scope:** Existing landing page, member signup/sign-in, member profile, admin APIs, merchandise catalogue/cart, and Cloudflare setup.

## Summary

The codebase is a working local application skeleton, not a launch-ready gym website yet. The public page builds, the Cloudflare Worker bundles, D1 migrations apply locally, and member/admin authorization works in a local end-to-end check. The main launch gaps are owner content and configuration, email flows, a real visit-enquiry destination, paid shop checkout, and required public business/privacy content.

## Verified locally

- Vite production build completes.
- TypeScript check completes.
- Wrangler dry-run bundles the Worker and static assets against the D1/Assets bindings.
- D1 migration applies locally.
- Email/password signup creates a pending member record; the selected Plus plan appears in the member profile.
- A regular member can read their own record and receives `403` from admin endpoints.
- An admin can list members, change plan/status/dates, record a visit, and create a product.
- Mutating API requests without the expected same-origin `Origin` are rejected.
- Test accounts and products were removed from the local database after the audit.

The local runtime initially rejected the configured compatibility date because it was newer than the installed Worker runtime; the date is now aligned with the local runtime. The cart also now survives refreshes, member/admin API responses are marked non-cacheable, and admin updates validate dates and return `404` for missing records.

## Must resolve before public launch

| Priority | Gap | Current state / next action |
|---|---|---|
| P0 | Cloudflare production resources | `wrangler.jsonc` still has an example D1 ID and local auth URL. Create the production D1 database, replace the ID, set the production `BETTER_AUTH_URL`, set a strong Worker secret, apply remote migrations, and deploy. No production deployment has been made. |
| P0 | First admin access | The first owner account must be explicitly promoted to the `admin` role in D1. Do this for the owner account only, then sign out/in and verify `/admin.html`. |
| P0 | Visit enquiries | The homepage form currently displays a configuration message; it does not store a request or deliver one to staff. Choose a booking service/email destination or approve a server-side enquiry inbox and connect the form before advertising “Book your first visit.” |
| P0 | Paid merchandise orders | The catalogue and cart work, but `/api/checkout` returns an unavailable/not-implemented response. Select a payment provider, VAT handling, pickup/delivery options, prices, shipping charges, and refund/returns rules; then implement checkout, signed payment webhooks, stock handling, and order confirmation. Do not present the current cart as able to complete a sale. |
| P0 | Owner identity and offer | Replace placeholder address, phone, hours, prices, tier inclusions, terms, class times, services, and trainer details. The three plan benefits and names are starter copy, not verified gym commitments. |
| P0 | German-market content | Confirm German, English, or bilingual copy. Add owner-approved business identification, privacy, membership terms, and shop/withdrawal/returns content before taking member or customer data. |
| P1 | Verification and account recovery | Email verification and password-reset delivery are not configured. Select an email provider/domain, configure Better Auth callbacks, templates, and sender identity, then test sign-up verification, reset, and changed-email flows. Until then, public registrations use unverified email addresses. |
| P1 | Membership payment and renewals | Admins can manually set plan/status/dates; there is no online recurring billing, automatic expiry, renewal reminder, or member self-service cancellation/freeze flow. Decide whether the gym needs these for its first release. |
| P1 | Product maintenance | Admin can add products and update price, stock, or visibility. It cannot edit an existing product’s name, description, category, or image; staff must hide it and add a replacement. Add full edit/archive UI if the owner needs to maintain a changing catalogue. |
| P1 | Member list scale | Admin list is capped at 500 and has no search, filters, or paging. Fine for an initial small roster; add server-side search/pagination before outgrowing it. |
| P1 | Lead and data retention | No privacy notice, consent/retention workflow, data export, or member deletion process is wired into the UI. Decide what the gym retains and how account/data deletion requests are handled. Avoid adding health or training notes without a clear need and privacy review. |
| P2 | Classes and local discovery | The initial plan calls for a real timetable, map/directions, opening hours, and location-specific search metadata. These remain placeholders/absent until the gym provides actual data. A sitemap and production canonical URL also depend on the final domain. |
| P2 | Images and third-party requests | The hero/section photos are remote Unsplash examples and fonts are requested from Google Fonts. Replace with approved gym photography and review whether to self-host assets or disclose/retain those third-party requests in the site privacy documentation. |

## Code-level notes

- The browser-side admin page is not treated as a security boundary; admin APIs check the Better Auth role server-side.
- All `/api/*` responses are `private, no-store`; mutating API routes require the configured same-origin `Origin`.
- Product image URLs are restricted to HTTPS and displayed as CSS backgrounds.
- The order tables are present, but no order-creation or payment-webhook route writes to them yet.
- The site has no analytics integration or consent-aware analytics configuration.

## Suggested next sequence

1. Get the owner’s confirmed copy, contacts, images, membership rules, and language choice.
2. Choose the visit booking/enquiry destination and the email provider for auth and notifications.
3. Agree the shop’s payment, VAT, fulfilment, and return policy; implement and test the paid order lifecycle.
4. Add approved German-market business/privacy/legal content and complete privacy/retention decisions.
5. Create Cloudflare production resources, promote the owner admin, deploy, and verify the full flow on the live domain.
