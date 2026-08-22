"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Palette, Save, Sparkles, Wand2, Plus, X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { FestivalThemes } from "./FestivalThemes";
import { APP_CONFIG } from "@/lib/constants";

export function SettingsClientPage() {
  const { themeColor, setThemeColor } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(themeColor);
  const [isSaving, setIsSaving] = useState(false);

  // Gradient builder state (dynamic array of colors)
  const [gradColors, setGradColors] = useState<string[]>(() => {
    if (themeColor.startsWith("gradient:")) {
      const parts = themeColor.replace("gradient:", "").split(",");
      if (parts.length > 0) return parts;
    }
    return ["#4f46e5", "#db2777"];
  });
  const [newFestName, setNewFestName] = useState("");
  
  // Custom saved festivals
  const [customFestivals, setCustomFestivals] = useState<Array<{name: string, label: string, bg: string}>>([]);

  useEffect(() => {
    // Load saved custom festivals from local storage
    const saved = localStorage.getItem("custom_festivals");
    if (saved) {
      try {
        setCustomFestivals(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved custom festivals:", e);
      }
    }
  }, []);

  const baseColors = [
    { name: "blue", bgClass: "bg-[#1553cc]", label: "Ocean Blue" },
    { name: "red", bgClass: "bg-[#dc2626]", label: "Dr IT Red" },
    { name: "yellow", bgClass: "bg-[#d97706]", label: "Gold/Yellow" },
    { name: "green", bgClass: "bg-[#059669]", label: "Emerald Green" },
    { name: "purple", bgClass: "bg-[#7c3aed]", label: "Royal Purple" },
    { name: "orange", bgClass: "bg-[#ea580c]", label: "Vibrant Orange" },
    { name: "teal", bgClass: "bg-[#0d9488]", label: "Teal" },
    { name: "pink", bgClass: "bg-[#db2777]", label: "Pink" },
  ];

  const handleSave = () => {
    setIsSaving(true);
    fetch('/api/proxy/settings/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ themeColor: selectedTheme })
    }).then(res => res.json())
      .then(data => {
        // Update cookie manually for client
        document.cookie = `app-theme-color=${selectedTheme}; path=/; max-age=31536000`;
        setThemeColor(selectedTheme);
        setIsSaving(false);
      }).catch(err => {
        console.error(err);
        setIsSaving(false);
      });
  };

  const isCustomHex = selectedTheme.startsWith("#");
  const isCustomGrad = selectedTheme.startsWith("gradient:") && !customFestivals.some(f => f.name === selectedTheme);

  const handleApplyGradient = (newColors: string[]) => {
    setSelectedTheme(`gradient:${newColors.join(",")}`);
  };

  const addColor = () => {
    if (gradColors.length >= 6) return; // Limit to 6 colors
    const newColors = [...gradColors, "#000000"];
    setGradColors(newColors);
    handleApplyGradient(newColors);
  };

  const removeColor = (index: number) => {
    if (gradColors.length <= 2) return; // Minimum 2 colors
    const newColors = gradColors.filter((_, i) => i !== index);
    setGradColors(newColors);
    handleApplyGradient(newColors);
  };

  const updateColor = (index: number, val: string) => {
    const newColors = [...gradColors];
    newColors[index] = val;
    setGradColors(newColors);
    handleApplyGradient(newColors);
  };

  const handleSaveCustomFestival = () => {
    if (!newFestName.trim()) return;
    const gradientValue = `gradient:${gradColors.join(",")}`;
    const bgString = `linear-gradient(135deg, ${gradColors.join(', ')})`;
    
    const newFest = {
      name: gradientValue,
      label: newFestName.trim(),
      bg: bgString
    };

    const updatedFestivals = [...customFestivals, newFest];
    setCustomFestivals(updatedFestivals);
    localStorage.setItem("custom_festivals", JSON.stringify(updatedFestivals));
    setNewFestName("");
    setSelectedTheme(gradientValue);
  };

  const handleDeleteCustomFestival = (e: React.MouseEvent, festName: string) => {
    e.stopPropagation();
    const updated = customFestivals.filter(f => f.name !== festName);
    setCustomFestivals(updated);
    localStorage.setItem("custom_festivals", JSON.stringify(updated));
    if (selectedTheme === festName) {
      setSelectedTheme(APP_CONFIG.defaultTheme); // reset if deleting the active one
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Global Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage application-wide preferences and branding.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Theme & Branding Colors</CardTitle>
          </div>
          <CardDescription>
            Change the color theme of the entire application. Choose from presets, festival themes, or pick your own custom color.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Main Presets */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-slate-800">Primary Preset Colors</h3>
            <div className="flex flex-wrap gap-4">
              {baseColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedTheme(color.name)}
                  className={`relative h-14 w-14 rounded-full flex items-center justify-center transition-all ${color.bgClass} ${
                    selectedTheme === color.name ? "ring-4 ring-offset-2 ring-primary scale-110" : "hover:scale-105 opacity-80"
                  }`}
                  title={color.label}
                >
                  {selectedTheme === color.name && <Check className="h-6 w-6 text-white drop-shadow-md" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
            {/* Custom Solid Color Picker */}
            <div>
               <h3 className="text-sm font-semibold mb-4 text-slate-800">Custom Solid Color</h3>
               <div className="flex items-center gap-4">
                  <div 
                    className={`relative h-14 w-14 rounded-full overflow-hidden flex items-center justify-center transition-all ${
                      isCustomHex ? "ring-4 ring-offset-2 ring-primary scale-110" : "hover:scale-105 border-2 border-dashed border-slate-300"
                    }`}
                  >
                    <input 
                      type="color" 
                      value={isCustomHex ? selectedTheme : "#000000"} 
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="absolute inset-[-10px] h-[200%] w-[200%] cursor-pointer opacity-0"
                      title="Choose custom color"
                    />
                    {isCustomHex ? (
                      <div className="absolute inset-0 z-[-1]" style={{ backgroundColor: selectedTheme }}></div>
                    ) : (
                      <div className="absolute inset-0 z-[-1] bg-slate-100 flex items-center justify-center">
                        <span className="text-xl">+</span>
                      </div>
                    )}
                    {isCustomHex && <Check className="h-6 w-6 text-white drop-shadow-md z-10 mix-blend-difference" />}
                  </div>
                  <div className="text-sm text-muted-foreground max-w-[200px]">
                    Pick any custom solid color for your brand.
                  </div>
               </div>
            </div>

            {/* Custom Gradient Builder */}
            <div>
               <h3 className="text-sm font-semibold mb-4 text-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-2"><Wand2 className="h-4 w-4" /> Custom Gradient</div>
                 <Button type="button" variant="outline" size="sm" onClick={addColor} disabled={gradColors.length >= 6} className="h-7 text-xs px-2">
                   <Plus className="h-3 w-3 mr-1" /> Add Color
                 </Button>
               </h3>
               <div className="flex flex-col gap-3">
                 <div className="flex flex-wrap items-center gap-2">
                   {gradColors.map((color, stopId) => (
                     <div key={`grad-stop-${stopId}`} className="flex items-center border rounded-md p-1 shadow-sm bg-white group">
                       <input 
                         type="color" 
                         value={color} 
                         onChange={(e) => updateColor(stopId, e.target.value)} 
                         className="h-7 w-9 cursor-pointer border-0 p-0 rounded" 
                       />
                       {gradColors.length > 2 && (
                         <button 
                           type="button" 
                           onClick={() => removeColor(stopId)}
                           className="ml-1 p-0.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 transition-colors"
                         >
                           <X className="h-3 w-3" />
                         </button>
                       )}
                     </div>
                   ))}
                 </div>

                 <button
                    onClick={() => handleApplyGradient(gradColors)}
                    className={`relative mt-2 h-16 w-full rounded-xl flex items-center justify-center transition-all ${
                      isCustomGrad ? "ring-4 ring-offset-2 ring-primary scale-[1.02] shadow-lg" : "hover:scale-[1.01] shadow border border-slate-200"
                    }`}
                  >
                    <div className="absolute inset-0 rounded-xl opacity-90" style={{ background: `linear-gradient(135deg, ${gradColors.join(', ')})` }}></div>
                    <span className="relative z-10 text-white font-bold drop-shadow-md text-sm">Gradient Preview</span>
                    {isCustomGrad && (
                      <div className="absolute top-2 right-2 bg-white/30 backdrop-blur-md rounded-full p-1 z-10">
                         <Check className="h-4 w-4 text-white drop-shadow-md" />
                      </div>
                    )}
                 </button>

                 {/* Save Custom Festival Form */}
                 <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <input 
                      type="text" 
                      placeholder="Theme Name (e.g. Dussehra)" 
                      value={newFestName}
                      onChange={(e) => setNewFestName(e.target.value)}
                      className="flex-1 text-xs border rounded-md px-2 py-1.5 focus:outline-none focus:border-primary"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={handleSaveCustomFestival} disabled={!newFestName.trim()} className="h-7 text-xs">
                      Save to List
                    </Button>
                 </div>
               </div>
            </div>
          </div>

          {/* Festival Themes */}
          <FestivalThemes 
            customFestivals={customFestivals}
            selectedTheme={selectedTheme}
            setSelectedTheme={setSelectedTheme}
            setGradColors={setGradColors}
            handleDeleteCustomFestival={handleDeleteCustomFestival}
          />
          
          {/* Action Footer */}
          <div className="pt-6 border-t">
             <Button onClick={handleSave} disabled={isSaving || selectedTheme === themeColor} className="px-8">
               {isSaving ? <Spinner size="xs" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
               {isSaving ? "Applying Theme..." : "Save Settings"}
             </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
