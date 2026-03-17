"use client";

const LOGOS = [
  "Wayfair",
  "The Athletic",
  "Harvard",
  "Berkeley",
  "TrueCar",
  "Bombas",
  "Makeship",
];

export function LogoStrip() {
  const items = [...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS];

  return (
    <section className="bg-white py-8 border-b border-[#F0F0F0] overflow-hidden">
      <div className="relative">
        <div className="flex animate-marquee gap-16 items-center">
          {items.map((logo, i) => (
            <span
              key={i}
              className="text-lg font-bold tracking-tight whitespace-nowrap select-none opacity-40 text-[#737373]"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          width: max-content;
        }
      `}</style>
    </section>
  );
}
