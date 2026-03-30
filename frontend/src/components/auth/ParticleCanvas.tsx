'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseY: number;
  vy: number;
  radius: number;
  opacity: number;
  phase: number;
  amplitude: number;
  frequency: number;
  speed: number;
}

function createParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    baseY: Math.random() * height,
    vy: (Math.random() - 0.5) * 0.1,
    radius: Math.random() * 2 + 1,
    opacity: Math.random() * 0.5 + 0.3,
    phase: Math.random() * Math.PI * 2,
    amplitude: Math.random() * 30 + 10,
    frequency: Math.random() * 0.0015 + 0.0005,
    speed: Math.random() * 0.3 + 0.1,
  };
}

function getParticleCount(width: number): number {
  return width <= 768 ? 60 : 150;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let particles: Particle[] = [];
    let animationId: number;
    let resizeTimer: ReturnType<typeof setTimeout>;

    function initParticles() {
      particles = Array.from({ length: getParticleCount(canvas!.width) }, () =>
        createParticle(canvas!.width, canvas!.height)
      );
    }

    function resizeCanvas() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
      const target = getParticleCount(canvas!.width);
      if (particles.length > target) {
        particles = particles.slice(0, target);
      } else {
        while (particles.length < target) {
          particles.push(createParticle(canvas!.width, canvas!.height));
        }
      }
    }

    function drawStatic() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) {
        const gradient = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(0, 255, 204, ${p.opacity})`);
        gradient.addColorStop(1, 'rgba(0, 255, 204, 0)');
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = gradient;
        ctx!.fill();
      }
    }

    function loop(t: number) {
      if (prefersReducedMotion.matches) {
        drawStatic();
        return;
      }

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const threshold = canvas!.width <= 768 ? 80 : 120;
      const thresholdSq = threshold * threshold;

      // Update particles
      for (const p of particles) {
        p.y =
          p.baseY +
          Math.sin(t * p.frequency + p.phase) * p.amplitude +
          Math.sin(t * p.frequency * 1.7 + p.phase * 0.5) * (p.amplitude * 0.3);

        p.x += p.speed;
        if (p.x > canvas!.width + 10) p.x = -10;

        p.baseY += p.vy;
        if (p.baseY < 0 || p.baseY > canvas!.height) p.vy *= -1;
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < thresholdSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / threshold) * 0.4;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.strokeStyle = `rgba(0, 255, 204, ${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        const gradient = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(0, 255, 204, ${p.opacity})`);
        gradient.addColorStop(1, 'rgba(0, 255, 204, 0)');
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = gradient;
        ctx!.fill();
      }

      animationId = requestAnimationFrame(loop);
    }

    function handleReducedMotionChange() {
      if (!prefersReducedMotion.matches) {
        animationId = requestAnimationFrame(loop);
      }
    }

    function handleResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
      }, 150);
    }

    resizeCanvas();
    initParticles();

    if (prefersReducedMotion.matches) {
      drawStatic();
    } else {
      animationId = requestAnimationFrame(loop);
    }

    prefersReducedMotion.addEventListener('change', handleReducedMotionChange);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(resizeTimer);
      prefersReducedMotion.removeEventListener('change', handleReducedMotionChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="auth-canvas" />;
}
