import { motion } from "motion/react";
import { ThemeToggle } from "../components/theme-toggle";
import { LoginStatusButton } from "../components/login-status-button";
import { Bell, UserPlus, Info, Check, X, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

type Alert = {
  id: string;
  type: "invite" | "system" | "generic";
  title: string;
  description: string;
  date: string;
  read: boolean;
};

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "invite",
    title: "Shared List Invitation",
    description: "Sarah invited you to edit 'Weekend Getaway Packing'",
    date: "10 mins ago",
    read: false,
  },
  {
    id: "2",
    type: "system",
    title: "New Feature Available",
    description: "You can now view your lists in the Minimalist List layout!",
    date: "2 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "invite",
    title: "Shared List Invitation",
    description: "Mark shared 'Project Apollo Specs' with you",
    date: "1 day ago",
    read: true,
  },
  {
    id: "4",
    type: "generic",
    title: "Welcome to Ticksy!",
    description: "We are so glad you are here to organize your life.",
    date: "1 week ago",
    read: true,
  },
];

export function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="bg-card w-full h-full min-h-[calc(100vh-3rem)] rounded-none md:rounded-3xl border-0 md:border md:border-border shadow-sm overflow-hidden flex flex-col md:m-0">
      {/* Top Header */}
      <div className="flex items-center justify-between p-6 sm:p-8 border-b border-border bg-card sticky top-0 z-10 w-full">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate("/");
              }
            }}
            className="p-2 sm:hidden bg-background hover:bg-muted rounded-full transition-colors shrink-0 border border-border mr-1"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Notifications
            <span className="bg-highlight text-highlight-foreground text-xs px-2 py-0.5 rounded-full font-bold">
              {alerts.filter(a => !a.read).length}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LoginStatusButton />
        </div>
      </div>

      <div className="p-6 sm:p-8 flex-1 w-full max-w-2xl mx-auto flex flex-col mt-4">
        {/* Alerts List */}
        {alerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 flex flex-col items-center justify-center h-full"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-xl mb-2 text-foreground">You're all caught up!</h3>
            <p className="text-muted-foreground max-w-sm">
              We'll notify you here when someone shares a list with you or there are important updates.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4 pb-20">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 sm:p-6 rounded-2xl border transition-colors relative group
                  ${alert.read ? "bg-background border-border" : "bg-muted/30 border-highlight/30 shadow-sm"}
                `}
              >
                <button 
                  onClick={() => removeAlert(alert.id)}
                  className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex gap-4 pr-8">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5
                    ${alert.type === "invite" ? "bg-[#E7A1B0]/20 text-[#E7A1B0]" : 
                      alert.type === "system" ? "bg-[#C5A3FF]/20 text-[#C5A3FF]" : 
                      "bg-foreground/10 text-foreground"}
                  `}>
                    {alert.type === "invite" ? <UserPlus className="w-5 h-5" /> : 
                     alert.type === "system" ? <Info className="w-5 h-5" /> :
                     <Bell className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${alert.read ? "text-foreground" : "text-foreground font-bold"}`}>
                      {alert.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-snug mb-1">
                      {alert.description}
                    </p>
                    <span className="text-[10px] sm:text-xs text-muted-foreground block font-medium">
                      {alert.date}
                    </span>

                    {/* Actions if applicable */}
                    {alert.type === "invite" && !alert.read && (
                      <div className="flex items-center gap-2 mt-4">
                        <button className="flex items-center gap-1.5 px-4 py-1.5 bg-muted text-foreground hover:bg-muted/80 text-sm font-semibold rounded-full transition-colors">
                          View
                        </button>
                        <button className="flex items-center gap-1.5 px-4 py-1.5 bg-foreground text-background hover:opacity-90 text-sm font-semibold rounded-full transition-opacity">
                          <Check className="w-4 h-4" /> Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
