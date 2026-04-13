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
import { LoginStatusButton } from "../components/login-status-button";
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
      <div className="bg-background/80 dark:bg-level-1/80 px-6 pt-6 sm:pt-8 pb-6 rounded-b-xl sticky top-0 z-20 backdrop-blur-xl mb-6 flex flex-col items-center sm:items-start text-center sm:text-left border-b border-border font-sans">
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
              <LoginStatusButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm mb-6 mt-2"
        >
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Still texting grocery lists?
            </h2>
            <Receipt className="w-6 h-6 sm:w-8 sm:h-8" style={{ stroke: "url(#highlight-gradient)" }} />
          </div>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
            Make your own smart, shareable list — save time, avoid repeats, and shop stress-free.
          </p>
        </motion.div>

        {/* Feature Cards Grid (Compact on Mobile, 3 cols) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 sm:gap-4 mb-8"
        >
          {/* Feature 1: Share */}
          <button
            onClick={() => toast.info("Check back soon to see lists shared with you directly!")}
            className="bg-card rounded-xl sm:rounded-2xl p-2 sm:p-6 flex flex-col h-full border border-border text-center items-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
          >
            <h3 className="font-bold text-foreground text-[10px] sm:text-lg mb-1 sm:mb-2 leading-tight">
              Share Lists
            </h3>
            <p className="text-[9px] sm:text-sm text-muted-foreground mb-2 sm:mb-6 flex-1 leading-tight line-clamp-3 sm:line-clamp-none">
              Share effortlessly with a link
            </p>
            <div className="w-10 h-10 sm:w-20 sm:h-20 bg-muted/30 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 sm:w-9 sm:h-9 text-[#E7A1B0]" strokeWidth={2.5} />
            </div>
          </button>

          {/* Feature 2: Existing Lists */}
          <button
            onClick={() => { const el = document.getElementById('your-lists'); el?.scrollIntoView({ behavior: 'smooth' }); }}
            className="bg-card rounded-xl sm:rounded-2xl p-2 sm:p-6 flex flex-col h-full border border-border text-center items-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
          >
            <h3 className="font-bold text-foreground text-[10px] sm:text-lg mb-1 sm:mb-2 leading-tight">
              Reuse Past Lists
            </h3>
            <p className="text-[9px] sm:text-sm text-muted-foreground mb-2 sm:mb-6 flex-1 leading-tight line-clamp-3 sm:line-clamp-none">
              Stop rewriting the same items
            </p>
            <div className="w-10 h-10 sm:w-20 sm:h-20 bg-muted/30 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Recycle className="w-5 h-5 sm:w-9 sm:h-9 text-[#C5A3FF]" strokeWidth={2.5} />
            </div>
          </button>

          {/* Feature 3: Create New List */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-card rounded-xl sm:rounded-2xl p-2 sm:p-6 flex flex-col h-full border border-border text-center items-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
          >
            <h3 className="font-bold text-foreground text-[10px] sm:text-lg mb-1 sm:mb-2 leading-tight">
              Create New List
            </h3>
            <p className="text-[9px] sm:text-sm text-muted-foreground mb-2 sm:mb-6 flex-1 leading-tight line-clamp-3 sm:line-clamp-none">
              Start a fresh list right now
            </p>
            <div className="w-10 h-10 sm:w-20 sm:h-20 bg-muted/30 rounded-lg sm:rounded-xl flex items-center justify-center">
              <PlusCircle className="w-5 h-5 sm:w-9 sm:h-9 text-[#FDCA8C]" strokeWidth={2.5} />
            </div>
          </button>
        </motion.div>

        {/* Smart Suggestions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate('/templates')}
          className="bg-card border border-border rounded-xl p-5 sm:p-6 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all mb-12 flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center shrink-0">
            <Lightbulb className="w-6 h-6 text-foreground" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground mb-1">Smart Suggestions</h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-snug">
              Based on your past lists, we've got ideas on what you'll likely need next.
            </p>
          </div>
          <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-6 h-6 text-foreground" strokeWidth={2.5} />
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

      {/* Mobile Floating Action Button (Optional) */}
      <div className="md:hidden fixed bottom-20 right-6 z-50">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-16 h-16 bg-highlight text-highlight-foreground hover:bg-highlight/90 rounded-xl flex items-center justify-center shadow-2xl active:scale-95 transition-all backdrop-blur-md border border-border/20"
        >
          <PlusCircle className="w-8 h-8" strokeWidth={3} />
        </button>
      </div>

      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateList}
      />
    </div>
  );
}