import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ListCard } from "../components/list-card";
import { FloatingActionButton } from "../components/floating-action-button";
import { CreateListModal } from "../components/create-list-modal";
import { useNavigate, useSearchParams } from "react-router";
import { FileText } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-6 pt-8 pb-20 rounded-b-[3rem] sticky top-0 z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between"
          >
            <div>
              <h1 className="mb-2 text-3xl sm:text-4xl">Hey Smita 👋</h1>
              <p className="text-muted-foreground">Let's get things done today!</p>
            </div>
          </motion.div>
        </div>

        {/* Lists grid for wider screens; mobile-first grid */}
        <div className="-mt-12">
          {lists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="text-6xl mb-4">📝</div>
              <h3 className="mb-2">No lists yet</h3>
              <p className="text-muted-foreground mb-6">Create your first list to get started!</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2">
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

      {/* Fixed bottom navigation bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[calc(100%_-_3rem)] sm:w-[calc(100%_-_4rem)] max-w-5xl flex items-center p-2 sm:p-4 gap-2 sm:gap-4 bg-card/95 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 border border-black/5">
        <motion.button
          onClick={() => navigate("/templates")}
          className="flex-1 py-3 px-2 sm:px-4 rounded-2xl bg-muted/30 sm:bg-white border-2 border-transparent sm:border-dashed sm:border-muted-foreground/30 text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FileText className="w-5 h-5 shrink-0" />
          <span className="font-medium text-sm sm:text-base whitespace-nowrap">Browse Templates</span>
        </motion.button>

        <motion.button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex-1 py-3 px-2 sm:px-4 rounded-2xl bg-primary text-primary-foreground shadow-md flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14M5 12h14" />
          </svg>
          <span className="font-semibold text-sm sm:text-base whitespace-nowrap">Add List</span>
        </motion.button>
      </div>
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateList}
      />
    </div>
  );
}