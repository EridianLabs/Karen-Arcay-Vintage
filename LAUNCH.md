# Launch on Namecheap – simple guide

One list. Do the steps in order. The eBay endpoint is already in your site; you just add one setting when you're in cPanel.

---

## Deploy from GitHub (your usual workflow)

You **fetch the app from GitHub** (clone or pull into your hosting). The repo does **not** include `node_modules` or `.next`, so on the server you must install and build after each deploy:

1. **Get the code from GitHub** into your app folder (e.g. **nodeapp**).  
   - Either: cPanel **Terminal** → `cd ~/nodeapp` → `git pull origin main`  
   - Or: clone fresh into nodeapp, or use cPanel’s “Git Version Control” / “Deploy from repository” if you have it.

2. **On the server**, in the app folder, run:
   ```bash
   npm install
   npm run build
   ```
   - If you use **Setup Node.js App**: click **Run NPM Install**, then in **Terminal** run `npm run build` in the app folder (e.g. `cd ~/nodeapp && npm run build`).

3. **Restart** the Node.js app in Setup Node.js App.

If the host **does not let you run `npm run build`** (no Terminal, or build runs out of memory/time), then you have to build on your computer and upload: run `npm run build` locally, zip including the `.next` folder, upload that zip to nodeapp and extract, then on the server only **Run NPM Install** and **Restart** (no build on server).

---

## 1. Point your domain

- Namecheap → **Domain List** → **Manage** (karenarcayvintage.com).
- **Nameservers**: use the ones for your Stellar hosting (or “Namecheap BasicDNS” if that’s what Stellar says).
- Save. DNS can take a few hours.

---

## 2. Build the site on your computer

In Terminal, in this project folder:

```bash
cd "/Users/alexarcay/Desktop/Think Vintage"
npm install
npm run build
```

Wait until it finishes with no errors.

---

## 3. Zip and upload

**Zip these** (and nothing else):

- `server.js`
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `eslint.config.mjs`
- **entire folders:** `.next` · `public` · `prisma` · `src`

**Do not zip:** `node_modules` · `.env` · `.git`

Then in **cPanel** → **File Manager**:
- Many hosts (including Namecheap) **do not allow** `public_html` as the Node.js Application root. Use **nodeapp** (or the folder cPanel created for your app).
- Open that folder (e.g. **nodeapp**) and **Upload** the zip there → **Extract** it so that `server.js`, `package.json`, `.next`, `src`, `prisma`, `public` are **directly inside** nodeapp. (If you already extracted into public_html, move/copy those files and folders into **nodeapp** instead.)
- Enable “Show Hidden Files” if you need to see the `.next` folder.

---

## 4. Create the Node.js app in cPanel

1. cPanel → **Setup Node.js App** → **Create Application** (or **Edit** your existing one if you already created it).
2. Set:
   - **Node.js version**: **20.x or 22.x** (required – do **not** use 10.x; Next.js 16 will not run on Node 10).
   - **Application root**: the folder where your app files must live. **Use only the folder name**, e.g. `nodeapp`, no leading slash. cPanel often **does not allow** `public_html` here – use **nodeapp** and put your zip contents (server.js, .next, src, prisma, public, etc.) inside nodeapp.
   - **Application URL**: `karenarcayvintage.com` (your domain).
   - **Application startup file**: **`server.js`** only (not start.js). If you see “[start.js]” in logs, the startup file is wrong – change it to server.js and Restart.
