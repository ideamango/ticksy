import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ListCard } from "../components/list-card";
import { CreateListModal } from "../components/create-list-modal";
import { useNavigate, useSearchParams } from "react-router";
import { FileText, Receipt, Share2, Recycle, Lightbulb, PlusCircle, History, ChevronRight, CheckSquare, Clock, Bell } from "lucide-react";
import { ListRow } from "../components/list-row";
import { toast } from "sonner";
import { categories } from "../data/templates";
import { formatLastUpdated, useLists } from "../context/list-context";
import { ThemeToggle } from "../components/theme-toggle";
import { LoginStatusButton } from "../components/login-status-button";
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

      <div className="bg-card w-full h-full min-h-[calc(100vh-3rem)] rounded-none md:rounded-3xl border-0 md:border md:border-border shadow-sm overflow-hidden flex flex-col md:m-0">

        {/* Top Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-border bg-card sticky top-0 z-10 w-full">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Ticksy</h1>
          </div>
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

        <div className="p-6 sm:p-8 flex-1 w-full max-w-5xl mx-auto">
          {/* Stats Section (Mock Data for realigning) */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Stats</h2>
            <div className="flex flex-wrap items-center gap-8 sm:gap-16 text-sm">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <span className="w-5 h-5 flex items-center justify-center bg-muted rounded">
                  <CheckSquare className="w-3 h-3" />
                </span>
                saved hours
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" /> 12.9 hours
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" /> 2.59 hours
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" /> 1.30 hours
              </div>
            </div>
          </div>
          {/* Quick Action Chips (former cards) */}
          <div className="mb-10">
            <h2 className="text-lg font-bold text-foreground mb-4">Quick Action Chips</h2>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-semibold rounded-full hover:opacity-90 transition-opacity whitespace-nowrap text-sm"
              >
                <PlusCircle className="w-4 h-4" /> Create New List
              </button>
              <button
                onClick={handleReuseLast}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground font-medium rounded-full hover:bg-muted/80 transition-colors whitespace-nowrap text-sm"
              >
                <Recycle className="w-4 h-4" /> Reuse Past
              </button>
              <button
                onClick={() => toast.info("Check back soon to see lists shared with you directly!")}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground font-medium rounded-full hover:bg-muted/80 transition-colors whitespace-nowrap text-sm"
              >
                <Share2 className="w-4 h-4" /> Share Lists
              </button>
              <button
                onClick={() => navigate('/templates')}
                className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground font-medium rounded-full hover:bg-muted/80 transition-colors whitespace-nowrap text-sm"
              >
                <Lightbulb className="w-4 h-4" /> Smart Suggestions
              </button>
            </div>
          </div>


          {/* User's Existing Lists section */}
          <motion.div
            id="your-lists"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 flex justify-between items-center scroll-mt-32"
          >
            <h2 className="text-lg font-bold text-foreground mb-2">Your Lists</h2>
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
              className="text-center py-16 bg-white dark:bg-card rounded-xl border border-dashed border-slate-200 dark:border-border mt-4"
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-semibold text-lg mb-2">No lists yet</h3>
              <p className="text-slate-500 dark:text-muted-foreground mb-6 max-w-sm mx-auto">
                Create your first list or browse templates to get started!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 sm:pb-4 border-t border-border mt-2 pt-4">
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
      </div>

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