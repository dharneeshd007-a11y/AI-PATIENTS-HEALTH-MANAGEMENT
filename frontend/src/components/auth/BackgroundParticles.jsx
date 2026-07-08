import React from 'react';
import { motion } from 'framer-motion';

const BackgroundParticles = () => {
  // Generate random particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 6 + 2, // 2px to 8px
    x: Math.random() * 100, // 0% to 100%
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10, // 10s to 30s
    delay: Math.random() * 5,
  }));

  const circles = [
    { id: 1, size: 400, x: -10, y: -10, color: 'bg-blue-600/10' },
    { id: 2, size: 500, x: 70, y: 60, color: 'bg-cyan-500/10' },
    { id: 3, size: 300, x: 40, y: 80, color: 'bg-blue-400/10' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Slow floating circles */}
      {circles.map((circle) => (
        <motion.div
          key={`circle-${circle.id}`}
          className={`absolute rounded-full blur-[80px] ${circle.color}`}
          style={{
            width: circle.size,
            height: circle.size,
            left: `${circle.x}%`,
            top: `${circle.y}%`,
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, 30, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          className="absolute rounded-full bg-blue-400/40"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: ['0%', '-1000%'],
            x: ['0%', '200%', '-200%', '0%'],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default BackgroundParticles;
