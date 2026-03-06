"use client";

const REVIEWS = [
  {
    text: "This place is amazing!! I got a LOT of stuff for under £10, but the prices are so good sale or not.",
    stars: 5,
  },
  {
    text: "Love this place! Great selection and very affordable.",
    stars: 5,
  },
  {
    text: "Great place, lovely and very helpful. So please pop by!",
    stars: 5,
  },
  {
    text: "Leave yourself plenty of time to really dig through – the prices are keen so it's worth it!",
    stars: 5,
  },
  {
    text: "So much choice, styles and eras. A real hidden gem.",
    stars: 5,
  },
  {
    text: "I absolutely LOVE this shop. Amazing finds and very affordable.",
    stars: 5,
  },
];

export function ReviewsCarousel() {
  return (
    <section className="border-t border-zinc-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-semibold">
          Our customers <strong>love</strong> our products
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {[...REVIEWS, ...REVIEWS].map((r, i) => (
            <div
              key={i}
              className="min-w-[280px] max-w-[320px] flex-shrink-0 rounded-xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <p className="text-sm text-zinc-700">&ldquo;{r.text}&rdquo;</p>
              <p className="mt-2 text-sm font-medium text-amber-600">
                ★★★★★ 100% positive eBay feedback
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
