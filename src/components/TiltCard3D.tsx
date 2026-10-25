import React, { useRef, useState } from 'react';

interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = '',
  intensity = 6,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transformStyle, setTransformStyle] = useState<string>(
    'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  );
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    const rotateY = (relX - 0.5) * intensity * 2;
    const rotateX = (0.5 - relY) * intensity * 2;

    setTransformStyle(
      `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
        2
      )}deg) scale3d(1.012, 1.012, 1.012)`
    );
    setGlarePos({
      x: Math.round(relX * 100),
      y: Math.round(relY * 100),
      opacity: 0.14,
    });
  };

  const handleMouseLeave = () => {
    setTransformStyle(
      'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    );
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        transformStyle: 'preserve-3d',
      }}
      className={`relative ${className}`}
    >
      {/* Dynamic 3D Specular Light Glare */}
      <div
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glarePos.opacity}), transparent 60%)`,
          transition: 'opacity 180ms ease',
        }}
        className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
      />
      {children}
    </div>
  );
};
