"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <p className="font-semibold text-zinc-900">Karen Arcay Vintage</p>
            <p className="mt-2 text-sm text-zinc-600">
              UK-based vintage clothing & accessories. Value-priced. 100% positive feedback. Add us to your favourite sellers and check back for new listings.
            </p>
          </div>

          {/* Help */}
          <div>
            <p className="font-semibold text-zinc-900">Help</p>
            <ul className="mt-2 space-y-1 text-sm text-zinc-600">
              <li><Link href="/shop" className="hover:text-zinc-900">Shop</Link></li>
              <li><Link href="/cart" className="hover:text-zinc-900">Cart</Link></li>
              <li><a href="mailto:info@karenarcayvintage.com" className="hover:text-zinc-900">Contact</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-semibold text-zinc-900">Sign up and save</p>
            <p className="mt-1 text-sm text-zinc-600">
              Subscribe for special offers and new arrivals.
            </p>
            <form
              action="#"
              method="post"
              className="mt-3 flex gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-2 text-xs text-zinc-500">
              You can unsubscribe at any time. We never share your email.
            </p>
          </div>
        </div>

        {/* Social */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-8">
          <div className="flex gap-4 text-sm text-zinc-600">
            <a href="https://www.instagram.com/karenarcayvintage" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900">Instagram</a>
            <a href="https://www.facebook.com/karenarcayvintage" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-900">Facebook</a>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Karen Arcay Vintage. UK.
        </p>
        <p className="mt-2 text-center text-sm text-zinc-500">
          v1.1.0
        </p>
      </div>
    </footer>
  );
}
