import { motion } from "motion/react";
import { ThemeToggle } from "./theme-toggle";
import { CheckSquare, FileText, LayoutGrid, Box, Globe, Bell, User } from "lucide-react";
import { useNavigate } from "react-router";

export function Sidebar() {
  const navigate = useNavigate();
  return (
    <div className="w-16 lg:w-20 hidden md:flex flex-col items-center py-6 border-r border-border bg-card shadow-sm h-full rounded-l-2xl z-50 fixed left-0 top-0 bottom-0">
      <div className="flex flex-col items-center gap-6 w-full">
        <button 
          onClick={() => navigate("/")}
          className="p-2 sm:p-2.5 rounded-xl bg-highlight shadow-sm hover:opacity-90 transition-opacity"
        >
          <CheckSquare className="w-6 h-6 text-highlight-foreground" />
        </button>

        <div className="w-full flex justify-center">
          <div className="w-8 h-px bg-border my-2"></div>
        </div>

        <button onClick={() => navigate("/lists")} className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
          <FileText className="w-5 h-5" />
        </button>
        <button onClick={() => navigate("/templates")} className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button onClick={() => navigate("/")} className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
          <Box className="w-5 h-5" />
        </button>
        <button onClick={() => navigate("/")} className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
          <Globe className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-auto flex flex-col items-center gap-4 w-full">
        <button onClick={() => navigate("/alerts")} className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
          <Bell className="w-5 h-5" />
        </button>
        <button onClick={() => navigate("/profile")} className="p-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
          <User className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
