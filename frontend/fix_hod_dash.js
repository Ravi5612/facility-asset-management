const fs = require("fs");
let code = fs.readFileSync("components/features/hod/HodDashboardClientPage.tsx", "utf8");

if (!code.includes("AnalogClock")) {
  code = code.replace(
    "import { BarChart,",
    "import { AnalogClock } from \"@/components/ui/analog-clock\";\nimport { BarChart,"
  );
}

const hookCode = `  const [currentDate, setCurrentDate] = useState("");
  const [timeObj, setTimeObj] = useState<Date | null>(null);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }));
      setTimeObj(now);
      
      const hour = now.getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 17) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);
`;

if (!code.includes("currentDate")) {
  code = code.replace(
    "const deptName = user?.departmentName || \"\";",
    hookCode + "\n  const deptName = user?.departmentName || \"\";"
  );
}

const newBanner = `<div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.fullName?.split(" ")[0] || "HOD"}! ??</h1>
            <p className="text-white/80 text-lg">Here is what is happening in the {deptName} department today.</p>
          </div>
          
          <div className="flex items-center gap-4 sm:justify-end z-20 bg-black/10 pr-3 pl-5 py-2.5 rounded-[50px] backdrop-blur-sm border border-white/10 shadow-inner">
            <div className="text-right text-white/90 font-medium">
              <p className="text-lg font-bold">{currentDate}</p>
              {timeObj && <p className="text-sm opacity-90 mt-0.5 tracking-wider font-mono">{timeObj.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata" })}</p>}
            </div>
            {timeObj && <AnalogClock date={timeObj} className="shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)]" style={{ width: 130, height: 130, marginTop: "-25px", marginBottom: "-25px", marginRight: "-5px" }} />}
          </div>
        </div>`;

code = code.replace(
  /<div className="relative z-10">\s*<h1 className="text-3xl font-bold mb-2">Welcome back.*?<\/div>/s,
  newBanner
);

fs.writeFileSync("components/features/hod/HodDashboardClientPage.tsx", code);
console.log("Fixed HOD Dashboard Banner");