3. **Environment variables** – add every one of these (click “Add variable” for each):

   | Name | Value |
   |------|--------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `file:/home/karezcxo/nodeapp/prisma/dev.db` (use your real path; see “Database: Unable to open” below if it fails) |
   | `NEXTAUTH_SECRET` | (make up a long random string, 32+ characters) |
   | `NEXT_PUBLIC_SITE_URL` | `https://karenarcayvintage.com` |
   | `EBAY_VERIFICATION_TOKEN` | (the token eBay gives you for Account Deletion – see step 7) |
   | `EBAY_APP_ID` | (eBay App ID / Client ID – required for “Sync from eBay”) |
   | `EBAY_CLIENT_SECRET` | (eBay Cert ID / Client Secret – required for Sync; used with App ID for OAuth) |
   | `EBAY_STORE_NAME` | (your eBay seller username – used to fetch your listings; often same as store name) |
   | `SETUP_SECRET` | (random string, for one-time DB setup if you have no Terminal – see “Clean re-upload”) |
   | (optional) `STRIPE_SECRET_KEY` | only if you take card payments on-site |
   | (optional) `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | only if you use Stripe checkout |

4. Save / **Create**.

---

## 5. Install and database

In **Setup Node.js App**, for your app:

1. Click **Run NPM Install**.
2. Open **Terminal** in cPanel, go to your app folder, then run:

   ```bash
   cd ~/nodeapp
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```
   (Use the same folder name as your Application root.)

   **If you see a Prisma error** pointing at `nodevenv/.../prisma/build/index.js`, Node is loading from the wrong place. In Terminal run a clean install from your app folder so `node_modules` lives inside nodeapp:
   ```bash
   cd ~/nodeapp
   rm -rf node_modules
   npm install
   ./node_modules/.bin/prisma generate
   ```
   Then restart the app in Setup Node.js App.

---

## 6. Start the site

In **Setup Node.js App** → click **Start** (or **Restart**).

Open **https://karenarcayvintage.com**. You should see the shop.  
Admin: **https://karenarcayvintage.com/admin** (login: `admin` / `admin123` – change the password after first login).

---

## 7. eBay Account Deletion (optional, one extra step)

The endpoint is already live at: **https://karenarcayvintage.com/ebay/account-deletion**

1. In eBay Developer, where you register the Account Deletion URL, paste that URL and get the **verification token**.
2. In cPanel → **Setup Node.js App** → your app → **Edit** → add (or update) environment variable:
   - `EBAY_VERIFICATION_TOKEN` = that token.
3. **Restart** the app.

eBay will then verify the URL. You don’t need to install or deploy anything else for this.

---

## If something goes wrong

- **Site doesn’t load**: Check the app is **Started** and the domain is pointed to this hosting (step 1).
- **500 error**: Check cPanel error/Node logs. Make sure every env var from step 4 is set.
- **Admin login doesn’t work**: Run the setup URL below (or `npx prisma db seed` in the app folder), then try `admin` / `admin123`.
- **Still see “[start.js]” in logs**: The app is still using start.js. In **File Manager → nodeapp**, **delete start.js** so only server.js can run. In Setup Node.js App set **Application startup file** to **server.js**, Save, Restart.
- **“Unable to open the database file”**: The Node process can’t create or write to the SQLite file. (1) In cPanel set **DATABASE_URL** to the **full path**: `file:/home/karezcxo/nodeapp/prisma/dev.db` (replace with your actual path if different). (2) In File Manager open **nodeapp/prisma**, check that the folder exists; right‑click **prisma** → **Permissions** → set to **775** so the app can create `dev.db` inside it. (3) Restart the app, then open your setup URL once to run `prisma db push` and create the tables.

**Error 503 + "Prisma not in node_modules" or "No production build in .next"**  
When you **deploy from GitHub**, the server has no `node_modules` and no `.next`. After pulling/cloning into the app folder, on the server run: **`npm install`** then **`npm run build`**, then **Restart**. (In cPanel: Run NPM Install, then Terminal `cd ~/nodeapp && npm run build`, then Restart.) If the host won’t run `npm run build` (no Terminal or build fails), build locally and zip including `.next`, upload and extract, then Run NPM Install and Restart.

For more detail (Stripe webhook, troubleshooting), see **DEPLOY-NAMECHEAP.md**.

---

## No Terminal? Where to see errors

If your Namecheap cPanel has **no Terminal**:

1. **Error Logs** – cPanel → **Metrics** or **Errors** → **Error Log** (or **Latest 300 errors**). Shows web server and sometimes Node errors.
2. **Node app logs** – In **Setup Node.js App** → your app, look for **Logs** or **View logs**. Or in **File Manager** → **nodeapp** → open **stderr.log** (or **stdout.log**) to see what the Node app printed.
3. **Run NPM Install** – If it fails, some cPanels show a short message. Check the same log files above for npm/Prisma errors.

---

## Clean re-upload (and no Terminal)

If you get internal server errors or **Run NPM Install** never worked, do a **clean re-upload** and then set up the database **without Terminal**:

1. **On your Mac** – Build and zip:
   ```bash
   cd "/Users/alexarcay/Desktop/Think Vintage"
   npm run build
   zip -r deploy.zip server.js package.json package-lock.json next.config.ts tsconfig.json postcss.config.mjs eslint.config.mjs .next public prisma src
   ```

2. **In cPanel File Manager** – Open **nodeapp**. Delete everything inside (so nodeapp is empty). Upload **deploy.zip** and **Extract** so `server.js`, `package.json`, `.next`, `src`, `prisma`, `public` are directly inside nodeapp.

3. **Setup Node.js App** – Application root = **nodeapp**, **Application startup file** = **server.js**, Node **20.x**. Add env vars from step 4 above (including **SETUP_SECRET**). Click **Run NPM Install** and wait. If it fails, check **Error Log** and **nodeapp/stderr.log** for the reason. Then click **Restart**.

4. **Set up the database without Terminal** – Add this env var in Setup Node.js App:
   - **SETUP_SECRET** = (pick a random string, e.g. `mySecretSetup123` – only you need to know it).

   Restart the app, then in your browser open **once**:
   ```
   https://karenarcayvintage.com/api/setup-db?secret=mySecretSetup123
   ```
   (Use the same value you set for SETUP_SECRET.) You should see `{"ok":true,...}`. That creates the tables and admin user (admin / admin123). Then **remove or change SETUP_SECRET** so no one else can run setup.

5. Open **https://karenarcayvintage.com** and **https://karenarcayvintage.com/admin** (login: admin / admin123).

---

## Site shows “It works! NodeJS 10.24.1” instead of the shop

That page is **not** your site – it’s the default Node placeholder. Fix it like this:

1. **Use the right Node version**  
   In **Setup Node.js App** → your application → **Edit**.  
   Set **Node.js version** to **20.x** or **22.x**. Node 10 is too old for Next.js; the real app will not run on it. Save.

2. **Point the app at your project folder**  
   **Application root** must be the folder that contains **your** `server.js`, `package.json`, `.next`, `src`, `prisma`, and `public` (the one where you extracted the zip).  
   - If you have more than one Node app, the domain might be tied to the wrong one (the default “It works!” app).  
   - Edit the app that has **Application URL** = `karenarcayvintage.com` and set its **Application root** to the folder with your extracted files.  
   - If your files are in e.g. `karenarcayvintage.com/myapp`, set Application root to `karenarcayvintage.com/myapp` (or move the contents so `server.js` is directly in `karenarcayvintage.com` and set root to `karenarcayvintage.com`).

3. **Set startup file**  
   **Application startup file** must be `server.js` (not `app.js` or anything else).

4. **Install and start**  
   Click **Run NPM Install** for that app, then **Restart** (or **Start**).  
   Wait a few seconds and open **https://karenarcayvintage.com** again. You should see the Karen Arcay Vintage homepage, not “It works!”.
