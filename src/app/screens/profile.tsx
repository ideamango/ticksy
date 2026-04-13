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

  const handleSave = () => {
    toast.success("Profile saved successfully");
  };

  const allTemplatesCount = templates.length + customTemplates.length;

  return (
    <div className="bg-card w-full h-full min-h-[calc(100vh-3rem)] rounded-none md:rounded-3xl border-0 md:border md:border-border shadow-sm overflow-y-auto flex flex-col md:m-0 pb-20">
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
            Profile
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LoginStatusButton />
        </div>
      </div>

      <div className="p-6 sm:p-8 flex-1 w-full max-w-2xl mx-auto flex flex-col gap-8">
        
        {/* Avatar & Name Section */}
        <div className="flex flex-col items-center">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            className="hidden" 
            onChange={handleAvatarChange}
          />
          <div className="relative group cursor-pointer mb-3" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full bg-highlight flex items-center justify-center border-4 border-background shadow-lg overflow-hidden relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-highlight-foreground" />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <p className="text-sm text-foreground font-semibold cursor-pointer hover:underline" onClick={() => fileInputRef.current?.click()}>
            Change Avatar
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 mb-4 text-center">
            Max size: 5MB.<br/>Recommended: 500x500px.
          </p>

          <div className="flex items-center gap-2 h-10">
            {isEditingName ? (
              <input 
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                className="px-3 py-1 bg-card border border-border outline-none focus:border-foreground/50 rounded-xl text-center font-bold text-xl w-48 text-foreground transition-colors"
                autoFocus
              />
            ) : (
              <>
                <span className="text-2xl font-extrabold text-foreground tracking-tight">{name}</span>
                <button onClick={() => setIsEditingName(true)} className="p-1.5 text-muted-foreground hover:bg-muted rounded-full transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Settings Block */}
        <div className="bg-background rounded-2xl p-6 border border-border shadow-sm flex flex-col gap-6">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg text-foreground">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Notification Sounds</p>
                <p className="text-sm text-muted-foreground">Play a sound on new alerts</p>
              </div>
            </div>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${soundEnabled ? 'bg-highlight' : 'bg-muted'}`}
            >
              <motion.div 
                layout
                className={`w-4 h-4 rounded-full bg-white shadow-sm ${soundEnabled ? 'ml-auto' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-background rounded-2xl p-5 border border-border shadow-sm flex flex-col items-center justify-center text-center gap-2">
            <div className="p-3 bg-highlight/20 text-highlight rounded-xl mb-1">
              <ListTodo className="w-6 h-6" />
            </div>
            <p className="text-3xl font-extrabold text-foreground">{lists.length}</p>
            <p className="text-sm font-medium text-muted-foreground">Active Lists</p>
          </div>

          <div className="bg-background rounded-2xl p-5 border border-border shadow-sm flex flex-col items-center justify-center text-center gap-2">
            <div className="p-3 bg-highlight/20 text-highlight rounded-xl mb-1">
              <Lightbulb className="w-6 h-6" />
            </div>
            <p className="text-3xl font-extrabold text-foreground">{allTemplatesCount}</p>
            <p className="text-sm font-medium text-muted-foreground">Templates</p>
          </div>
        </div>
        
        {/* Save Actions */}
        <div className="mt-4 flex justify-end">
          <motion.button
            onClick={handleSave}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" /> Save Changes
          </motion.button>
        </div>
      </div>
    </div>
  );
}
