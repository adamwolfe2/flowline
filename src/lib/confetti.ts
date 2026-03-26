import confetti from "canvas-confetti";

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + Math.round(amount * 255));
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(amount * 255));
  const b = Math.min(255, (num & 0x0000ff) + Math.round(amount * 255));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

export function firePublishConfetti(brandColor?: string) {
  const primary = brandColor || "#2D6A4F";
  const light = lighten(primary, 0.3);
  const lighter = lighten(primary, 0.5);
  const colors = [primary, light, lighter, "#FFFFFF"];

  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors,
  });
  setTimeout(() => {
    confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors });
  }, 300);
}
