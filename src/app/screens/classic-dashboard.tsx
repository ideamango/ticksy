import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ListCard } from "../components/list-card";
import { CreateListModal } from "../components/create-list-modal";
import { useNavigate, useSearchParams } from "react-router";
import { FileText, Receipt, Share2, Recycle, Lightbulb, PlusCircle, History, ChevronRight, CheckSquare, Clock, Bell } from "lucide-react";
import { toast } from "sonner";
import { categories } from "../data/templates";
import { formatLastUpdated, useLists } from "../context/list-context";
import { ThemeToggle } from "../components/theme-toggle";
import type { CategoryId } from "../types";

export function ClassicDashboard() {
  const { lists, createList, importSharedList } = useLists();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const importToken = searchParams.get("import");
    if (!importToken) {
      return;
    }

    // With the new DB logic, we just navigate to the list detail page which will fetch and join it.
    toast.success("Opening shared list...");
    navigate(`/list/${importToken}`, { replace: true });

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("import");
    setSearchParams(nextParams, { replace: true });
  }, [importSharedList, navigate, searchParams, setSearchParams]);

  const handleCreateList = (name: string, categoryId: CategoryId, emoji: string) => {
    const created = createList(name, categoryId, emoji);
    toast.success(`Created "${name}" list`);
    navigate(`/list/${created.id}`);
  };

  const handleReuseLast = () => {
    if (lists.length === 0) {
      toast.error("No lists to reuse yet.");
      return;
    }
    // Take the most recently updated list
    const lastList = [...lists].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
    navigate(`/list/${lastList.id}`);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-level-1 pb-32 font-sans transition-colors duration-300">
      <svg width="0" height="0" className="absolute">
        <linearGradient id="highlight-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDCA8C" />
          <stop offset="50%" stopColor="#E7A1B0" />
          <stop offset="100%" stopColor="#C5A3FF" />
        </linearGradient>
      </svg>

      {/* Top App Bar with Theme Surface */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-6 pt-6 sm:pt-8 pb-6 rounded-b-[3rem] sticky top-0 z-20 backdrop-blur-xl mb-6 flex flex-col items-center sm:items-start text-center sm:text-left border-b border-border/60 font-sans min-h-[108px] sm:min-h-[124px]">
        <div className="max-w-4xl mx-auto w-full flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-highlight shadow-sm">
              <CheckSquare className="w-5 h-5 sm:w-7 sm:h-7 text-highlight-foreground" />
            </div>
            <div className="flex flex-col text-left">
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-none mb-1">Ticksy</h1>
              <p className="text-muted-foreground font-medium text-[10px] sm:text-sm leading-none">Your lists, synced effortlessly.</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/alerts")}
                className="p-2 text-muted-foreground hover:text-foreground md:hidden rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Interactive Hero Banner */}
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border rounded-[2rem] p-6 sm:p-10 shadow-sm mb-12 mt-2 group"
         >
           {/* Animated gradient orbs for ambient background */}
           <motion.div 
              animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
              transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
              className="absolute -top-[20%] -right-[10%] w-[60%] h-[150%] bg-gradient-to-b from-highlight/10 to-[#C5A3FF]/10 blur-3xl pointer-events-none rounded-full"
           />
           <motion.div 
              animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
              transition={{ duration: 25, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
              className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[120%] bg-gradient-to-b from-[#E7A1B0]/10 to-highlight/5 blur-3xl pointer-events-none rounded-full"
           />
 
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
             
             {/* Left side: Copy & Call-to-actions */}
             <div className="flex-1 text-center md:text-left">
               <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-highlight/10 text-highlight font-medium text-xs sm:text-sm mb-4">
                 <Lightbulb className="w-4 h-4" /> The smarter way to list
               </span>
               
               <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
                 Still texting <br className="hidden md:block" />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FDCA8C] via-[#E7A1B0] to-[#C5A3FF]">grocery lists?</span>
               </h2>
               
               <p className="text-muted-foreground text-sm sm:text-lg leading-relaxed max-w-xl md:max-w-md mx-auto md:mx-0">
                 Create smart, live-syncing lists. Share effortlessly, avoid duplicates, and get template suggestions based on your past habits.
               </p>
               
               <div className="mt-8 flex items-center justify-center md:justify-start gap-4">
                  <button 
                    onClick={() => setIsCreateModalOpen(true)} 
                    className="w-14 h-14 md:w-auto md:h-auto md:px-6 md:py-3 bg-foreground text-background font-bold rounded-full md:rounded-xl hover:-translate-y-1 hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 shadow-md"
                    aria-label="Create a New List"
                  >
                    <PlusCircle className="w-6 h-6 md:w-5 md:h-5"/> 
                    <span className="hidden md:inline">Create a New List</span>
                  </button>
                  <button 
                    onClick={() => navigate('/templates')} 
                    className="flex-1 md:flex-none px-6 py-3 md:py-3 bg-card border border-border text-foreground font-bold rounded-full md:rounded-xl hover:-translate-y-1 hover:shadow-[0_4px_20px_var(--color-border)] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Recycle className="w-5 h-5"/> 
                    <span className="hidden sm:inline">Browse Templates</span>
                    <span className="inline sm:hidden">Templates</span>
                  </button>
               </div>
             </div>
 
             {/* Right side: Bento Box Feature Showcase */}
             <div className="flex-1 w-full mt-10 md:mt-0 grid grid-cols-2 gap-3 sm:gap-4 max-w-sm mx-auto md:max-w-none">
                
                {/* Large Block */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="col-span-2 bg-gradient-to-br from-highlight/20 to-highlight/5 border border-highlight/20 rounded-[2rem] p-5 sm:p-6 flex flex-col justify-end relative overflow-hidden min-h-[150px] shadow-sm"
                >
                   <div className="absolute top-4 sm:top-6 right-4 sm:right-6 p-3 bg-background rounded-2xl shadow-sm z-10">
                     <CheckSquare className="text-highlight w-6 h-6"/>
                   </div>
                   
                   {/* Decorative background UI */}
                   <div className="absolute top-6 left-6 right-24 space-y-2 opacity-40 pointer-events-none">
                     <div className="h-3 w-3/4 bg-foreground/20 rounded-full"></div>
                     <div className="h-3 w-1/2 bg-foreground/10 rounded-full"></div>
                   </div>

                   <div className="relative z-10 mt-12">
                     <h3 className="font-bold text-lg sm:text-xl text-foreground">Effortless Tracking</h3>
                     <p className="text-sm text-muted-foreground mt-1 font-medium">Tick off your items instantly.</p>
                   </div>
                </motion.div>

                {/* Small Block 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-card border border-border shadow-sm rounded-[2rem] p-5 flex flex-col items-center justify-center text-center gap-3 min-h-[150px]"
                >
                    <div className="relative flex -space-x-3 mb-1">
                      <div className="w-12 h-12 rounded-full bg-[#E7A1B0] border-[3px] border-background flex items-center justify-center text-white font-black z-10 shadow-sm">U</div>
                      <div className="w-12 h-12 rounded-full bg-[#C5A3FF] border-[3px] border-background flex items-center justify-center text-white font-black z-0 shadow-sm">S</div>
                    </div>
                    <span className="font-bold text-sm text-foreground">Live Synced</span>
                </motion.div>

                {/* Small Block 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-level-2 dark:bg-level-3 border border-border shadow-sm rounded-[2rem] p-5 flex flex-col items-center justify-center text-center gap-3 min-h-[150px]"
                >
                    <div className="p-3 bg-[#FDCA8C]/10 rounded-full mb-1">
                      <History className="w-7 h-7 text-[#FDCA8C]"/>
                    </div>
                    <span className="font-bold text-sm text-foreground">Fast Reuse</span>
                </motion.div>
             </div>      
           </div>
         </motion.div>

        {/* User's Existing Lists section */}
        <motion.div
          id="your-lists"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6 flex justify-between items-center scroll-mt-32"
        >
          <h2 className="text-xl font-bold text-foreground">Your Lists</h2>
          <button
            onClick={() => navigate("/templates")}
            className="text-sm font-medium text-foreground/80 flex items-center gap-1 hover:underline"
          >
            <FileText className="w-4 h-4" />
            Browse templates
          </button>
        </motion.div>

        {lists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-card rounded-xl border border-dashed border-slate-200 dark:border-border"
          >
            <div className="text-5xl mb-4">📝</div>
            <h3 className="font-semibold text-lg mb-2">No lists yet</h3>
            <p className="text-slate-500 dark:text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first list or browse templates to get started!
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-highlight text-highlight-foreground font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              + Create New List
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 sm:pb-4">
            {lists.map((list, index) => (
              <ListCard
                key={list.id}
                id={list.id}
                title={`${list.title} ${list.emoji ?? ""}`.trim()}
                category={categories.find((category) => category.id === list.categoryId)?.label ?? "Other"}
                completed={list.items.filter((item) => item.completed).length}
                total={list.items.length}
                lastUpdated={formatLastUpdated(list.updatedAt)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fixed bottom navigation bar (Optional, keeps parity with old dashboard) - but maybe not needed since user has actions in UI now? User only explicitly said "Use all these elements for our dashboard pls. Make sure its responsive".
      I will remove it since our new top actions cover it, but wait: the app might rely on `Fixed bottom navigation bar`. 
      I will add a fixed action button just in case. But actually `CreateNew` is handled by the round icon button, and `templates` by the button near "Your Lists" and "Smart Suggestions". So the bottom nav is nicely integrated now. 
      Wait, user said "make sure its responsive". The previous dashboard mapped 'Create List' and 'Browse Templates' to bottom fixed bar. I'll retain it for consistency, but hide it if we want. Actually, no, the new layout feels complete without the floating bottom bar since New List and Templates are at top now. 
      Instead of returning the old bottom bar which duplicates, I'll let the user's focus stay on the hero we just built.
      */}



      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateList}
      />
    </div>
  );
}