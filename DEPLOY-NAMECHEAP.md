# Deploy Karen Arcay Vintage to Namecheap (Stellar hosting)

**Want the short version?** Use **[LAUNCH.md](./LAUNCH.md)** – one simple checklist.

---

Your Stellar plan includes **cPanel** and **Setup Node.js App**, so you can run this Next.js site on your hosting and keep using your domain **karenarcayvintage.com**.

---

## 1. Point your domain to Stellar hosting

- In **Namecheap**: Domain List → **Manage** next to **karenarcayvintage.com**.
- Under **Nameservers**, choose **Namecheap BasicDNS** (or the nameservers that came with Stellar).
- If Stellar is on a different product, open the **Stellar** plan in your account and note the **cPanel** link and the “point your domain” instructions (often: add the domain as **Addon Domain** in cPanel, or use the nameservers shown for that hosting).
- Wait for DNS to update (up to 24–48 hours; often much faster).  
  [Namecheap: Connect domain to hosting](https://www.namecheap.com/support/knowledgebase/article.aspx/9837/46/how-to-connect-a-domain-to-a-server-or-hosting/)

---

## 2. Build the site on your computer

On your Mac (in the project folder):

```bash
cd "/Users/alexarcay/Desktop/Think Vintage"

# Install dependencies (if not already)
npm install

# Build the app (required before upload)
npm run build
```

Make sure this finishes with no errors.

---

## 3. Prepare the zip for upload

Create a zip that includes the built app and config, but **not** `node_modules` or `.env`:

**Include:**

- `server.js` (custom Node server for cPanel)
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `.next` (entire folder – this is the build output)
- `public` (entire folder, including `uploads` if you have any)
- `prisma` (entire folder: `schema.prisma` and `dev.db` if you want to start with an existing DB)
- `src` (entire folder)

**Exclude:**

- `node_modules`
- `.env` (you’ll set env vars in cPanel)
- `.git`
- `README.md`, `DEPLOY-NAMECHEAP.md` (optional; excluding them keeps the zip smaller)

You can do this by zipping the project and then deleting `node_modules` and `.env` from the zip, or by zipping only the listed items.

---

## 4. Upload the zip to cPanel

1. Log in to **cPanel** (from your Namecheap Stellar product page).
2. Open **File Manager**.
3. Go to the folder for **karenarcayvintage.com** (often `karenarcayvintage.com` or the path cPanel shows for that domain – **not** `public_html` for the main site if that’s used for something else; use the **application root** you’ll use in Step 6).
4. **Upload** your zip file.
5. **Extract** it there so that `server.js`, `package.json`, `.next`, `prisma`, `public`, `src` are directly inside that folder (or in one subfolder you’ll use as “Application root” in Step 6).

---

## 5. Create the Node.js app in cPanel

1. In cPanel, open **Setup Node.js App** (under “Software” or “Applications”).
2. Click **Create Application**.
3. Set:

   - **Node.js version**: 20.x or 22.x (match what you use locally if possible).
   - **Application mode**: Production.
   - **Application root**: The folder where you extracted the files (e.g. `karenarcayvintage.com` or `karenarcayvintage.com/app`).
   - **Application URL**: `karenarcayvintage.com` (or the domain/subdomain you use for this site).
   - **Application startup file**: `server.js`.

4. Add **Environment variables** (click “Add variable” for each):

   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `file:./prisma/dev.db` (or a path inside your app root where the SQLite file will live)
   - `NEXTAUTH_SECRET` = (a long random string, e.g. 32+ characters)
   - `STRIPE_SECRET_KEY` = your Stripe secret key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = your Stripe publishable key
   - `NEXT_PUBLIC_SITE_URL` = `https://karenarcayvintage.com`

   Do **not** put your real `.env` file in the zip; only set these in cPanel.

5. Save / **Create** the application.

---

## 6. Install dependencies and prepare the database

1. In **Setup Node.js App**, find your new app and click **Run NPM Install** (so `node_modules` is created on the server).
2. Open **Terminal** in cPanel (or use SSH if you have it).
3. Go to the **application root** (same path as in Step 5), for example:
   ```bash
   cd ~/karenarcayvintage.com
   ```
4. Run:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```
   This creates/updates the SQLite database and seeds the admin user (`admin` / `admin123`). Change the password after first login.

If Terminal is not available, you may need to run these via **SSH** (Namecheap: [How to access hosting via SSH](https://www.namecheap.com/support/knowledgebase/article.aspx/1016/89/how-to-access-a-hosting-account-via-ssh)).

---

## 7. Start the app

In **Setup Node.js App**, click **Start** (or **Restart**) for your application.

Then open **https://karenarcayvintage.com** in your browser. You should see the shop. Admin: **https://karenarcayvintage.com/admin** (login: `admin` / `admin123`; change password after first login).

---

## 8. Optional: Stripe webhook (mark orders as paid)

To mark orders as “paid” when a customer completes Stripe Checkout:

1. In [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks), add an endpoint:
   - URL: `https://karenarcayvintage.com/api/webhooks/stripe`
   - Event: `checkout.session.completed`
2. Copy the **Signing secret** (starts with `whsec_`).
3. In cPanel **Setup Node.js App** → your app → **Edit** → add environment variable:
   - `STRIPE_WEBHOOK_SECRET` = that signing secret.

Then restart the app.

---

## Troubleshooting

- **Site not loading**: Check that the app is **Started** in Setup Node.js App and that **Application URL** is exactly your domain. Ensure the domain is pointed to this hosting (Step 1).
- **500 or “Internal server error”**: In cPanel, check **Errors** or **Node.js app logs** (if available). Ensure `DATABASE_URL` points to a path where the process can create/write `prisma/dev.db`.
- **Admin login fails**: Run `npx prisma db seed` again in the application root; then try `admin` / `admin123`.
- **Images/uploads**: The app writes uploads to `public/uploads`. Ensure that folder exists and is writable (e.g. permissions 755 or 775).

Namecheap’s own guide: [Deploy Next.js in cPanel](https://www.namecheap.com/support/knowledgebase/article.aspx/10686/29/how-to-deploy-reactjs-vitejs-react-native-and-nextjs-applications-in-cpanel/) and [Setup Node.js App](https://www.namecheap.com/support/knowledgebase/article.aspx/10047/2182/how-to-work-with-nodejs-app/).
