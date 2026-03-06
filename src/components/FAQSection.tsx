"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How do we source our stock?",
    a: "We source vintage pieces from trusted suppliers and personal collections across the UK, focusing on quality and authenticity.",
  },
  {
    q: "How are pieces described and checked?",
    a: "Each item is inspected and described honestly. We note condition, measurements and any flaws so you know exactly what you're buying.",
  },
  {
    q: "How does sizing work?",
    a: "Vintage sizing often differs from modern sizes. We provide measurements where possible and suggest checking the description before you buy.",
  },
  {
    q: "How often is stock updated?",
    a: "New items are added regularly. Follow us on social media or check back often for the latest arrivals.",
  },
  {
    q: "How do I find special discounts?",
    a: "Sign up to our newsletter in the footer for exclusive offers and new arrival alerts.",
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
