# Andrews Gym Platform — Member, Admin, and Shop Scope

## Confirmed direction

- Market: Germany; display membership and product prices in EUR.
- Public landing page remains a single linear page.
- Add public member signup and sign-in using Better Auth.
- Add a member area.
- Add a protected admin dashboard to review members and maintain their membership records.
- Add a merchandise catalogue and cart for gym essentials.
- Hosting target: Cloudflare.

## Proposed implementation

| Area | First release |
|---|---|
| Public site | Single scroll page, three membership choices, links to account creation and product shop. |
| Authentication | Better Auth email/password; member accounts have the default `user` role. Open signup is the current working assumption. |
| Member records | Pending/active/paused/cancelled state, selected plan, start/end dates, and staff-recorded gym visits. Do not store health or training notes in this MVP. |
| Admin | Server-authorized admin role; counts, searchable-by-browser member list, plan/status/date edits, check-in action, product visibility and inventory entry, order list. |
| Merchandise | Product name, description, category, EUR price, image, stock, cart, order schema. |
| Hosting/data | Cloudflare Worker serves static assets and Hono API; D1 stores auth, member, check-in, product, and order records. |

## Data model

- Better Auth `user`, `session`, `account`, and `verification` tables, extended with the Admin plugin’s role/ban fields.
- `members`: one per registered user, initially pending and optionally linked to the membership plan they selected.
- `check_ins`: append-only date-stamped visit records linked to members.
- `products`: editable catalogue, integer cents for EUR amounts, stock, active/hidden state.
- `orders` and `order_items`: prepared to retain payment status and item/price snapshots after checkout integration.

## Access rules

- A visitor can browse the landing page and active shop products.
- A signed-in member can see only their own membership record.
- Admin APIs verify the signed-in user’s role on the server before reading or changing member, stock, or order data.
- Public self-signup never accepts or sets an admin role. The first admin is promoted separately by the owner after the database is initialized.
- Admin edits are limited to membership administration; the MVP avoids collecting member health information.

## Payment and launch boundary

The shop catalogue and cart can be built before the gym’s payment account exists. Paid checkout requires owner decisions and credentials: payment provider, VAT handling, pickup/delivery model, delivery charges, and refund/returns policy. The current implementation leaves paid checkout disabled until those are configured; it does not pretend to accept an order.

## Decisions to confirm with the owner

1. Is member signup open to anyone, or should staff invite/approve accounts before sign-in?
2. Do members pay online or in person? If online, which payment provider does the gym use?
3. Are shop orders local pickup, delivery, or both? Which countries and charges?
4. What does each membership tier include, and what are the real prices and contract terms?
5. Should the site be in German, English, or both?
6. Which email provider/domain should send verification, password reset, booking, and order emails?
7. What member information does staff truly need beyond name, email, chosen plan, dates, status, and visit count?

## Delivery steps

1. Confirm content, signup policy, and owner contact details.
2. Create Cloudflare D1, set Worker secrets, and verify Better Auth schema migrations.
3. Set up the owner administrator and confirm member signup, sign-in, and access control.
4. Add actual member plans, test staff updates and check-ins, and load approved merchandise.
5. Decide/configure payment, VAT, fulfilment, order emails, and returns terms; then enable checkout.
6. Add the real logo/photos, language, domain metadata, and required Germany business/legal pages.
7. Deploy and review the complete user flow on phones and desktop.
