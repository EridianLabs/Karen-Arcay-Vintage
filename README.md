# Karen Arcay Vintage – Vintage Shop & CMS

UK-based vintage marketplace for **karenarcayvintage.com**. Admin CMS to add products (title, description, images, categories) and accept payments via Stripe (GBP).

## Features

- **Shop front**: Homepage, category navigation, product grid, product pages with “You may also like” upsells, sale section
- **Cart & checkout**: Cart in browser, checkout via Stripe (card payments)
- **Admin CMS** (login with username/password):
  - Dashboard (product/category/order counts)
  - **Products**: Add and edit products with title, description, multiple images, category, condition, size, price, sale price, publish/draft
  - **Categories**: Create categories (e.g. Women's, Men's, Accessories, Sale)
  - Image uploads stored under `public/uploads/`
- **Upselling**: Related products by category on product page; sale section on homepage
- **eBay import**: Sync listings from seller **sindypink** (or set EBAY_STORE_NAME to another seller). Each item gets a product page with title, description, images and price, plus a **Buy on eBay** button to the live listing. Run sync whenever new items are added (see Admin → eBay sync).

## Quick start

1. **Install and database**

   ```bash
   npm install
   npm run db:push
   npm run db:seed
   ```

   Default admin: **username** `admin`, **password** `admin123`. Change these in production.

2. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` – already set for local SQLite (`file:./dev.db`)
   - `NEXTAUTH_SECRET` – any long random string (for admin session)
   - **Stripe** (for payments):
     - [Stripe Dashboard](https://dashboard.stripe.com) → Developers → API keys
     - `STRIPE_SECRET_KEY` (sk_test_... or sk_live_...)
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_... or pk_live_...)
   - `NEXT_PUBLIC_SITE_URL` – your site URL (e.g. `https://karenarcayvintage.com`)
   - **eBay** (optional, for import): `EBAY_APP_ID` from [eBay Developers](https://developer.ebay.com), and optionally `EBAY_STORE_NAME` (default: `sindypink`)

3. **Run the app**

   ```bash
   npm run dev
   ```

   - Shop: http://localhost:3000  
   - Admin: http://localhost:3000/admin (login with admin / admin123)

## Stripe setup (payments)

1. Create a Stripe account at [stripe.com](https://stripe.com).
2. In Dashboard → Developers → API keys, copy the **Secret key** and **Publishable key** into `.env` as above.
3. For **live payments**, switch to Live keys and set the same env vars.
4. (Optional) To mark orders as “paid” automatically after payment, add a webhook in Stripe Dashboard → Developers → Webhooks:
   - Endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Event: `checkout.session.completed`
   - Copy the **Signing secret** into `.env` as `STRIPE_WEBHOOK_SECRET`.

Checkout uses Stripe Checkout (hosted payment page); no card details are stored on your server.

## Admin: adding products

1. Go to **Admin** → sign in.
2. **Categories**: Create any categories you need (e.g. Women's, Men's, Dresses, Sale).
3. **Add product**: Title, full description, price, optional sale price, category, condition, size, multiple images (upload), and publish/draft.
4. Products appear on the shop and in the sale section when they have a sale price.

## Imagery (hero & category tiles)

The homepage uses **stock imagery** (Unsplash) for the hero and category grid so the site looks full and lively without your own photos yet. You can replace these anytime:

- **Hero**: Edit `src/components/HeroSection.tsx` – change `HERO_IMAGE` to your own URL or a local path (e.g. `/hero.jpg` in `public/`).
- **Category tiles**: Edit `src/components/CategoryHeroGrid.tsx` – each category has an `image` URL; swap for your own photos (e.g. women’s rail, men’s rail, dresses, etc.) or keep free stock from [Unsplash](https://unsplash.com) (search “vintage clothing”, “vintage shop”).

Product images are always from the Admin (uploads) or from eBay when you sync.

## Tech stack

- **Next.js 16** (App Router), **TypeScript**, **Tailwind CSS**
- **Prisma** + **SQLite** (can switch to PostgreSQL for production)
- **Stripe** for payments
- **jose** + **bcryptjs** for admin sessions

## Scripts

- `npm run dev` – development server
- `npm run build` – production build
- `npm run start` – run production server (custom server for Namecheap/cPanel)
- `npm run start:next` – run production server with Next.js built-in server
- `npm run db:push` – apply Prisma schema to DB
- `npm run db:seed` – create default admin and sample categories

## Deploying to Namecheap (Stellar hosting)

See **[DEPLOY-NAMECHEAP.md](./DEPLOY-NAMECHEAP.md)** for step-by-step instructions to put the site live on karenarcayvintage.com using your Stellar plan and cPanel’s “Setup Node.js App”.
