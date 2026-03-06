"use client";

import { EBAY_REVIEWS } from "@/data/ebay-reviews";

export function ReviewsCarousel() {
  return (
    <section className="border-t border-zinc-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-semibold">
          What our customers say
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {[...EBAY_REVIEWS, ...EBAY_REVIEWS].map((r, i) => (
            <div
              key={i}
              className="min-w-[280px] max-w-[320px] flex-shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <p className="text-sm text-zinc-700">&ldquo;{r.text}&rdquo;</p>
              <p className="mt-2 text-xs text-zinc-500">
                {r.date} · 100% positive eBay feedback
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center">
          <a
            href="https://www.ebay.co.uk/str/sindypinksvintagestore?_tab=feedback"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-600 underline hover:text-zinc-900"
          >
            View all feedback on eBay
          </a>
        </p>
      </div>
    </section>
  );
}
