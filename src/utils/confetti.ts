import confetti from "canvas-confetti";

export function fireConfetti(duration = 4000) {
  const end = Date.now() + duration;
  const colors = ["#ff6b9d", "#ffd166", "#ff9ecd", "#c77dff", "#ffb4c2"];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

export function fireTreasureConfetti() {
  confetti({
    particleCount: 120,
    spread: 100,
    origin: { y: 0.6 },
    colors: ["#ffd166", "#ff6b9d", "#c77dff", "#ffb4c2"],
  });
}
