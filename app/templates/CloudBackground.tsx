import { useEffect, useRef } from "react";

interface Puff {
  dx: number;
  dy: number;
  r: number;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
  alpha: number;
  puffs: Puff[];
}

function makeCloud(width: number, height: number): Cloud {
  return {
    x: Math.random() * width,
    y: Math.random() * (height * 0.5 - 50), // Start in top half with buffer
    speed: Math.random() * 0.05 + 0.02, // Slower movement
    scale: Math.random() * 1.2 + 0.6,
    alpha: Math.random() * 0.4 + 0.2,
    puffs: makePuffs(),
  };
}

function makePuffs(): Puff[] {
  const n = Math.floor(Math.random() * 4) + 3; // 3–6 puffs
  return Array.from({ length: n }, (_, i) => ({
    dx: i * 45 - (n * 45) / 2, // spread horizontally
    dy: Math.random() * 20 - 10, // slight vertical variation
    r: Math.random() * 30 + 25, // radius 25–55px
  }));
}

function drawCloud(ctx: CanvasRenderingContext2D, cloud: Cloud) {
  ctx.save();
  ctx.translate(cloud.x, cloud.y);
  ctx.scale(cloud.scale, cloud.scale);
  ctx.globalAlpha = cloud.alpha;

  ctx.beginPath();
  for (const p of cloud.puffs) {
    ctx.moveTo(p.dx + p.r, p.dy);
    ctx.arc(p.dx, p.dy, p.r, 0, Math.PI * 2);
  }
  ctx.fillStyle = "#FFFDF9";
  ctx.fill();

  ctx.restore();
}

interface CloudBackgroundProps {
  count?: number;
}

export default function CloudBackground({ count = 8 }: CloudBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let clouds: Cloud[] = [];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      clouds = Array.from({ length: count }, () =>
        makeCloud(canvas.width, canvas.height)
      );
    };

    const draw = (ts: number) => {
      const dt = Math.min(ts - lastTime, 100);
      lastTime = ts;

      // Sky gradient (Blue & Cream palette)
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#1D4ED8");    // Royal Blue
      grad.addColorStop(0.35, "#3B82F6"); // Sky Blue
      grad.addColorStop(0.65, "#93C5FD"); // Ice Blue
      grad.addColorStop(0.85, "#F5EFE6"); // Soft Sand Cream
      grad.addColorStop(1, "#FFFDF9");    // Warm Ivory Cream
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const c of clouds) {
        // Move cloud to the right
        c.x += c.speed * dt;

        // Wrap around when fully off-screen right
        const maxRadius = Math.max(...c.puffs.map((p) => p.r));
        const cloudWidth = (c.puffs.length * 45 + maxRadius * 2) * c.scale;
        
        if (c.x - cloudWidth > canvas.width) {
          c.x = -cloudWidth;
          c.y = Math.random() * (canvas.height * 0.5 - 50); // Reset in top half
          c.alpha = Math.random() * 0.4 + 0.2;
          c.scale = Math.random() * 1.2 + 0.6;
          c.puffs = makePuffs();
        }

        drawCloud(ctx, c);
      }

      animId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", init);
    init();
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", init);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: -1, display: "block" }}
    />
  );
}
