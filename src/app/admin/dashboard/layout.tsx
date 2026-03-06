import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const username = await getSession();
  if (!username) {
    redirect("/admin");
  }

  return (
    <div className="min-h-[80vh] bg-zinc-50">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <Link href="/admin/dashboard" className="font-semibold hover:underline">
                Dashboard
              </Link>
              <Link href="/admin/dashboard/products" className="text-zinc-600 hover:underline">
                Products
              </Link>
              <Link href="/admin/dashboard/products/new" className="text-zinc-600 hover:underline">
                Add product
              </Link>
              <Link href="/admin/dashboard/categories" className="text-zinc-600 hover:underline">
                Categories
              </Link>
              <Link href="/admin/dashboard/ebay" className="text-zinc-600 hover:underline">
                eBay sync
              </Link>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
