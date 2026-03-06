"use client";

const MESSAGES = [
  "Spend £50 = Free Shipping* 🚛",
  "UP TO 70% OFF ON SALE 🔥",
  "New stock added regularly 🆕",
];

export function AnnouncementBar() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 text-amber-900">
      <div className="overflow-hidden py-2">
        <div className="flex animate-marquee gap-12 whitespace-nowrap text-sm font-medium">
          {[...MESSAGES, ...MESSAGES].map((msg, i) => (
            <span key={i}>{msg}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
