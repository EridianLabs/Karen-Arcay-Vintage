"use client";

import { useState } from "react";

type SyncResult = {
  created: number;
  updated: number;
  failed: number;
  totalFetched?: number;
  errors: string[];
};

export default function AdminEbayPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [storeName, setStoreName] = useState("sindypink");

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/ebay/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({
          created: 0,
          updated: 0,
          failed: 0,
          totalFetched: 0,
          errors: [data.error || "Sync failed"],
        });
        return;
      }
      setResult(data);
    } catch (e) {
      setResult({
        created: 0,
        updated: 0,
        failed: 0,
        totalFetched: 0,
        errors: [e instanceof Error ? e.message : "Network error"],
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">eBay import &amp; sync</h1>
      <p className="mt-2 text-zinc-600">
        Import your Mum&apos;s eBay store listings (Sindy Pinks Vintage Store) into the
        website. Each item gets a product page with title, description, images and
        price, plus a &ldquo;Buy on eBay&rdquo; button to the live listing. Run sync
        whenever new items are added on eBay.
      </p>

      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Setup</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Add <strong>EBAY_APP_ID</strong> to your environment (e.g. in .env or cPanel).
          Get a free App ID from{" "}
          <a
            href="https://developer.ebay.com/signin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            eBay Developers
          </a>{" "}
          → Create app → copy App ID (Production).           Optional: set{" "}
          <strong>EBAY_STORE_NAME</strong> if different from{" "}
          <code className="bg-zinc-100 px-1">sindypink</code>.
        </p>
        <div className="mt-4">
          <label className="block text-sm font-medium">Seller username (optional override)</label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="sindypink"
            className="mt-1 w-full max-w-md rounded border border-zinc-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="font-semibold">Sync now</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Fetches all current listings from the eBay store and creates or updates
          products. New items get a product page; existing items are updated (price,
          images, description). Run this after adding new listings on eBay.
        </p>
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="mt-4 rounded bg-black px-6 py-2 font-medium text-white hover:bg-zinc-800 disabled:opacity-70"
        >
          {syncing ? "Syncing…" : "Sync from eBay"}
        </button>
      </div>

      {result && (
        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold">Last sync result</h2>
          <p className="mt-2 text-sm">
            Total fetched: <strong>{result.totalFetched ?? "—"}</strong> · Created:{" "}
            <strong>{result.created}</strong> · Updated:{" "}
            <strong>{result.updated}</strong> · Failed:{" "}
            <strong>{result.failed}</strong>
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-sm text-amber-700">
              {result.errors.slice(0, 10).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
              {result.errors.length > 10 && (
                <li>… and {result.errors.length - 10} more</li>
              )}
            </ul>
          )}
        </div>
      )}

      <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6">
        <h2 className="font-semibold">Fetching new items</h2>
        <p className="mt-2 text-sm text-zinc-600">
          There is no automatic cron on Namecheap shared hosting. Run &ldquo;Sync from
          eBay&rdquo; whenever new items are uploaded to the eBay store (e.g. daily or
          after listing). Optionally, you could use a free cron service (e.g.{" "}
          <a
            href="https://cron-job.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            cron-job.org
          </a>
          ) to call <code className="bg-white px-1">/api/admin/ebay/sync</code> on a
          schedule — you would need to protect that URL with a secret or run it only
          when logged in as admin.
        </p>
      </div>
    </div>
  );
}
