'use client';

import { useRef, useState, ReactNode } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ParallaxSectionProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxSection({ children, speed = 0.5, className = '' }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);
  
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="relative z-10">
        {children}
      </motion.div>
    </div>
  );
}

interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  direction?: 'up' | 'down';
}

export function ParallaxLayer({ children, speed = 0.3, className = '', direction = 'up' }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'up' ? [0, speed * 100] : [speed * 100, 0]
  );
  
  return (
    <motion.div ref={ref} style={{ y }} className={`absolute inset-0 ${className}`}>
      {children}
    </motion.div>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  floatSpeed?: number;
  floatDistance?: number;
  delay?: number;
}

export function FloatingElement({ 
  children, 
  className = '', 
  floatSpeed = 5, 
  floatDistance = 20,
  delay = 0 
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -floatDistance, 0],
      }}
      transition={{
        duration: floatSpeed,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
}

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
}

export function ScrollReveal({ 
  children, 
  className = '', 
  direction = 'up',
  delay = 0,
  duration = 0.6 
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['0.8 1', '0.2 1']
  });
  
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1] as number[]);
  const x = useTransform(scrollYProgress, [0, 1], 
    direction === 'left' ? [100, 0] as number[] : 
    direction === 'right' ? [-100, 0] as number[] : [0, 0] as number[]
  );
  const y = useTransform(scrollYProgress, [0, 1], 
    direction === 'up' ? [50, 0] as number[] : 
    direction === 'down' ? [-50, 0] as number[] : [0, 0] as number[]
  );
  
  return (
    <motion.div 
      ref={ref} 
      style={{ opacity, x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-aviation-600 via-cyan-400 to-aviation-600"
      style={{ scaleX }}
    />
  );
}

interface ParallaxBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function ParallaxBackground({ children, className = '' }: ParallaxBackgroundProps) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white ${className}`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 h-full w-full" 
          style={{
            background: 'radial-gradient(ellipse at 20% 30%, rgba(37, 99, 235, 0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(6, 182, 212, 0.03) 0%, transparent 50%)'
          }}
        />
      </div>
      <ParallaxLayer speed={0.15} className="pointer-events-none">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-aviation-500/5 blur-3xl" />
      </ParallaxLayer>
      <ParallaxLayer speed={0.1} direction="down" className="pointer-events-none">
        <div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-cyan-400/5 blur-3xl" />
      </ParallaxLayer>
      <ParallaxLayer speed={0.2} className="pointer-events-none">
        <div className="absolute left-1/3 top-60 h-40 w-40 rounded-full bg-aviation-600/5 blur-2xl" />
      </ParallaxLayer>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface StaggerRevealProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function StaggerReveal({ children, className = '', staggerDelay = 0.1 }: StaggerRevealProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ 
            duration: 0.6, 
            delay: index * staggerDelay,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  perspective?: number;
}

export function TiltCard({ children, className = '', perspective = 1000 }: TiltCardProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    setRotateY((x - centerX) / 20);
    setRotateX((centerY - y) / 20);
  };
  
  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };
  
  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        perspective,
        transformStyle: "preserve-3d"
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MagneticButton({ children, className = '', onClick }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };
  
  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };
  
  return (
    <motion.button
      ref={ref}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
    >
      {children}
    </motion.button>
  );
}

export function HeroParallax() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  
  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, scale }}
      className="absolute inset-0 z-0"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-aviation-900/5 via-transparent to-transparent" />
      <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-aviation-600/10 blur-3xl" />
    </motion.div>
  );
}
