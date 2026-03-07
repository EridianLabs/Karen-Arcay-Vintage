import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { DeleteAllProductsButton } from "./DeleteAllProductsButton";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-2">
          <DeleteAllProductsButton count={products.length} />
          <Link
            href="/admin/dashboard/products/new"
            className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add product
          </Link>
        </div>
      </div>
      {products.length === 0 ? (
        <p className="mt-8 text-zinc-600">No products yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse border border-zinc-200 bg-white">
            <thead>
              <tr className="bg-zinc-50">
                <th className="border border-zinc-200 p-2 text-left text-sm font-medium">Image</th>
                <th className="border border-zinc-200 p-2 text-left text-sm font-medium">Title</th>
                <th className="border border-zinc-200 p-2 text-left text-sm font-medium">Category</th>
                <th className="border border-zinc-200 p-2 text-left text-sm font-medium">Price</th>
                <th className="border border-zinc-200 p-2 text-left text-sm font-medium">Listing</th>
                <th className="border border-zinc-200 p-2 text-left text-sm font-medium">Status</th>
                <th className="border border-zinc-200 p-2 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const images = JSON.parse(p.images || "[]") as string[];
                return (
                  <tr key={p.id}>
                    <td className="border border-zinc-200 p-2">
                      {images[0] ? (
                        <div className="relative h-12 w-12">
                          <Image
                            src={images[0].startsWith("http") ? images[0] : images[0]}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="border border-zinc-200 p-2 text-sm">{p.title}</td>
                    <td className="border border-zinc-200 p-2 text-sm">{p.category?.name ?? "—"}</td>
                    <td className="border border-zinc-200 p-2 text-sm">£{p.price.toFixed(2)}</td>
                    <td className="border border-zinc-200 p-2 text-sm">
                      {p.ebayListingType === "AUCTION"
                        ? "Auction"
                        : p.ebayListingType === "FIXED_PRICE"
                          ? "Buy now"
                          : "—"}
                    </td>
                    <td className="border border-zinc-200 p-2 text-sm">
                      {p.published ? "Published" : "Draft"}
                    </td>
                    <td className="border border-zinc-200 p-2 text-sm">
                      <Link
                        href={`/admin/dashboard/products/${p.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
