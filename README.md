# Nur Dress Gallary

Mobile-first modest wear shop built with Vinext and Cloudflare Workers. D1 stores the catalog, staff roles and orders; R2 stores authorized image uploads.

## Owner onboarding

Open `/admin`, sign in with ChatGPT, then enter the separately supplied one-time setup code. The first successful claim is atomically bound to the signed-in user. The server stores only the setup-code SHA-256 hash in the `ADMIN_SETUP_HASH` runtime secret; the code is not in source.

Owner can authorize staff emails in Team. Managers edit products, categories, offers, settings and order status. Editors edit products only. Every write is authorized server-side and checks the request origin. Owner access cannot be changed via staff controls.

## Catalog workflow

Edit a product, apply its changes, then Save shop. Each colour has an independent photo upload and colour swatch. Sizes are configurable, including Free size. Categories feed desktop dropdown, mobile menu, collection tabs and category cards automatically. Saves use optimistic revision checks to prevent concurrent overwrite.

Sample collection uses AI-generated illustrative photography. Replace all sample details with real stock. Ordering is initially disabled. Confirm delivery fees and product details, then enable cash-on-delivery order requests in Settings. Orders require staff confirmation; stock represents total product availability and is not automatically reserved or decremented. Online payment, SMS and delivery provider integrations are not connected. Return terms must be confirmed by the shop.

Site hosting is initially owner-private for review. Public storefront audience and application staff authorization are separate controls.

## Verification

`node node_modules/typescript/bin/tsc --noEmit`

Build via the Sites build helper. After build, `node scripts/check-shop.mjs` runs isolated Miniflare integration checks against an in-memory test database with test identities. It checks storefront rendering, anonymous admin gate, request origins, owner activation, duplicate owner rejection, staff role enforcement, category persistence, editor restrictions, revision conflicts, order creation and invalid variant rejection. It does not touch production records. Browser/mobile visual QA was unavailable in the authoring environment.

Photography: built-in image generation, editorial modest abayas in dusty rose/sage/black and hijab portraits in dusty rose/taupe. Assets are under `public/images`. Supplied shop logo is preserved. Hadith attribution: https://sunnah.com/muslim:91a.

## Offers ribbon

Offers appears after the category section. Owner and Manager can add bilingual messages, badge labels, linked product categories, visibility and sequence in the Offers admin section. Ribbon visibility and animation duration (15–90 seconds) are configurable. Animation moves right to left, pauses on hover, focus or the pause control, and respects reduced-motion preferences. Editors cannot modify offers or ribbon settings. Hidden offers are excluded from storefront data.
