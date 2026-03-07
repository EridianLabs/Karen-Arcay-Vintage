import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [productCount, categoryCount, orderCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-zinc-600">
        Manage your vintage shop from here.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/admin/dashboard/products"
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm hover:shadow"
        >
          <p className="text-3xl font-bold">{productCount}</p>
          <p className="mt-1 text-zinc-600">Products</p>
        </Link>
        <Link
          href="/admin/dashboard/categories"
          className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm hover:shadow"
        >
          <p className="text-3xl font-bold">{categoryCount}</p>
          <p className="mt-1 text-zinc-600">Categories</p>
        </Link>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-3xl font-bold">{orderCount}</p>
          <p className="mt-1 text-zinc-600">Orders</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/admin/dashboard/products/new"
          className="inline-block rounded bg-black px-6 py-2 font-medium text-white hover:bg-zinc-800"
        >
          Add new product
        </Link>
        <p className="text-sm text-zinc-600">
          To get the last listings from eBay, go to{" "}
          <Link href="/admin/dashboard/ebay" className="text-blue-600 hover:underline">
            eBay sync
          </Link>{" "}
          and click &ldquo;Sync from eBay&rdquo; — repeat until the console shows <strong>0 new</strong>.
        </p>
      </div>
    </div>
  );
}
