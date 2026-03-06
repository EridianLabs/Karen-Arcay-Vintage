# eBay Marketplace Account Deletion notification endpoint

**Quick setup:** When you launch on Namecheap, add `EBAY_VERIFICATION_TOKEN` in cPanel (see **[LAUNCH.md](./LAUNCH.md)** step 4 and 7). The endpoint is already in the site.

---

This project implements eBay’s **Marketplace Account Deletion** notification endpoint so eBay can notify your app when a user deletes their eBay account (GDPR / data deletion).

- **Endpoint URL:** `https://karenarcayvintage.com/ebay/account-deletion`
- **Method:** POST
- **Implementation:** Next.js Route Handler at `src/app/ebay/account-deletion/route.ts` (no Express).

---

## Behaviour

1. **Verification (eBay setup)**  
   When you click **Save** on the eBay Alerts and Notifications page, eBay sends a **GET** request to your URL with a query parameter:  
   `GET https://karenarcayvintage.com/ebay/account-deletion?challenge_code=xxxx`  
   The server responds with `Content-Type: application/json` and body:
   ```json
   { "challengeResponse": "<SHA256 hash>" }
   ```
   The hash is: `SHA256(challengeCode + EBAY_VERIFICATION_TOKEN + endpoint URL)` (in that order).

2. **Live notifications**  
   When eBay sends a normal account-deletion notification (no `challengeCode`), the server logs the request body to the console and responds with HTTP 200.

3. **All requests**  
   The endpoint always returns HTTP 200 to eBay.

---

## 1. Installing dependencies

No extra packages are required. The endpoint uses Node’s built-in `crypto` module. Ensure you have the project’s dependencies installed:

```bash
npm install
```

---

## 2. Setting the verification token

1. In [eBay Developer](https://developer.ebay.com), open your app and find the **Marketplace Account Deletion** (or similar) section where you register the notification URL and get a **Verification token**.

2. Add the token to your environment:
   - **Local:** in the project root, create or edit `.env` and add:
     ```env
     EBAY_VERIFICATION_TOKEN="your-verification-token-from-ebay"
     ```
   - **Production (e.g. Namecheap/cPanel):** in **Setup Node.js App** → your app → **Environment variables**, add:
     - Name: `EBAY_VERIFICATION_TOKEN`  
     - Value: `your-verification-token-from-ebay`  
     Then restart the Node.js app.

3. Do **not** commit `.env` or put the real token in the repo.

---

## 3. Deploying the endpoint

The route is part of the Next.js app. Deploy the site as you normally do (e.g. Namecheap Stellar + cPanel as in **DEPLOY-NAMECHEAP.md**). No separate server or Express app is needed.

1. **Build**
   ```bash
   npm run build
   ```

2. **Deploy**  
   Upload the built app (including `src/app/ebay/account-deletion/route.ts` and the rest of `src`) and run it with:
   ```bash
   node server.js
   ```
   or `next start`, depending on your setup.

3. **HTTPS**  
   The endpoint must be served over HTTPS at:
   `https://karenarcayvintage.com/ebay/account-deletion`  
   Your Stellar/hosting SSL (or a proxy) should already provide HTTPS for the domain.

4. **Register with eBay**  
   In the eBay Developer portal, register the notification URL:
   `https://karenarcayvintage.com/ebay/account-deletion`  
   and complete verification using the token above. eBay will send a verification request; the endpoint will respond with the correct `challengeResponse` as long as `EBAY_VERIFICATION_TOKEN` is set correctly.

---

## Checking logs

- **Local:** When eBay sends a real deletion notification, the body is printed in the terminal where you run `npm run dev` or `node server.js`.
- **Production:** Check your host’s Node.js or application logs (e.g. cPanel Node.js app logs) for lines starting with `[eBay Account Deletion]`.
