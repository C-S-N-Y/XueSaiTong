import React, { useState, useEffect, useRef } from 'react';
import AppButton from '../components/AppButton';
import Modal from '../components/Modal';
import { Input } from '../components/Field';
import { api } from '../api/request';
import { runAction } from '../utils/helpers';
import { Sparkles, ArrowRight, Users, CheckCircle, Zap, Eye, EyeOff } from 'lucide-react';
import RotatingCrystal from '../components/RotatingCrystal';

const WelcomePage = ({ onEnter }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  // 登录表单
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  
  // 注册表单
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', confirmPassword: '', name: '' });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  
  const canvasRef = useRef(null);

  // 粒子动画（保持不变）
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

  // 处理登录
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      return;
    }
    setLoginLoading(true);
    try {
      const result = await api.login(loginForm.username, loginForm.password);
      onEnter(result.user);
    } catch (error) {
      // 错误已在 request 层通过 toast 提示
    } finally {
      setLoginLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, password, confirmPassword, name } = registerForm;
    
    if (!username || !password || !confirmPassword) {
      return;
    }
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致');
      return;
    }
    if (password.length < 6) {
      alert('密码长度至少 6 位');
      return;
    }
    
    setRegisterLoading(true);
    try {
      const result = await api.register(username, password, name || username);
      onEnter(result.user);
    } catch (error) {
      // 错误已提示
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* 背景特效（与之前相同） */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-20 -left-40 w-[800px] h-[800px] bg-cyan-500/40 rounded-full blur-[180px] animate-float-slow" style={{ mixBlendMode: 'screen' }} />
        <div className="absolute -bottom-20 -right-40 w-[800px] h-[800px] bg-fuchsia-500/40 rounded-full blur-[180px] animate-float-slow-reverse" style={{ mixBlendMode: 'screen' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-purple-600/30 rounded-full blur-[200px] animate-pulse-slow" style={{ mixBlendMode: 'screen' }} />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.3) 2px, rgba(0, 255, 255, 0.3) 4px)`, backgroundSize: '100% 6px', animation: 'scan 8s linear infinite' }} />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`, animation: 'glitch 0.3s infinite' }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ffff' fill-opacity='0.2'%3E%3Cpath d='M50 50v-8h-4v8h-8v4h8v8h4v-8h8v-4h-8zm0-40V2h-4v8h-8v4h8v8h4v-8h8V10h-8zM10 50v-8H6v8H2v4h4v8h4v-8h8v-4h-8zM10 10V2H6v8H2v4h4v8h4v-8h8v-4h-8z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`, backgroundSize: '120px 120px', animation: 'grid-flow 20s linear infinite' }} />
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 z-[5] w-full h-full pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 md:py-16 flex flex-col items-center text-center min-h-screen justify-center">
        <div className="w-full h-64 md:h-80 mb-4 -mt-8">
          <RotatingCrystal />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/50 backdrop-blur-sm mb-6 animate-in fade-in slide-in-from-top-4 duration-700"
             style={{ boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)' }}>
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-cyan-300">AI 驱动的智能协作平台</span>
          <Sparkles className="w-4 h-4 text-fuchsia-400" />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent"
                style={{ textShadow: '0 0 30px rgba(0, 255, 255, 0.5)' }}>
            重塑团队协作
          </span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent"
                style={{ textShadow: '0 0 40px rgba(0, 255, 255, 0.7)' }}>
            从学赛通开始
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
           style={{ textShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
          统一项目、任务、成员管理。实时洞察项目动态，
          <br className="hidden md:block" />
          让每一步都清晰可控，让团队效率飞跃。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <AppButton
            size="lg"
            onClick={() => setShowLoginModal(true)}
            className="min-w-[180px] shadow-[0_0_30px_rgba(0,255,255,0.5)] hover:shadow-[0_0_50px_rgba(0,255,255,0.8)] border border-cyan-400/50"
            style={{ background: 'linear-gradient(135deg, #00ffff 0%, #8b5cf6 100%)' }}
          >
            <span>登录</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </AppButton>
          <AppButton
            size="lg"
            variant="secondary"
            onClick={() => setShowRegisterModal(true)}
            className="min-w-[180px] backdrop-blur-sm border border-fuchsia-400/50 shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:shadow-[0_0_40px_rgba(139,92,246,0.8)]"
          >
            注册
          </AppButton>
        </div>

        {/* 特性卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="glass-panel p-6 text-left group hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1"
               style={{ backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 255, 255, 0.2)' }}>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/30 flex items-center justify-center mb-4 group-hover:bg-cyan-500/50 transition-colors"
                 style={{ boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)' }}>
              <Users className="w-5 h-5 text-cyan-300" />
            </div>
            <h3 className="font-semibold text-white mb-2">成员协作</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              清晰的角色分工，实时同步任务状态，让每个人都知道自己该做什么。
            </p>
          </div>

          <div className="glass-panel p-6 text-left group hover:border-fuchsia-400/50 transition-all duration-300 hover:-translate-y-1"
               style={{ backdropFilter: 'blur(12px)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div className="w-10 h-10 rounded-lg bg-fuchsia-500/30 flex items-center justify-center mb-4 group-hover:bg-fuchsia-500/50 transition-colors"
                 style={{ boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)' }}>
              <CheckCircle className="w-5 h-5 text-fuchsia-300" />
            </div>
            <h3 className="font-semibold text-white mb-2">任务追踪</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              看板式任务管理，从待办到完成一目了然，进度尽在掌握。
            </p>
          </div>

          <div className="glass-panel p-6 text-left group hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1"
               style={{ backdropFilter: 'blur(12px)', border: '1px solid rgba(0, 255, 255, 0.2)' }}>
            <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center mb-4 group-hover:bg-purple-500/50 transition-colors"
                 style={{ boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)' }}>
              <Sparkles className="w-5 h-5 text-purple-300" />
            </div>
            <h3 className="font-semibold text-white mb-2">数据洞察</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              项目指标实时更新，关键数据一目了然，驱动团队高效决策。
            </p>
          </div>
        </div>
      </div>

      {/* 登录弹窗 */}
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} title="登录" size="sm">
        <form onSubmit={handleLogin}>
          <Input
            label="用户名"
            placeholder="请输入用户名"
            value={loginForm.username}
            onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
            required
          />
          <div className="relative">
            <Input
              label="密码"
              type={showPassword ? 'text' : 'password'}
              placeholder="请输入密码"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <AppButton type="button" variant="secondary" onClick={() => setShowLoginModal(false)}>
              取消
            </AppButton>
            <AppButton type="submit" isLoading={loginLoading}>
              登录
            </AppButton>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            默认账号: admin / 123456
          </p>
        </form>
      </Modal>

      {/* 注册弹窗 */}
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
            label="昵称（可选）"
            placeholder="请输入昵称"
            value={registerForm.name}
            onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
          />
          <div className="relative">
            <Input
              label="密码"
              type={showRegPassword ? 'text' : 'password'}
              placeholder="至少6位"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-white"
              onClick={() => setShowRegPassword(!showRegPassword)}
            >
              {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input
              label="确认密码"
              type={showRegConfirm ? 'text' : 'password'}
              placeholder="再次输入密码"
              value={registerForm.confirmPassword}
              onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-white"
              onClick={() => setShowRegConfirm(!showRegConfirm)}
            >
              {showRegConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <AppButton type="button" variant="secondary" onClick={() => setShowRegisterModal(false)}>
              取消
            </AppButton>
            <AppButton type="submit" isLoading={registerLoading}>
              注册
            </AppButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WelcomePage;