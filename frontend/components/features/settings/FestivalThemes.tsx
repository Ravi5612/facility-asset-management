import React from "react";
import { Sparkles, Check, Trash2 } from "lucide-react";

interface FestivalThemesProps {
  customFestivals: Array<{name: string, label: string, bg: string}>;
  selectedTheme: string;
  setSelectedTheme: (theme: string) => void;
  setGradColors: (colors: string[]) => void;
  handleDeleteCustomFestival: (e: React.MouseEvent, festName: string) => void;
}

export function FestivalThemes({
  customFestivals,
  selectedTheme,
  setSelectedTheme,
  setGradColors,
  handleDeleteCustomFestival
}: FestivalThemesProps) {
  return (
    <div className="pt-6 border-t border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-800">Festival & Special Themes</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {customFestivals.map((fest, idx) => {
          const isCustom = true;
          return (
          <button
            key={fest.name + idx}
            onClick={() => {
              setSelectedTheme(fest.name);
              if (fest.name.startsWith("gradient:")) {
                const parts = fest.name.replace("gradient:", "").split(",");
                if (parts.length > 0) setGradColors(parts);
              }
            }}
            className={`relative h-24 rounded-xl flex items-end p-3 transition-all overflow-hidden ${
              selectedTheme === fest.name ? "ring-4 ring-offset-2 ring-primary scale-[1.02] shadow-lg" : "hover:scale-[1.02] opacity-90 shadow"
            }`}
          >
            <div className="absolute inset-0 opacity-80" style={{ background: fest.bg }}></div>
            <div className="relative z-10 w-full flex items-center justify-between">
              <span className="bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-bold shadow-sm">
                {fest.label}
              </span>
              {isCustom && (
                <div 
                  onClick={(e) => handleDeleteCustomFestival(e, fest.name)}
                  className="bg-black/40 hover:bg-red-500 backdrop-blur-sm text-white p-1.5 rounded cursor-pointer transition-colors"
                  title="Delete Theme"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
            {selectedTheme === fest.name && (
              <div className="absolute top-2 right-2 bg-white/30 backdrop-blur-md rounded-full p-1 z-10">
                 <Check className="h-4 w-4 text-white drop-shadow-md" />
              </div>
            )}
          </button>
        )})}
      </div>
    </div>
  );
}
