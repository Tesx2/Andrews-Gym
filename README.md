# Andrews Gym — Cloudflare gym platform

An English-first (confirm before launch), mobile-friendly gym site and member portal. The public page stays one linear scroll. The account, shop, and admin sections are separate pages backed by a Cloudflare Worker.

## Platform

- **Frontend:** HTML, CSS, vanilla JavaScript, and Vite for bundling.
- **Runtime/API:** Cloudflare Workers with Hono.
- **Authentication:** Better Auth email/password and its Admin plugin.
- **Database:** Cloudflare D1.
- **Hosting:** Cloudflare Workers Static Assets (built from this repository).
- **Shop:** EUR product catalogue, stock fields, and a persistent cart. Payment checkout is intentionally disabled until the gym confirms payment account, VAT treatment, and local pickup/delivery rules.

Cloudflare Workers is used for the complete app because authentication and member management need server routes; static Pages hosting by itself would not run this API.

## What is implemented

- `index.html`: linear public landing page with three membership choices linked into signup.
- `account.html`: Better Auth sign-up and sign-in. New accounts start pending; the requested plan is recorded for admin review.
- `member.html`: the member’s plan, status, dates, and recorded visits.
- `admin.html`: admin-only member list and counts; set plan/status/dates, record gym visits, add/hide products, and view orders.
- `shop.html`: product catalogue and shopping cart. The checkout API returns a clear “not configured” response until payment and fulfilment are defined.
- `migrations/0001_auth_and_gym.sql`: Better Auth core/admin fields, member records, visit check-ins, products, and order tables.
- `src/worker.ts`: auth and protected APIs. Admin access is checked on the server; hiding the admin page link is not used as security.

## Local setup

1. Install Node.js, then run `npm install`.
2. Create the D1 database: `npx wrangler d1 create andrews-gym-db`. Copy its returned ID into `wrangler.jsonc` in place of the example ID.
3. Create `.dev.vars` in this folder with:

   ```text
   BETTER_AUTH_SECRET=replace-with-a-random-secret-at-least-32-characters
   ```

4. Apply the schema locally: `npm run db:local`.
5. Start the Worker: `npm run dev` (builds the pages, then serves the Worker at the local Wrangler URL).

## First administrator

Create an account using the signup page. In the Cloudflare D1 console, promote that account with `UPDATE "user" SET role = 'admin' WHERE email = 'owner@example.com';`. Then sign out and back in, and open `/admin.html`. Keep this step restricted to the gym owner. All admin APIs enforce the Better Auth role on the server.

## Cloudflare deployment

1. Create the D1 database and set its ID in `wrangler.jsonc`.
2. Apply the D1 migration to the remote database with `npm run db:remote`.
3. Set `BETTER_AUTH_URL` in the production Worker vars to the real HTTPS domain, and set the auth secret with `npx wrangler secret put BETTER_AUTH_SECRET`.
4. Build and deploy with `npm run deploy`.
5. Create the first admin account and promote it in the D1 console as above.

## Owner details still needed

- Exact gym location, opening hours, public contact details, and preferred language (German, English, or both).
- Confirmed membership tier names, prices, inclusions, joining/cancellation terms, and whether signup should be open or invite-only.
- Gym logo and real photos.
- Password-reset and email-verification sender/domain. Better Auth email/password sign-in works, but the email sender has not been configured.
- Shop products, photography, stock, tax/VAT rules, fulfilment (pickup or delivery), shipping prices, and payment provider credentials. Until those are known, customers cannot submit paid orders.
- Production domain and required business/legal page content before launch.

## Open-source references

The earlier visual approach was informed by [alfredang/fitnesstracking](https://github.com/alfredang/fitnesstracking) and [mian-ali/GymWebsite](https://github.com/mian-ali/GymWebsite). The app architecture uses the current [Better Auth Cloudflare D1 support](https://better-auth.com/blog/1-5), [Better Auth Admin plugin](https://better-auth.com/docs/plugins/admin), and Cloudflare’s [Workers storage guidance](https://developers.cloudflare.com/workers/platform/storage-options/). No source files were copied from the gym-site repositories.
