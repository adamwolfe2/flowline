"use client";

const LOGOS = ["Wayfair", "The Athletic", "Harvard", "Berkeley", "TrueCar", "Bombas", "Makeship", "Domino's"];

export function LogoBar() {
  return (
    <section className="py-8 border-b border-gray-100 overflow-hidden" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="relative">
        <div className="flex animate-marquee gap-16 items-center">
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <span key={i} className="text-gray-300 text-lg font-bold tracking-tight whitespace-nowrap select-none">
              {logo}
            </span>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
          width: max-content;
        }
      `}</style>
    </section>
  );
}
