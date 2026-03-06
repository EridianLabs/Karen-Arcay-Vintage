"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Who is behind the shop?",
    a: "Welcome to our eBay shop. We sell separates, shoes & boots, vintage furniture, accessories, vintage books, coats & jackets and many more items. We are constantly listing new items—add us to your favourite sellers and come again! Based in the United Kingdom.",
  },
  {
    q: "How are items described and checked?",
    a: "Each item is inspected and described honestly. We note condition, measurements and any flaws so you know exactly what you're buying.",
  },
  {
    q: "How does vintage sizing work?",
    a: "Vintage sizing often differs from modern sizes. We provide measurements where possible—please check the listing description before you buy.",
  },
  {
    q: "Do you offer returns?",
    a: "We do not offer returns. All sales are final. Please read the item description and ask any questions before purchasing.",
  },
  {
    q: "How often is new stock added?",
    a: "New items are listed regularly. Add us to your favourite sellers on eBay and check back often, or sign up to our newsletter below for updates.",
  },
  {
    q: "How do I get special offers?",
    a: "Sign up to our newsletter in the footer for new arrival alerts and occasional offers.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-t border-zinc-200 bg-zinc-50 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="mb-6 text-center text-2xl font-bold">FAQ&apos;s</h2>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-zinc-200 bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-zinc-900"
              >
                {faq.q}
                <span className="text-zinc-500">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              {openIndex === i && (
                <div className="border-t border-zinc-100 px-4 py-3 text-sm text-zinc-600">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
