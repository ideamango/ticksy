import { motion } from "motion/react";
import { X } from "lucide-react";
import { useState } from "react";
import { categories } from "../data/templates";
import type { CategoryId } from "../types";

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, category: CategoryId, emoji: string) => void;
}

export function CreateListModal({ isOpen, onClose, onCreate }: CreateListModalProps) {
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("groceries");

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
        className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3>Create New List</h3>
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
                  p-3 rounded-2xl border-2 transition-all text-center
                  ${selectedCategory === category.id
                    ? "border-primary bg-primary/10"
                    : "border-muted bg-white"
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
          onClick={handleCreate}
          disabled={!name.trim()}
          className={`
            w-full py-3 px-4 rounded-2xl font-semibold transition-all
            ${name.trim()
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
            }
          `}
          whileTap={name.trim() ? { scale: 0.98 } : {}}
        >
          Create List
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
