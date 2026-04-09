import { NavLink } from "react-router";
import { LayoutGrid, FileText, Lightbulb, User } from "lucide-react";

export function MobileBottomNav() {
  const navItems = [
    { to: "/", icon: LayoutGrid, label: "Home" },
    { to: "/lists", icon: FileText, label: "Lists" },
    { to: "/templates", icon: Lightbulb, label: "Templates" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 flex items-center justify-around pb-safe h-16 px-4 transition-colors duration-300">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive ? "text-highlight-foreground font-bold" : "text-muted-foreground hover:text-foreground"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`p-1.5 rounded-full ${
                  isActive ? "bg-highlight shadow-sm" : "bg-transparent"
                } transition-colors`}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-highlight-foreground" : ""}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`text-[10px] ${isActive ? "font-bold text-foreground" : "font-medium"}`}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
