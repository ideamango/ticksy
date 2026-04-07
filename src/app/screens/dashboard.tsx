import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ListCard } from "../components/list-card";
import { CreateListModal } from "../components/create-list-modal";
import { useNavigate, useSearchParams } from "react-router";
import { FileText, Receipt, Share2, Recycle, Lightbulb, Plus, History, ChevronRight, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { categories } from "../data/templates";
import { formatLastUpdated, useLists } from "../context/list-context";
import type { CategoryId } from "../types";

export function Dashboard() {
  const { lists, createList, importSharedList } = useLists();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const importToken = searchParams.get("import");
    if (!importToken) {
      return;
    }

    const imported = importSharedList(importToken);
    if (imported) {
      toast.success("Shared list imported. You can now update and re-share it.");
      navigate(`/list/${imported.id}`, { replace: true });
    } else {
      toast.error("Could not import this shared list link.");
    }

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
    <div className="min-h-screen bg-slate-50 dark:bg-background pb-32 font-sans">
      {/* Top App Bar with Theme Gradient */}
      <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-6 pt-6 sm:pt-8 pb-6 rounded-b-[2rem] sm:rounded-b-[3rem] sticky top-0 z-20 backdrop-blur-lg mb-6 flex flex-col items-center sm:items-start text-center sm:text-left border-b border-border/40 font-sans">
        <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground">Ticksy</h1>
          </div>
          <p className="text-muted-foreground font-medium text-xs sm:text-sm">Your lists, synced effortlessly.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-card border border-slate-100 dark:border-border rounded-[2rem] p-6 sm:p-8 shadow-sm mb-6 mt-2"
        >
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Still texting grocery lists?
            </h2>
            <Receipt className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-xl">
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
          {/* Feature 1 */}
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl sm:rounded-3xl p-2 sm:p-6 flex flex-col h-full border border-amber-100 dark:border-amber-900/30 text-center items-center">
            <h3 className="font-bold text-amber-900 dark:text-amber-200 text-[10px] sm:text-lg mb-1 sm:mb-2 leading-tight">
              Get rid of texting headache
            </h3>
            <p className="text-[9px] sm:text-sm text-amber-700 dark:text-amber-400/80 mb-2 sm:mb-6 flex-1 leading-tight line-clamp-3 sm:line-clamp-none">
              Share effortlessly with a link
            </p>
            <div className="w-10 h-10 sm:w-24 sm:h-24 bg-white dark:bg-card rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm">
              <Share2 className="w-5 h-5 sm:w-10 sm:h-10 text-amber-500" />
            </div>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl sm:rounded-3xl p-2 sm:p-6 flex flex-col h-full border border-blue-100 dark:border-blue-900/30 text-center items-center">
            <h3 className="font-bold text-blue-900 dark:text-blue-200 text-[10px] sm:text-lg mb-1 sm:mb-2 leading-tight">
              Reuse and update past lists
            </h3>
            <p className="text-[9px] sm:text-sm text-blue-700 dark:text-blue-400/80 mb-2 sm:mb-6 flex-1 leading-tight line-clamp-3 sm:line-clamp-none">
              Stop rewriting the same items
            </p>
            <div className="w-10 h-10 sm:w-24 sm:h-24 bg-white dark:bg-card rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm">
              <Recycle className="w-5 h-5 sm:w-10 sm:h-10 text-blue-500" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl sm:rounded-3xl p-2 sm:p-6 flex flex-col h-full border border-emerald-100 dark:border-emerald-900/30 text-center items-center">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-200 text-[10px] sm:text-lg mb-1 sm:mb-2 leading-tight">
              Buy smarter with predictions
            </h3>
            <p className="text-[9px] sm:text-sm text-emerald-700 dark:text-emerald-400/80 mb-2 sm:mb-6 flex-1 leading-tight line-clamp-3 sm:line-clamp-none">
              Know what you likely need
            </p>
            <div className="w-10 h-10 sm:w-24 sm:h-24 bg-white dark:bg-card rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm">
              <Lightbulb className="w-5 h-5 sm:w-10 sm:h-10 text-emerald-500" />
            </div>
          </div>
        </motion.div>
        
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-6 sm:gap-12 mb-10"
        >
          <button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 transition-all duration-200">
              <Plus className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">New List</span>
          </button>
          
          <button 
            onClick={handleReuseLast}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 transition-all duration-200">
              <History className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Reuse Last</span>
          </button>

          <button 
            onClick={() => toast.info("Check back soon to see lists shared with you directly!")}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/60 transition-all duration-200">
              <Share2 className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Shared with Me</span>
          </button>
        </motion.div>

        {/* Smart Suggestions Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate('/templates')}
          className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 rounded-3xl p-5 sm:p-6 cursor-pointer hover:shadow-md hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all mb-12 flex items-center gap-4 group"
        >
          <div className="w-12 h-12 bg-purple-200/50 dark:bg-purple-800/40 rounded-full flex items-center justify-center shrink-0">
            <Lightbulb className="w-6 h-6 text-purple-700 dark:text-purple-300" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-purple-900 dark:text-purple-100 mb-1">Smart Suggestions</h3>
            <p className="text-purple-800/70 dark:text-purple-200/70 text-sm sm:text-base leading-snug">
              Based on your past lists, we've got ideas on what you'll likely need next.
            </p>
          </div>
          <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-6 h-6 text-purple-700 dark:text-purple-300" strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* User's Existing Lists section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6 flex justify-between items-center"
        >
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Your Lists</h2>
          <button 
            onClick={() => navigate("/templates")}
            className="text-sm font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1 hover:underline"
          >
            <FileText className="w-4 h-4" />
            Browse templates
          </button>
        </motion.div>

        {lists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-card rounded-[2rem] border border-dashed border-slate-200 dark:border-border"
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
      <div className="sm:hidden fixed bottom-8 right-6 z-50">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-purple-700 active:scale-95 transition-all ring-4 ring-purple-600/20"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
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