"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  rotationIntensity?: number;
  glareOpacity?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  rotationIntensity = 15,
  glareOpacity = 0.15,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const mouseXSpring = useSpring(x, { stiffness: 400, damping: 40 });
  const mouseYSpring = useSpring(y, { stiffness: 400, damping: 40 });

  const rotateX = useTransform(mouseYSpring, [0, 1], [rotationIntensity, -rotationIntensity]);
  const rotateY = useTransform(mouseXSpring, [0, 1], [-rotationIntensity, rotationIntensity]);

  // Dynamic glare based on mouse position
  const background = useMotionTemplate`radial-gradient(circle at ${useTransform(mouseXSpring, [0, 1], [0, 100])}% ${useTransform(mouseYSpring, [0, 1], [0, 100])}%, rgba(255, 255, 255, ${glareOpacity}), transparent 70%)`;

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        transformStyle: "preserve-3d",
      }}
      className={`relative perspective-1000 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div 
        style={{ transform: "translateZ(40px)" }} 
        className="w-full h-full relative"
      >
        {children}
        {/* Glare Overlay */}
        <motion.div
          className="absolute inset-0 z-50 pointer-events-none transition-opacity duration-300 rounded-[inherit]"
          style={{
            background: background,
            opacity: isHovered ? 1 : 0,
          }}
        />
      </div>
    </motion.div>
  );
};
