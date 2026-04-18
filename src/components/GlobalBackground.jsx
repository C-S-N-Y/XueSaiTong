import React, { useEffect, useRef } from 'react';

const GlobalBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth, height = window.innerHeight, particles = [];
    const particleCount = 50;
    const resize = () => {
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width; canvas.height = height;
      initParticles();
    };
    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width, y: Math.random() * height, radius: Math.random() * 2.5 + 1,
          speedX: (Math.random() - 0.5) * 0.12, speedY: (Math.random() - 0.5) * 0.12,
          opacity: Math.random() * 0.4 + 0.3, color: Math.random() > 0.5 ? '0, 255, 255' : '139, 92, 246',
        });
      }
    };
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`; ctx.shadowBlur = 15; ctx.fill();
        p.x += p.speedX; p.y += p.speedY;
        if (p.x < 0 || p.x > width) p.speedX *= -1;
        if (p.y < 0 || p.y > height) p.speedY *= -1;
      });
      ctx.shadowBlur = 0;
      requestAnimationFrame(draw);
    };
    window.addEventListener('resize', resize); resize();
    const animationId = requestAnimationFrame(draw);
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationId); };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-20 -left-40 w-[800px] h-[800px] bg-cyan-500/35 rounded-full blur-[180px] animate-float-slow" style={{ mixBlendMode: 'screen' }} />
      <div className="absolute -bottom-20 -right-40 w-[800px] h-[800px] bg-fuchsia-500/30 rounded-full blur-[180px] animate-float-slow-reverse" style={{ mixBlendMode: 'screen' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-purple-600/25 rounded-full blur-[200px] animate-pulse-slow" style={{ mixBlendMode: 'screen' }} />
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.3) 2px, rgba(0, 255, 255, 0.3) 4px)`, backgroundSize: '100% 6px', animation: 'scan 8s linear infinite' }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, animation: 'glitch 0.3s infinite' }} />
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ffff' fill-opacity='0.2'%3E%3Cpath d='M50 50v-8h-4v8h-8v4h8v8h4v-8h8v-4h-8zm0-40V2h-4v8h-8v4h8v8h4v-8h8V10h-8zM10 50v-8H6v8H2v4h4v8h4v-8h8v-4h-8zM10 10V2H6v8H2v4h4v8h4v-8h8v-4h-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '120px 120px', animation: 'grid-flow 20s linear infinite' }} />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};

export default GlobalBackground;