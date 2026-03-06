const badgeStyles = [
  { bg: "bg-sky-100", text: "text-sky-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
] as const;

export function TrustBadges() {
  const badges = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-1.607-1.274-2.915-2.84-2.915a2.839 2.839 0 00-2.84 2.915v.958m0 0h-2.25m0 0h-2.25m0 11.177h2.25" />
        </svg>
      ),
      title: "Express Shipping",
      subtitle: "48 Hour Delivery",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      ),
      title: "Value-Priced",
      subtitle: "Pricing True to Value",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
      ),
      title: "UK Seller",
      subtitle: "Based in United Kingdom",
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.064.083 1.491 1.357.687 2.027l-4.066 3.12 1.546 4.917c.272.864-.73 1.576-1.512 1.127L12 18.354l-4.345 2.257c-.782.449-1.784-.263-1.512-1.127l1.546-4.917-4.066-3.12c-.804-.67-.377-1.944.687-2.027l5.404-.434 2.082-5.005z" clipRule="evenodd" />
        </svg>
      ),
      title: "100% Positive Feedback",
      subtitle: "4.9K+ items sold",
    },
  ];

  return (
    <section className="border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
          {badges.map(({ icon, title, subtitle }, i) => {
            const style = badgeStyles[i];
            return (
              <div
                key={title}
                className="flex flex-col items-center rounded-2xl bg-white/90 p-5 text-center shadow-sm ring-1 ring-zinc-200/50 transition hover:shadow-md sm:p-6"
              >
                <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${style.bg} ${style.text}`}>
                  {icon}
                </div>
                <p className="text-sm font-semibold text-zinc-900">{title}</p>
                <p className="mt-0.5 text-xs text-zinc-600">{subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
