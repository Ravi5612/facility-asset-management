import React from 'react';
import Image from 'next/image';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  // Map sizes to container dimensions
  const sizeMap = {
    xs: 'h-6 w-6',
    sm: 'h-24 w-24',
    md: 'h-40 w-40',
    lg: 'h-52 w-52',
    xl: 'h-64 w-64',
  };

  const logoSizeMap = {
    xs: 16,
    sm: 48,
    md: 80,
    lg: 112,
    xl: 144,
  };

  const containerClass = sizeMap[size];
  const logoSize = logoSizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`relative flex items-center justify-center ${containerClass}`}>
        {/* The Logo */}
        <div className="absolute z-10 flex items-center justify-center">
          <Image 
            src="/dr-it-logo-3d.png" 
            alt="Loading..." 
            width={logoSize} 
            height={logoSize} 
            className="object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" 
          />
        </div>
        
        {/* Pulsing Dots Ring */}
        <div className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite]">
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i * 360) / 16;
            const rad = (angle * Math.PI) / 180;
            const x = 50 + 40 * Math.cos(rad);
            const y = 50 + 40 * Math.sin(rad);
            const delay = i * 0.1;
            const color = i < 6 ? "#ef4444" : i < 11 ? "#8c7335" : "#555"; // Red, Gold, Dark Gray
            
            // Adjust dot size based on container size
            const dotClass = size === 'xs' ? 'w-0.5 h-0.5' : size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1.5 h-1.5' : 'w-2 h-2';

            return (
              <div
                key={i}
                className={`absolute rounded-full ${dotClass}`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: color,
                  animation: `spinnerDotPulse 1.6s infinite ease-in-out ${delay}s`,
                }}
              />
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spinnerDotPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[400px] w-full flex flex-col items-center justify-center bg-transparent">
      <Spinner size="lg" />
      <div className="mt-8 flex flex-col items-center gap-2">
        <span className="text-slate-600 dark:text-slate-300 font-medium tracking-widest uppercase text-sm">Loading</span>
        <div className="flex gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="h-1.5 w-1.5 rounded-full bg-[#8c7335] animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
}
