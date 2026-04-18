import React, { useState, useEffect, useRef } from 'react';
import AppButton from '../components/AppButton';
import Modal from '../components/Modal';
import { Input } from '../components/Field';
import { api } from '../api/request';
import { Sparkles, ArrowRight, Users, CheckCircle, Zap, Eye, EyeOff } from 'lucide-react';
import RotatingCrystal from '../components/RotatingCrystal';

const WelcomePage = ({ onEnter }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // 登录表单：改成用户ID
  const [loginForm, setLoginForm] = useState({ userId: '1' });
  const [loginLoading, setLoginLoading] = useState(false);

  // 注册表单：改成用户名 + 角色
  const [registerForm, setRegisterForm] = useState({ username: '', role: '队员' });
  const [registerLoading, setRegisterLoading] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles = [];
    const particleCount = 150;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 3.5 + 1.5,
          speedX: (Math.random() - 0.5) * 0.35,
          speedY: (Math.random() - 0.5) * 0.35,
          opacity: Math.random() * 0.6 + 0.4,
          color: Math.random() > 0.5 ? '0, 255, 255' : '139, 92, 246',
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.3;
            const color1 = particles[i].color;
            const color2 = particles[j].color;
            const lineColor = color1 === color2 ? color1 : '180, 180, 255';
            ctx.strokeStyle = `rgba(${lineColor}, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.5);
        gradient.addColorStop(0, `rgba(${p.color}, ${p.opacity})`);
        gradient.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.shadowColor = `rgba(${p.color}, 0.9)`;
        ctx.shadowBlur = 22;
        ctx.fill();

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) { p.x = 0; p.speedX *= -0.95; }
        if (p.x > width) { p.x = width; p.speedX *= -0.95; }
        if (p.y < 0) { p.y = 0; p.speedY *= -0.95; }
        if (p.y > height) { p.y = height; p.speedY *= -0.95; }

        if (Math.random() < 0.05) {
          p.speedX += (Math.random() - 0.5) * 0.06;
          p.speedY += (Math.random() - 0.5) * 0.06;
          const maxSpeed = 0.5;
          p.speedX = Math.min(maxSpeed, Math.max(-maxSpeed, p.speedX));
          p.speedY = Math.min(maxSpeed, Math.max(-maxSpeed, p.speedY));
        }
      });

      ctx.shadowBlur = 0;
      requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    const animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.userId) return;

    setLoginLoading(true);
    try {
      const user = await api.loginByUserId(loginForm.userId);
      onEnter(user);
      setShowLoginModal(false);
    } catch (error) {
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, role } = registerForm;

    if (!username || !role) return;

    setRegisterLoading(true);
    try {
      const createdUser = await api.register(username, role);
      onEnter(createdUser);
      setShowRegisterModal(false);
    } catch (error) {
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-20 -left-40 w-[800px] h-[800px] bg-cyan-500/40 rounded-full blur-[180px] animate-float-slow" style={{ mixBlendMode: 'screen' }} />
        <div className="absolute -bottom-20 -right-40 w-[800px] h-[800px] bg-fuchsia-500/40 rounded-full blur-[180px] animate-float-slow-reverse" style={{ mixBlendMode: 'screen' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-purple-600/30 rounded-full blur-[200px] animate-pulse-slow" style={{ mixBlendMode: 'screen' }} />
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 z-[5] w-full h-full pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-16 flex flex-col items-center text-center min-h-screen justify-center">
        <div className="w-full h-64 md:h-80 mb-4 -mt-8">
          <RotatingCrystal />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 backdrop-blur-sm mb-6">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-cyan-300">我去你的</span>
          <Sparkles className="w-4 h-4 text-fuchsia-400" />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
          <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
            重塑团队协作
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            从学赛通开始
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10">
          统一项目、任务、成员管理。
          <br className="hidden md:block" />
          让每一步都清晰可控，让团队效率飞跃。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <AppButton
            size="lg"
            onClick={() => setShowLoginModal(true)}
            className="min-w-[180px]"
            style={{ background: 'linear-gradient(135deg, #00ffff 0%, #8b5cf6 100%)' }}
          >
            <span>登录</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </AppButton>
          <AppButton
            size="lg"
            variant="secondary"
            onClick={() => setShowRegisterModal(true)}
            className="min-w-[180px]"
          >
            注册
          </AppButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <div className="glass-panel p-6 text-left">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/30 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-cyan-300" />
            </div>
            <h3 className="font-semibold text-white mb-2">成员协作</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              清晰的角色分工，实时同步任务状态，让每个人都知道自己该做什么。
            </p>
          </div>

          <div className="glass-panel p-6 text-left">
            <div className="w-10 h-10 rounded-lg bg-fuchsia-500/30 flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-fuchsia-300" />
            </div>
            <h3 className="font-semibold text-white mb-2">任务追踪</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              看板式任务管理，从待办到完成一目了然，进度尽在掌握。
            </p>
          </div>

          <div className="glass-panel p-6 text-left">
            <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-purple-300" />
            </div>
            <h3 className="font-semibold text-white mb-2">数据洞察</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              项目指标实时更新，关键数据一目了然，驱动团队高效决策。
            </p>
          </div>
        </div>
      </div>

      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} title="演示登录" size="sm">
        <form onSubmit={handleLogin}>
          <Input
            label="用户 ID"
            placeholder="请输入已有用户 ID，例如 1"
            value={loginForm.userId}
            onChange={(e) => setLoginForm({ userId: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 mt-6">
            <AppButton type="button" variant="secondary" onClick={() => setShowLoginModal(false)}>
              取消
            </AppButton>
            <AppButton type="submit" isLoading={loginLoading}>
              进入系统
            </AppButton>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            当前后端未提供账号密码认证，这里使用已有用户 ID 演示进入
          </p>
        </form>
      </Modal>

      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)} title="注册新账户" size="sm">
        <form onSubmit={handleRegister}>
          <Input
            label="用户名"
            placeholder="请输入用户名"
            value={registerForm.username}
            onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
            required
          />
          <Input
            label="角色"
            placeholder="例如：队员 / 前端开发"
            value={registerForm.role}
            onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
            required
          />
          <div className="flex justify-end gap-3 mt-6">
            <AppButton type="button" variant="secondary" onClick={() => setShowRegisterModal(false)}>
              取消
            </AppButton>
            <AppButton type="submit" isLoading={registerLoading}>
              注册并进入
            </AppButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WelcomePage;