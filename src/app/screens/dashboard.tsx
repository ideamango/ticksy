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
    <div className="min-h-screen bg-background pb-24">
      {/* Mobile-first container with max width for desktop */}
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-6 pt-8 pb-20 rounded-b-[3rem]">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="mb-2">Hey Smita 👋</h1>
            <p className="text-muted-foreground">Let's get things done today!</p>
          </motion.div>
        </div>

        {/* Lists Container */}
        <div className="px-6 -mt-12">
          <div className="space-y-4">
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

            {lists.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">📝</div>
                <h3 className="mb-2">No lists yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first list to get started!
                </p>
              </motion.div>
            )}
          </div>

          {/* Templates Button */}
          <motion.button
            onClick={() => navigate("/templates")}
            className="w-full mt-6 py-4 px-6 rounded-3xl bg-white border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText className="w-5 h-5" />
            Browse Templates
          </motion.button>
        </div>
      </div>

      <FloatingActionButton onClick={() => setIsCreateModalOpen(true)} label="Create new list" />
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateList}
      />
    </div>
  );
}