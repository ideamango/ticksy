import { motion } from "motion/react";
import { X } from "lucide-react";
import { useState } from "react";
import { categories } from "../data/templates";
import type { CategoryId } from "../types";
import { useLists } from "../context/list-context";
import { ReuseListModal } from "./reuse-list-modal";

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, category: CategoryId, emoji: string) => void;
}

export function CreateListModal({ isOpen, onClose, onCreate }: CreateListModalProps) {
  const [activeTab, setActiveTab] = useState<"new" | "existing">("new");
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("groceries");
  const { lists, createListWithItems } = useLists();
  const [selectedSource, setSelectedSource] = useState<any | undefined>(undefined);
  const [isReuseModalOpen, setIsReuseModalOpen] = useState(false);

  const handleCreate = () => {
    if (name.trim()) {
      const category = categories.find((item) => item.id === selectedCategory);
      onCreate(name.trim(), selectedCategory, category?.emoji ?? "📝");
      setName("");
      setSelectedCategory("groceries");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-popover dark:bg-level-3 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3>Add List</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex bg-muted p-1 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab("new")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "new" ? "bg-highlight shadow-md text-highlight-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create New
          </button>
          <button
            onClick={() => setActiveTab("existing")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === "existing" ? "bg-highlight shadow-md text-highlight-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Use Existing
          </button>
        </div>

        {activeTab === "new" ? (
          <>
            <div className="mb-6">
              <label className="block mb-2 text-sm">List Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Weekly Grocery"
                className="w-full px-4 py-3 rounded-2xl bg-input-background border-0 focus:ring-2 focus:ring-primary outline-none transition-all"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>

            <div className="mb-6">
              <label className="block mb-3 text-sm">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      p-3 rounded-2xl border transition-all text-center
                      ${selectedCategory === category.id
                        ? "border-transparent bg-highlight text-highlight-foreground shadow-lg scale-105"
                        : "border-border bg-background dark:bg-level-2 text-foreground"
                      }
                    `}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-2xl mb-1">{category.emoji}</div>
                    <div className="text-xs font-bold">{category.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            <motion.button
              onClick={handleCreate}
              disabled={!name.trim()}
              className={`
                w-full py-4 px-4 rounded-2xl font-bold transition-all shadow-xl
                ${name.trim()
                  ? "bg-highlight text-highlight-foreground"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
                }
              `}
              whileTap={name.trim() ? { scale: 0.98 } : {}}
            >
              Create List
            </motion.button>
          </>
        ) : (
          <div className="mb-2">
            {lists.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl">
                No existing lists found. Create a new one first!
              </div>
            ) : (
              <div className="max-h-[300px] overflow-auto space-y-2 pr-2">
                {lists.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      setSelectedSource(l);
                      setIsReuseModalOpen(true);
                    }}
                    className="w-full text-left p-4 rounded-2xl border border-border bg-background dark:bg-level-2 hover:bg-muted transition-all flex justify-between items-center group"
                  >
                    <div>
                      <div className="font-bold text-foreground">{`${l.title} ${l.emoji ?? ""}`.trim()}</div>
                      <div className="text-xs text-muted-foreground mt-1">{l.items.length} items</div>
                    </div>
                    <div className="text-foreground opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold">
                      Select
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <ReuseListModal
          isOpen={isReuseModalOpen && !!selectedSource}
          onClose={() => setIsReuseModalOpen(false)}
          source={selectedSource}
          onCreateFromSelection={(newName, selectedItemIds, newItems) => {
            if (!selectedSource) return;
            const selectedFromSource = selectedSource.items
              .filter((it: any) => selectedItemIds.includes(it.id))
              .map((it: any) => ({ description: it.description, quantity: it.quantity, unit: it.unit }));
            const itemsToCreate = [...selectedFromSource, ...newItems];
            createListWithItems(newName, selectedSource.categoryId, selectedSource.emoji, itemsToCreate);
            setIsReuseModalOpen(false);
            onClose();
          }}
        />
      </motion.div>
    </motion.div>
  );
}
