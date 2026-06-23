"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface StarsBackgroundProps {
  starDensity?: number;
}

export function StarsBackground({ starDensity = 0.00015 }: StarsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; radius: number; opacity: number; speed: number; color: string }[] = [];

    const isDark =
      theme === "dark" || (theme === "system" && systemTheme === "dark");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor(canvas.width * canvas.height * starDensity);
      
      // Titanium & Ember palettes
      const darkColors = ["255, 255, 255", "245, 158, 11", "234, 88, 12"]; // white, amber-500, orange-600
      const lightColors = ["217, 119, 6", "194, 65, 12", "148, 163, 184"]; // amber-600, orange-700, slate-400
      const palette = isDark ? darkColors : lightColors;

      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.0 + 0.1, // subtle size
          opacity: Math.random(),
          speed: Math.random() * 0.015 + 0.005,
          color: palette[Math.floor(Math.random() * palette.length)]
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((star) => {
        star.opacity += star.speed;
        if (star.opacity > 1 || star.opacity < 0) {
          star.speed = -star.speed;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${Math.max(0, Math.min(1, star.opacity))})`;
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [starDensity, theme, systemTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
