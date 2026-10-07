import React, { useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function AmbientCanvas() {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const { accentGlowColor, canvasParticlesEnabled, activeTheme } = useTheme();

  // Synchronously measure parent canvas container on layout changes (useLayoutEffect)
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  const drawParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (!canvasParticlesEnabled || activeTheme === 'light-hologram') return;

    // Generate/update particles
    const count = 35;
    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: (Math.sin(i * 99 + Date.now() * 0.0003) * 0.5 + 0.5) * width,
        y: (Math.cos(i * 47 + Date.now() * 0.0002) * 0.5 + 0.5) * height,
        radius: Math.sin(i + Date.now() * 0.001) * 1.5 + 2,
        alpha: Math.sin(i * 12 + Date.now() * 0.0008) * 0.3 + 0.4,
      });
    }

    // Connect close particles with cyber laser lines
    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      
      // Draw particle circle with accent glow
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
      ctx.fillStyle = accentGlowColor;
      ctx.globalAlpha = p1.alpha;
      ctx.shadowBlur = 10;
      ctx.shadowColor = accentGlowColor;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        if (dist < 140) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = accentGlowColor;
          ctx.globalAlpha = (1 - dist / 140) * 0.18;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
  }, [accentGlowColor, canvasParticlesEnabled, activeTheme]);

  // Animation loop effect (useEffect)
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);

    const animate = () => {
      drawParticles();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawParticles]);

  if (!canvasParticlesEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60 transition-opacity duration-700"
    />
  );
}
