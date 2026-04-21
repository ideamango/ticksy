import { motion } from "motion/react";
import { ThemeToggle } from "../components/theme-toggle";
import { LoginStatusButton } from "../components/login-status-button";
import { ChevronLeft, User, Camera, Bell, ListTodo, Lightbulb, Save, Pencil } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useRef } from "react";
import { useLists } from "../context/list-context";
import { templates } from "../data/templates";
import { toast } from "sonner";

export function Profile() {
  const navigate = useNavigate();
  const { lists, customTemplates } = useLists();

  const [name, setName] = useState("Smita");
  const [isEditingName, setIsEditingName] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      toast.success("Avatar uploaded and saved!");
    }
  };



  const allTemplatesCount = templates.length + customTemplates.length;

  return (
    <div className="bg-background w-full min-h-screen pb-24 font-sans text-foreground">
      {/* Header matching exactly with list pages */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-6 pt-6 sm:pt-8 pb-6 rounded-b-[3rem] sticky top-0 z-20 backdrop-blur-xl mb-6 border-b border-border/60 shadow-md font-sans min-h-[108px] sm:min-h-[124px]">
        <div className="flex flex-row items-start justify-between gap-3 mb-0">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <motion.button
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate("/");
                }
              }}
              className="p-2 bg-background hover:bg-muted rounded-full transition-colors shrink-0 border border-border mt-1"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <h2 className="mb-0 text-xl sm:text-3xl font-extrabold block w-full leading-tight line-clamp-2 sm:truncate">
                  Profile
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">Personalize your identity and preferences.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <ThemeToggle />
            <LoginStatusButton />
          </div>
        </div>
      </div>

      <div className="px-6 sm:px-8 max-w-3xl mx-auto relative z-10 pt-4">
        {/* Avatar & Name Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 mb-12"
        >
          <div className="flex flex-col items-center">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleAvatarChange}
            />
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group cursor-pointer mb-2" 
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-level-2 flex items-center justify-center border-4 border-background shadow-xl overflow-hidden relative z-10 transition-colors">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute inset-0 bg-highlight/20 blur-2xl rounded-full -z-0"></div>
            </motion.div>
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left mb-2 md:mb-6">
            <div className="flex items-center justify-center md:justify-start gap-3 w-full">
              {isEditingName ? (
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onBlur={() => {
                    setIsEditingName(false);
                    toast.success("Name updated successfully");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingName(false);
                      toast.success("Name updated successfully");
                    }
                  }}
                  className="px-4 py-2 bg-level-2 border border-border outline-none focus:border-foreground/50 focus:ring-1 focus:ring-foreground/50 rounded-xl font-extrabold text-2xl md:text-3xl w-full max-w-[240px] text-foreground transition-all shadow-sm"
                  autoFocus
                />
              ) : (
                <motion.div 
                  className="group flex items-center gap-3 cursor-pointer"
                  onClick={() => setIsEditingName(true)}
                >
                  <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{name}</h1>
                  <span className="p-2 opacity-0 group-hover:opacity-100 bg-muted rounded-full transition-all text-muted-foreground hover:bg-highlight/20 hover:text-highlight">
                    <Pencil className="w-4 h-4" />
                  </span>
                </motion.div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Joined April 2026</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 md:gap-6 mb-8"
        >
          <div className="bg-card dark:bg-level-2 rounded-[2rem] p-6 sm:p-8 border border-border shadow-sm flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#E7A1B0]/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
            <div className="p-4 bg-[#E7A1B0]/10 text-[#E7A1B0] rounded-2xl mb-2 z-10 transition-transform group-hover:-translate-y-1">
              <ListTodo className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <div className="z-10">
              <p className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{lists.length}</p>
              <p className="text-sm md:text-base font-semibold text-muted-foreground mt-1">Active Lists</p>
            </div>
          </div>

          <div className="bg-card dark:bg-level-2 rounded-[2rem] p-6 sm:p-8 border border-border shadow-sm flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden group">
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C5A3FF]/10 rounded-full blur-2xl -ml-10 -mb-10 transition-transform group-hover:scale-150"></div>
            <div className="p-4 bg-[#C5A3FF]/10 text-[#C5A3FF] rounded-2xl mb-2 z-10 transition-transform group-hover:-translate-y-1">
              <Lightbulb className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <div className="z-10">
              <p className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{allTemplatesCount}</p>
              <p className="text-sm md:text-base font-semibold text-muted-foreground mt-1">Templates Saved</p>
            </div>
          </div>
        </motion.div>

        {/* Settings Block */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card dark:bg-level-2 rounded-[2rem] p-6 md:p-8 border border-border shadow-sm flex flex-col gap-6 relative overflow-hidden mb-12"
        >
          <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
            Preferences
          </h2>
          <div className="flex items-center justify-between group cursor-pointer" onClick={() => {
            setSoundEnabled(!soundEnabled);
            toast.success(`Notification sounds ${!soundEnabled ? 'enabled' : 'disabled'}`);
          }}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-2xl text-muted-foreground group-hover:bg-highlight/10 group-hover:text-highlight transition-colors">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-foreground text-base md:text-lg">Notification Sounds</p>
                <p className="text-sm text-muted-foreground font-medium">Play a crisp ping on live updates</p>
              </div>
            </div>
            <button
              className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${soundEnabled ? 'bg-highlight' : 'bg-muted border border-border'}`}
            >
              <motion.div
                layout
                className={`w-6 h-6 rounded-full shadow-md ${soundEnabled ? 'bg-highlight-foreground ml-auto' : 'bg-foreground'}`}
              />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
