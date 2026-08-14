import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  state: string;
  elapsed: number;
  alpha: number;
  fadeInDur: number;
  onDur: number;
  fadeOutDur: number;
  offDur: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  dx: number;
  dy: number;
  length: number;
  speed: number;
  alpha: number;
  active: boolean;
}

const STAR_COLORS = ["#FFFDF9", "#E0F2FE", "#93C5FD", "#F5EFE6", "#C084FC"];

function makeStar(width: number, height: number, rmax: number): Star {
  const states = ["off", "fadein", "on", "fadeout"];
  const state = states[Math.floor(Math.random() * states.length)];
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * (rmax - 0.4) + 0.4,
    state,
    elapsed: Math.random() * 1000,
    alpha: state === "on" ? 1 : 0,
    fadeInDur: Math.random() * 400 + 200,
    onDur: Math.random() * 1500 + 500,
    fadeOutDur: Math.random() * 400 + 200,
    offDur: Math.random() * 2000 + 500,
    color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
  };
}

function updateStar(s: Star, dt: number) {
  s.elapsed += dt;

  if (s.state === "off") {
    s.alpha = 0;
    if (s.elapsed >= s.offDur) {
      s.state = "fadein";
      s.elapsed = 0;
    }
  } else if (s.state === "fadein") {
    s.alpha = Math.min(s.elapsed / s.fadeInDur, 1);
    if (s.elapsed >= s.fadeInDur) {
      s.state = "on";
      s.elapsed = 0;
      s.alpha = 1;
    }
  } else if (s.state === "on") {
    s.alpha = 1;
    if (s.elapsed >= s.onDur) {
      s.state = "fadeout";
      s.elapsed = 0;
    }
  } else if (s.state === "fadeout") {
    s.alpha = Math.max(1 - s.elapsed / s.fadeOutDur, 0);
    if (s.elapsed >= s.fadeOutDur) {
      s.state = "off";
      s.elapsed = 0;
      s.fadeInDur = Math.random() * 400 + 200;
      s.onDur = Math.random() * 1500 + 500;
      s.fadeOutDur = Math.random() * 400 + 200;
      s.offDur = Math.random() * 2000 + 500;
    }
  }
}

function createShootingStar(width: number, height: number): ShootingStar {
  const x = Math.random() * width * 0.8;
  const y = Math.random() * height * 0.4;
  const angle = Math.PI / 4 + (Math.random() * 0.2 - 0.1);
  const speed = Math.random() * 8 + 10;
  return {
    x,
    y,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    length: Math.random() * 120 + 80,
    speed,
    alpha: 1,
    active: true,
  };
}

interface StarryBackgroundProps {
  count?: number;
  rmax?: number;
}

export default function StarryBackground({
  count = 240,
  rmax = 2.5,
}: StarryBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let stars: Star[] = [];
    let shootingStar: ShootingStar | null = null;
    let shootingStarTimer = 0;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = Array.from({ length: count }, () =>
        makeStar(canvas.width, canvas.height, rmax)
      );
    };

    const draw = (ts: number) => {
      const dt = Math.min(ts - lastTime, 100);
      lastTime = ts;

      // Deep space cosmic ocean background gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#020617");    // Deep Void Dark
      grad.addColorStop(0.3, "#090D16");  // Midnight Ocean
      grad.addColorStop(0.65, "#0F172A"); // Rich Slate Midnight
      grad.addColorStop(1, "#1E1B4B");    // Deep Cosmic Indigo Glow
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Ambient radial nebula glows
      const nebulaGrad = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.3, 20,
        canvas.width * 0.7, canvas.height * 0.3, canvas.width * 0.5
      );
      nebulaGrad.addColorStop(0, "rgba(99, 102, 241, 0.12)");
      nebulaGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.06)");
      nebulaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = nebulaGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render stars with soft halo glow for bright stars
      for (const s of stars) {
        updateStar(s, dt);
        if (s.alpha <= 0) continue;

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${Math.floor(s.alpha * 255).toString(16).padStart(2, '0')}`;
        
        if (s.r > 1.8 && s.alpha > 0.6) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = s.color;
        }
        
        ctx.fill();
        ctx.restore();
      }

      // Handle shooting stars
      shootingStarTimer += dt;
      if (!shootingStar && shootingStarTimer > 3500) {
        if (Math.random() < 0.6) {
          shootingStar = createShootingStar(canvas.width, canvas.height);
        }
        shootingStarTimer = 0;
      }

      if (shootingStar && shootingStar.active) {
        shootingStar.x += shootingStar.dx;
        shootingStar.y += shootingStar.dy;
        shootingStar.alpha -= 0.015;

        if (
          shootingStar.alpha <= 0 ||
          shootingStar.x > canvas.width ||
          shootingStar.y > canvas.height
        ) {
          shootingStar = null;
        } else {
          ctx.save();
          const headX = shootingStar.x;
          const headY = shootingStar.y;
          const tailX = headX - shootingStar.dx * 6;
          const tailY = headY - shootingStar.dy * 6;

          const meteorGrad = ctx.createLinearGradient(tailX, tailY, headX, headY);
          meteorGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
          meteorGrad.addColorStop(0.7, `rgba(147, 197, 253, ${shootingStar.alpha * 0.6})`);
          meteorGrad.addColorStop(1, `rgba(255, 255, 255, ${shootingStar.alpha})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(headX, headY);
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = meteorGrad;
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#93C5FD";
          ctx.stroke();
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    const onResize = () => init();
    window.addEventListener("resize", onResize);

    init();
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, [count, rmax]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        display: "block",
      }}
    />
  );
}

