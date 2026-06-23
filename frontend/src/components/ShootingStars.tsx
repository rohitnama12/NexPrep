"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
  delay: number;
}

export function ShootingStars() {
  const [stars, setStars] = useState<ShootingStar[]>([]);
  const { theme, systemTheme } = useTheme();
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const spawnStar = () => {
      setStars((prevStars) => {
        if (prevStars.length > 5) return prevStars;

        const newStar: ShootingStar = {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: Math.random() * (window.innerHeight / 2),
          angle: 35 + Math.random() * 15,
          scale: Math.random() * 0.6 + 0.4,
          speed: Math.random() * 0.6 + 0.8,
          distance: Math.random() * 500 + 300,
          delay: Math.random() * 0.5,
        };
        return [...prevStars, newStar];
      });

      // Schedule the next star in 1 to 2 seconds
      timeoutId = setTimeout(spawnStar, 1000 + Math.random() * 1000);
    };

    spawnStar();

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (stars.length === 0) return;
    const cleanup = setTimeout(() => {
      setStars((prev) => prev.slice(1));
    }, 5000);
    return () => clearTimeout(cleanup);
  }, [stars]);

  const isDark =
    theme === "dark" || (theme === "system" && systemTheme === "dark");

  // Titanium & Ember trailing effect
  const gradientStart = isDark ? "rgba(245, 158, 11, 0.8)" : "rgba(217, 119, 6, 0.8)"; // amber-500 / amber-600
  const gradientEnd = isDark ? "rgba(245, 158, 11, 0)" : "rgba(217, 119, 6, 0)";
  const starColor = isDark ? "#fbbf24" : "#d97706"; // amber-400 / amber-600

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{
            opacity: 0,
            x: star.x,
            y: star.y,
            scale: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            x: star.x + star.distance * Math.cos((star.angle * Math.PI) / 180),
            y: star.y + star.distance * Math.sin((star.angle * Math.PI) / 180),
            scale: [0, star.scale, 0],
          }}
          transition={{
            duration: star.speed * 2.5,
            ease: "linear",
            delay: star.delay,
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "180px",
            height: "2px",
            background: `linear-gradient(90deg, ${gradientEnd} 0%, ${gradientStart} 100%)`,
            transformOrigin: "right",
            rotate: `${star.angle}deg`,
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: "3px",
              height: "3px",
              borderRadius: "50%",
              backgroundColor: starColor,
              boxShadow: isDark 
                ? `0 0 8px 1px ${starColor}`
                : `0 0 4px 1px ${starColor}`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}
