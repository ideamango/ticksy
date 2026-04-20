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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-popover dark:bg-level-3 rounded-xl p-6 w-full max-w-md shadow-2xl border border-border"
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

        <div className="relative flex bg-muted p-1 mb-6 rounded-full border border-border h-12">
          {/* Sliding Pill Background */}
          <div className="absolute inset-1 flex pointer-events-none">
            <motion.div
              initial={false}
              animate={{ x: activeTab === "new" ? "0%" : "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="w-1/2 h-full bg-highlight shadow-md rounded-full"
            />
          </div>
          
          <button
            onClick={() => setActiveTab("new")}
            className={`relative z-10 flex-1 py-1 text-sm font-bold transition-colors duration-200 ${
              activeTab === "new" ? "text-highlight-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Create New
          </button>
          <button
            onClick={() => setActiveTab("existing")}
            className={`relative z-10 flex-1 py-1 text-sm font-bold transition-colors duration-200 ${
              activeTab === "existing" ? "text-highlight-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Use Existing
          </button>
        </div>

        <div className="min-h-[420px] flex flex-col">
          {activeTab === "new" ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="mb-6">
                <label className="block mb-2 text-sm">List Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Weekly Grocery"
                  className="w-full px-4 py-3 rounded-lg bg-[var(--modal-input-bg)] border border-border text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
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
                        p-3 rounded-xl border transition-all text-center
                        ${selectedCategory === category.id
                          ? "border-transparent bg-highlight text-highlight-foreground shadow-md scale-105"
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
                  w-full py-4 px-4 font-bold transition-all shadow-md mt-auto
                  ${name.trim()
                    ? "bg-highlight text-highlight-foreground"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                  }
                `}
                style={{ borderRadius: "var(--btn-border-radius)" }}
                whileTap={name.trim() ? { scale: 0.98 } : {}}
              >
                Create List
              </motion.button>
            </div>
          ) : (
            <div className="mb-2 h-full flex-1 flex flex-col">
              {lists.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-12 text-center text-muted-foreground bg-[var(--modal-item-bg)] rounded-xl border border-border/50">
                  No existing lists found. <br /> Create a new one first!
                </div>
              ) : (
                <div className="flex-1 max-h-[360px] overflow-auto space-y-2 pr-2 custom-scrollbar">
                  {lists.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setSelectedSource(l);
                        setIsReuseModalOpen(true);
                      }}
                      className="w-full text-left p-4 rounded-xl border border-border bg-[var(--modal-item-bg)] hover:bg-muted/40 transition-all flex justify-between items-center group"
                    >
                      <div>
                        <div className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{`${l.title} ${l.emoji ?? ""}`.trim()}</div>
                        <div className="text-xs text-muted-foreground mt-1 font-medium">{l.items.length} items</div>
                      </div>
                      <div className="p-2 rounded-full bg-foreground/5 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                        <div className="text-foreground text-xs font-bold uppercase tracking-wider">Select</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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
