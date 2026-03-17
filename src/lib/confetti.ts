import confetti from "canvas-confetti";

export function firePublishConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#2D6A4F", "#4ADE80", "#10B981", "#059669"],
  });
  setTimeout(() => {
    confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors: ["#2D6A4F", "#F59E0B"] });
    confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors: ["#2D6A4F", "#F59E0B"] });
  }, 300);
}
