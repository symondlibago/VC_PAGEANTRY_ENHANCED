import React, { useState, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../hooks/useAuth';
import '../App.css';
import vcLogo from '../assets/vclogo.jpg';
import panagbangiLogo from '../assets/panagbangi_logo.jpg';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  const { login, isAuthenticated, user } = useAuth();
  const location = useLocation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor(x, y, isExplosion = false, isConfetti = false, color = "#ffd700") {
        this.x = x;
        this.y = y;
        this.isExplosion = isExplosion;
        this.isConfetti = isConfetti;
        this.size = isExplosion ? Math.random() * 3 + 1 : Math.random() * 5 + 2;
        
        if (isExplosion) {
          const angle = Math.random() * Math.PI * 2;
          const force = Math.random() * 6 + 2;
          this.speedX = Math.cos(angle) * force;
          this.speedY = Math.sin(angle) * force;
          this.gravity = 0.15;
        } else if (isConfetti) {
          // Launch upward from corners
          this.speedX = x < canvas.width / 2 ? Math.random() * 3 + 2 : (Math.random() * 3 + 2) * -1;
          this.speedY = (Math.random() * 10 + 10) * -1;
          this.gravity = 0.2;
        } else {
          // Standard falling
          this.speedY = Math.random() * 2 + 1;
          this.speedX = (Math.random() - 0.5) * 1;
          this.gravity = 0;
        }

        this.life = 1;
        this.decay = isExplosion ? Math.random() * 0.02 + 0.01 : 0;
        this.shape = Math.floor(Math.random() * 3);
        this.rotation = Math.random() * Math.PI * 2;
        this.color = color;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.isExplosion ? 10 : 5;
        ctx.shadowColor = this.color;

        if (this.shape === 0) {
          ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI * 2); ctx.fill();
        } else if (this.shape === 1) {
          ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        } else {
          ctx.beginPath();
          for(let i=0; i<5; i++){
            ctx.lineTo(Math.cos((18+i*72)*Math.PI/180)*this.size, Math.sin((18+i*72)*Math.PI/180)*this.size);
            ctx.lineTo(Math.cos((54+i*72)*Math.PI/180)*(this.size/2), Math.sin((54+i*72)*Math.PI/180)*(this.size/2));
          }
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.rotation += 0.05;

        if (this.isExplosion) {
          this.life -= this.decay;
        } else if (this.isConfetti) {
          // Explode at the peak of the jump
          if (this.speedY >= -1) {
            this.explode();
            return false;
          }
        } else {
          // Random mid-air pop for falling stars
          if (Math.random() < 0.005) {
            this.explode();
            return false;
          }
        }
        return this.life > 0 && this.y < canvas.height + 20 && this.x > -20 && this.x < canvas.width + 20;
      }

      explode() {
        const colors = ["#ffd700", "#ffffff", "#ff4d4d", "#0080ff"];
        for (let i = 0; i < 15; i++) {
          particles.push(new Particle(this.x, this.y, true, false, colors[Math.floor(Math.random() * colors.length)]));
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 1. Regular falling shapes
      if (particles.filter(p => !p.isExplosion && !p.isConfetti).length < 120) {
        for (let i = 0; i < 2; i++) {
          particles.push(new Particle(Math.random() * canvas.width, -20));
        }
      }
      

      // 2. Corner Launchers (Confetti)
      if (Math.random() < 0.08) {
        for (let i = 0; i < 2; i++) {
          particles.push(new Particle(0, canvas.height, false, true));
          particles.push(new Particle(canvas.width, canvas.height, false, true));
        }
      }
      

      particles = particles.filter(p => {
        const active = p.update();
        if (active) p.draw();
        return active;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || (user?.role === 'admin' ? '/admin' : '/judge');
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    const result = await login(data);
    if (!result.success) setError(result.error);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-rose-900 relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      <div className="w-full max-w-md animate-fade-in-scale relative z-10 px-4">
        <Card className="glass-morphism-card border-white/10 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto flex items-center justify-center space-x-4">
              <img src={vcLogo} alt="VC" className="w-16 h-16 rounded-full border-2 border-white/20 object-cover shadow-lg" />
              <img src={panagbangiLogo} alt="Panagbangi" className="w-16 h-16 rounded-full border-2 border-white/20 object-cover shadow-lg" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-white">Mr. and Ms. Vineyard 2026</CardTitle>
              <CardTitle className="text-sm font-medium text-blue-200">Vineyard International Polytechnic College</CardTitle>
              <CardDescription className="text-gray-300">Pageantry System</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-500 text-white">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Email Address</Label>
                <Input type="email" placeholder="admin@pageant.com" className="bg-white/10 border-white/20 text-white placeholder:text-gray-400" {...register('email')} />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-white">Password</Label>
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="bg-white/10 border-white/20 text-white pr-10" {...register('password')} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-lg transition-transform active:scale-95" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'SIGN IN'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;