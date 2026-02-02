import React, { useEffect, useRef } from 'react';

const SparkleCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor(x, y, type = 'falling', color = "#ffd700") {
        this.x = x;
        this.y = y;
        this.type = type; // 'falling', 'rocket', 'explosion'
        this.color = color;
        
        // Randomize shapes: 0: Circle, 1: Square, 2: Triangle, 3: Star
        this.shape = Math.floor(Math.random() * 4);
        this.size = Math.random() * 4 + 2;
        this.life = 1;
        this.decay = Math.random() * 0.015 + 0.01;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;

        if (type === 'rocket') {
          // Shoot upward from corners toward the middle
          this.speedX = x < canvas.width / 2 ? Math.random() * 5 + 2 : (Math.random() * 5 + 2) * -1;
          this.speedY = (Math.random() * 15 + 10) * -1;
          this.gravity = 0.2;
        } else if (type === 'explosion') {
          const angle = Math.random() * Math.PI * 2;
          const force = Math.random() * 6 + 1;
          this.speedX = Math.cos(angle) * force;
          this.speedY = Math.sin(angle) * force;
          this.gravity = 0.15;
        } else {
          // Standard heavy rainfall of sparks
          this.speedX = (Math.random() - 0.5) * 3;
          this.speedY = Math.random() * 3 + 2;
          this.gravity = 0;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.type === 'explosion' ? 12 : 6;
        ctx.shadowColor = this.color;

        if (this.shape === 0) { // Circle
          ctx.beginPath(); ctx.arc(0, 0, this.size, 0, Math.PI * 2); ctx.fill();
        } else if (this.shape === 1) { // Square
          ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
        } else if (this.shape === 2) { // Triangle
          ctx.beginPath();
          ctx.moveTo(0, -this.size);
          ctx.lineTo(this.size, this.size);
          ctx.lineTo(-this.size, this.size);
          ctx.closePath(); ctx.fill();
        } else { // Star
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
        this.speedY += this.gravity || 0;
        this.rotation += this.rotationSpeed;

        if (this.type === 'rocket' && this.speedY >= -1) {
          this.explode();
          return false;
        }

        if (this.type === 'explosion') {
          this.life -= this.decay;
        }

        return this.life > 0 && this.y < canvas.height + 50 && this.x > -50 && this.x < canvas.width + 50;
      }

      explode() {
        const colors = ["#ffd700", "#ffffff", "#ff4d4d", "#00d4ff", "#ff00e1"];
        for (let i = 0; i < 60; i++) {
          particles.push(new Particle(this.x, this.y, 'explosion', colors[Math.floor(Math.random() * colors.length)]));
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 1. INCREASED DENSITY: Add falling shapes more aggressively
      if (particles.filter(p => p.type === 'falling').length < 400) {
        for (let i = 0; i < 3; i++) {
          particles.push(new Particle(Math.random() * canvas.width, -20, 'falling'));
        }
      }
      

      // 2. EDGE ROCKETS: High-frequency launchers from the sides
      for (let i = 0; i < 3; i++) {
        particles.push(new Particle(0, canvas.height, 'rocket', "#ffd700"));
        particles.push(new Particle(canvas.width, canvas.height, 'rocket', "#ffd700"));
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

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ filter: 'contrast(1.2) brightness(1.2)' }}
    />
  );
};

export default SparkleCanvas;