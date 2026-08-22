import Image from "next/image";

export default function TestSpinners() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-10 font-sans text-white">
      <div className="text-center mb-16">
        <h1 className="text-2xl tracking-[0.2em] font-medium text-slate-200 uppercase mb-4">
          Loading Spinner Designs
        </h1>
        <div className="flex justify-center gap-2 items-center">
          <div className="h-[1px] w-12 bg-red-600"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-red-600"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-[#8c7335]"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
        </div>
        <p className="mt-8 text-slate-400 text-sm">
          Aapke bheje hue reference design ke hisaab se premium animations. Jo pasand aaye batayein!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-20 gap-x-10 max-w-[90rem] mx-auto">
        
        {/* Option 1: Orbit Rotate */}
        <SpinnerCard number="01" title="Orbit Rotate">
          <div className="relative h-52 w-52 flex items-center justify-center">
            {/* The Logo */}
            <div className="absolute z-10 h-32 w-32 flex items-center justify-center">
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
            </div>
            {/* The Orbit */}
            <div className="absolute inset-0 rounded-full border border-red-500/30 animate-[spin_4s_linear_infinite]">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-3 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]"></div>
              <div className="absolute top-1/4 -right-1 h-2 w-2 bg-[#8c7335] rounded-full shadow-[0_0_8px_#8c7335]"></div>
              <div className="absolute -bottom-1 left-1/3 h-2 w-2 bg-red-500 rounded-full shadow-[0_0_8px_#ef4444]"></div>
              <div className="absolute top-1/2 -left-1.5 h-3 w-3 bg-red-600 rounded-full shadow-[0_0_10px_#dc2626]"></div>
            </div>
          </div>
        </SpinnerCard>

        {/* Option 2: Pulse */}
        <SpinnerCard number="02" title="Pulse">
          <div className="relative h-52 w-52 flex items-center justify-center">
            {/* The Logo */}
            <div className="absolute z-10 h-32 w-32 flex items-center justify-center">
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
            </div>
            {/* Pulse Rings */}
            <div className="absolute inset-2 border-2 border-red-600 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"></div>
            <div className="absolute inset-0 border border-red-500/50 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-10"></div>
            <div className="absolute -inset-4 border border-[#8c7335]/40 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-5"></div>
          </div>
        </SpinnerCard>

        {/* Option 3: Radial Bars */}
        <SpinnerCard number="03" title="Radial Bars">
          <div className="relative h-52 w-52 flex items-center justify-center">
            {/* The Logo */}
            <div className="absolute z-10 h-32 w-32 flex items-center justify-center">
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
            </div>
            {/* SVG Radial Bars */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_2s_steps(18)_infinite]">
              {[...Array(18)].map((_, i) => (
                <line
                  key={i}
                  x1="50" y1="10" x2="50" y2="22"
                  stroke={i < 5 ? "#ef4444" : i < 10 ? "#dc2626" : i < 14 ? "#8c7335" : "#333"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  transform={`rotate(${i * 20} 50 50)`}
                  opacity={1 - (i * 0.05)}
                />
              ))}
            </svg>
          </div>
        </SpinnerCard>

        {/* Option 4: Wave Orbit */}
        <SpinnerCard number="04" title="Wave Orbit">
          <div className="relative h-52 w-52 flex items-center justify-center">
            {/* The Logo */}
            <div className="absolute z-10 h-32 w-32 flex items-center justify-center">
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
            </div>
            {/* Distorted Rings */}
            <div className="absolute inset-2 border-[0.5px] border-red-500/60 rounded-[40%] animate-[spin_4s_linear_infinite]"></div>
            <div className="absolute inset-1 border-[0.5px] border-[#8c7335]/60 rounded-[43%] animate-[spin_5s_linear_infinite_reverse]"></div>
            <div className="absolute inset-3 border-[0.5px] border-red-600/50 rounded-[38%] animate-[spin_3s_linear_infinite]"></div>
            <div className="absolute inset-0 border-[0.5px] border-red-400/30 rounded-[45%] animate-[spin_6s_linear_infinite_reverse]"></div>
          </div>
        </SpinnerCard>

        {/* Option 5: Dot Circle */}
        <SpinnerCard number="05" title="Dot Circle">
          <div className="relative h-52 w-52 flex items-center justify-center">
            {/* The Logo */}
            <div className="absolute z-10 h-32 w-32 flex items-center justify-center">
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
            </div>
            {/* SVG Pulsing Dots */}
            <div className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite]">
              {Array.from({ length: 16 }).map((_, i) => {
                const angle = (i * 360) / 16;
                const rad = (angle * Math.PI) / 180;
                const x = 50 + 40 * Math.cos(rad);
                const y = 50 + 40 * Math.sin(rad);
                const delay = i * 0.1;
                const color = i < 6 ? "#ef4444" : i < 11 ? "#8c7335" : "#333";
                
                return (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                      backgroundColor: color,
                      animation: `dotPulse 1.6s infinite ease-in-out ${delay}s`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </SpinnerCard>

        {/* Option 6: Horizontal Loader */}
        <SpinnerCard number="06" title="Horizontal Loader" className="col-span-1">
          <div className="flex items-center gap-6">
            {/* The Logo */}
            <div className="h-32 w-32 flex items-center justify-center relative">
              <div className="absolute inset-0 border border-red-500/30 rounded-full animate-ping opacity-20"></div>
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.4)] relative z-10" />
            </div>
            {/* Horizontal Bars */}
            <div className="flex items-center gap-1.5 h-10">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 rounded-full"
                  style={{
                    backgroundColor: i < 3 ? "#ef4444" : i < 5 ? "#dc2626" : i < 7 ? "#8c7335" : "#333",
                    animation: `barScale 1s infinite ease-in-out ${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        </SpinnerCard>

        {/* Option 7: 3D Coin Spin */}
        <SpinnerCard number="07" title="3D Globe Spin">
          <div className="relative h-52 w-52 flex items-center justify-center">
            <div className="absolute z-10 h-32 w-32 flex items-center justify-center animate-[flip_3s_infinite_linear]">
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            </div>
            {/* Subtle base shadow */}
            <div className="absolute -bottom-2 w-16 h-2 bg-black/40 rounded-full blur-sm"></div>
          </div>
        </SpinnerCard>

        {/* Option 8: Radar Sweep */}
        <SpinnerCard number="08" title="Radar Sweep">
          <div className="relative h-52 w-52 flex items-center justify-center">
            {/* The Logo */}
            <div className="absolute z-10 h-32 w-32 flex items-center justify-center">
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
            </div>
            {/* Radar Sweep Effect */}
            <div className="absolute inset-0 rounded-full border border-red-900/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-500/10 to-red-600/40 animate-[spin_2s_linear_infinite]" style={{ transformOrigin: 'center' }}></div>
            </div>
          </div>
        </SpinnerCard>
        {/* Option 9: Shimmer Shine */}
        <SpinnerCard number="09" title="Shimmer Shine">
          <div className="relative h-52 w-52 flex items-center justify-center overflow-hidden rounded-full">
            <div className="absolute z-10 h-32 w-32 flex items-center justify-center">
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
            </div>
            {/* Shimmer line sweeping across */}
            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[30deg] animate-[shimmer_2.5s_infinite_ease-in-out] z-20"></div>
          </div>
        </SpinnerCard>

        {/* Option 10: Elegant Levitation */}
        <SpinnerCard number="10" title="Elegant Levitation">
          <div className="relative h-52 w-52 flex flex-col items-center justify-center">
            <div className="z-10 h-32 w-32 flex items-center justify-center animate-[levitate_3s_infinite_ease-in-out]">
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
            </div>
            {/* Dynamic Shadow */}
            <div className="mt-4 w-12 h-1.5 bg-black/50 rounded-full blur-[2px] animate-[shadowScale_3s_infinite_ease-in-out]"></div>
          </div>
        </SpinnerCard>

        {/* Option 11: Tech Glitch */}
        <SpinnerCard number="11" title="Tech Glitch">
          <div className="relative h-52 w-52 flex items-center justify-center">
            <div className="absolute z-10 h-32 w-32 flex items-center justify-center animate-[glitch1_2.5s_infinite]">
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain opacity-80 mix-blend-screen" style={{ filter: 'drop-shadow(3px 0 0 red)' }} />
            </div>
            <div className="absolute z-10 h-32 w-32 flex items-center justify-center animate-[glitch2_2.5s_infinite]">
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain opacity-80 mix-blend-screen" style={{ filter: 'drop-shadow(-3px 0 0 blue)' }} />
            </div>
            <div className="absolute z-20 h-32 w-32 flex items-center justify-center">
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]" />
            </div>
          </div>
        </SpinnerCard>

        {/* Option 12: Neon Breathing */}
        <SpinnerCard number="12" title="Neon Breathing">
          <div className="relative h-52 w-52 flex items-center justify-center">
            <div className="absolute z-10 h-32 w-32 flex items-center justify-center">
              <Image src="/dr-it-logo-3d.png" alt="Logo" width={128} height={128} className="object-contain animate-[neonPulse_2s_infinite_ease-in-out]" />
            </div>
          </div>
        </SpinnerCard>
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 100% { width: 4px; height: 4px; opacity: 0.3; }
          50% { width: 12px; height: 12px; opacity: 1; }
        }
        @keyframes barScale {
          0%, 100% { height: 20%; opacity: 0.3; }
          50% { height: 100%; opacity: 1; }
        }
        @keyframes shimmer {
          0% { left: -100%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: 200%; opacity: 0; }
        }
        @keyframes levitate {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shadowScale {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(0.6); opacity: 0.2; }
        }
        @keyframes glitch1 {
          0%, 100% { transform: translate(0, 0); clip-path: inset(0 0 0 0); }
          20% { transform: translate(-3px, 2px); clip-path: inset(10% 0 80% 0); }
          40% { transform: translate(3px, -2px); clip-path: inset(40% 0 10% 0); }
          60% { transform: translate(-3px, 0); clip-path: inset(80% 0 5% 0); }
          80% { transform: translate(2px, 3px); clip-path: inset(20% 0 50% 0); }
        }
        @keyframes glitch2 {
          0%, 100% { transform: translate(0, 0); clip-path: inset(0 0 0 0); }
          20% { transform: translate(3px, -2px); clip-path: inset(80% 0 10% 0); }
          40% { transform: translate(-3px, 2px); clip-path: inset(10% 0 40% 0); }
          60% { transform: translate(3px, 0); clip-path: inset(5% 0 80% 0); }
          80% { transform: translate(-2px, -3px); clip-path: inset(50% 0 20% 0); }
        }
        @keyframes neonPulse {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(220,38,38,0.5)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 20px rgba(220,38,38,1)); transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

function SpinnerCard({ number, title, children, className = "" }: { number: string, title: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Label */}
      <div className="flex items-center gap-3 mb-8 w-full justify-center">
        <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-[0_0_8px_rgba(220,38,38,0.6)]">
          {number}
        </span>
        <span className="text-slate-300 text-sm tracking-[0.15em] font-medium uppercase">
          {title}
        </span>
      </div>

      {/* Animation Area */}
      <div className="h-52 w-full flex items-center justify-center mb-6">
        {children}
      </div>

      {/* Loading Text */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-slate-200 tracking-wider">Loading...</span>
        <div className="flex gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="h-1.5 w-1.5 rounded-full bg-[#8c7335] animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    </div>
  );
}
