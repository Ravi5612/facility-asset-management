const fs = require("fs");
let code = fs.readFileSync("components/features/dashboard/DashboardClientPage.tsx", "utf8");

// Add currentTime state
const stateBlock = `  const [currentDate, setCurrentDate] = useState("");`;
const newStateBlock = `  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");`;
code = code.replace(stateBlock, newStateBlock);

// Add setInterval to useEffect
const effectBlock = `  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    }));
  }, []);`;

const newEffectBlock = `  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Kolkata",
      }));
      setCurrentTime(now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }));
    };
    
    updateTime(); // Initial call
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);`;
code = code.replace(effectBlock, newEffectBlock);

// Add to UI
const uiBlock = `          <div className="text-left sm:text-right text-white/90 font-medium">
            <p>{currentDate}</p>
          </div>`;

const newUiBlock = `          <div className="text-left sm:text-right text-white/90 font-medium flex flex-col sm:items-end">
            <p className="text-sm opacity-90">{currentDate}</p>
            {currentTime && (
              <div className="flex items-center gap-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock opacity-80"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <p className="text-2xl font-bold tracking-widest">{currentTime}</p>
              </div>
            )}
          </div>`;

code = code.replace(uiBlock, newUiBlock);

fs.writeFileSync("components/features/dashboard/DashboardClientPage.tsx", code, "utf8");
console.log("Clock added");
