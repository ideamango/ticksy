import { motion } from "motion/react";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { categories } from "../data/templates";
import type { CategoryId, SharedList } from "../types";
import { useLists } from "../context/list-context";

interface EditListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: SharedList;
}

export function EditListModal({ isOpen, onClose, list }: EditListModalProps) {
  const [name, setName] = useState(list.title);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(list.categoryId);
  const { updateList } = useLists();

  useEffect(() => {
    if (isOpen) {
      setName(list.title);
      setSelectedCategory(list.categoryId);
    }
  }, [isOpen, list]);

  const handleSave = () => {
    if (name.trim()) {
      const category = categories.find((item) => item.id === selectedCategory);
      updateList(list.id, {
        title: name.trim(),
        categoryId: selectedCategory,
        emoji: category?.emoji ?? "📝",
      });
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
        className="bg-card rounded-xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3>Edit List</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm">List Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Weekly Grocery"
            className="w-full px-4 py-3 rounded-lg bg-[var(--modal-input-bg)] border border-border text-foreground outline-none focus:ring-2 focus:ring-ring transition-all"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
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
                  ${
                    selectedCategory === category.id
                      ? "border-transparent bg-highlight text-highlight-foreground shadow-sm scale-105"
                      : "border-border bg-background dark:bg-level-2 text-foreground"
                  }
                `}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-2xl mb-1">{category.emoji}</div>
                <div className="text-xs">{category.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={handleSave}
          disabled={!name.trim() || (name.trim() === list.title && selectedCategory === list.categoryId)}
          className={`
            w-full py-4 px-4 font-bold transition-all shadow-md mt-4
            ${
              name.trim() && (name.trim() !== list.title || selectedCategory !== list.categoryId)
                ? "bg-highlight text-highlight-foreground"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }
          `}
          style={{ borderRadius: "var(--btn-border-radius)" }}
          whileTap={name.trim() ? { scale: 0.98 } : {}}
        >
          Save Changes
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
