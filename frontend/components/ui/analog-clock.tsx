import React from "react";

export interface AnalogClockProps {
  date: Date;
  className?: string;
  style?: React.CSSProperties;
}

export const AnalogClock = ({ date, className = "", style }: AnalogClockProps) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const secondAngle = seconds * 6;

  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 rounded-full bg-white border-[7px] border-[#6b4226] z-30 transform hover:scale-105 transition-transform ${className}`} 
      style={style || { width: 100, height: 100 }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute scale-[0.88]">
        {/* Numbers */}
        {Array.from({ length: 12 }).map((_, i) => {
          const num = i + 1;
          const angle = num * 30 * (Math.PI / 180);
          const x = 50 + 38 * Math.sin(angle);
          const y = 50 - 38 * Math.cos(angle);
          return (
            <text key={num} x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" className="text-[16px] font-bold fill-slate-800" style={{ fontFamily: "Arial, sans-serif" }}>
              {num}
            </text>
          );
        })}
        {/* Tick marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          if (i % 5 === 0) return null; // skip hour marks
          const angle = i * 6;
          return (
            <line key={i} x1="50" y1="3" x2="50" y2="5" stroke="#94a3b8" strokeWidth="1" transform={`rotate(${angle} 50 50)`} />
          );
        })}
        {/* Hands */}
        <line x1="50" y1="50" x2="50" y2="25" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" transform={`rotate(${hourAngle} 50 50)`} />
        <line x1="50" y1="50" x2="50" y2="15" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${minuteAngle} 50 50)`} />
        <line x1="50" y1="50" x2="50" y2="10" stroke="#ef4444" strokeWidth="1" strokeLinecap="round" transform={`rotate(${secondAngle} 50 50)`} />
        {/* Center */}
        <circle cx="50" cy="50" r="3" fill="#d97706" />
        <circle cx="50" cy="50" r="1.5" fill="#1e293b" />
      </svg>
    </div>
  );
};
