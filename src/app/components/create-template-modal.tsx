import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { categories } from "../data/templates";
import type { CategoryId, Unit } from "../types";

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (template: { name: string; description: string; categoryId: CategoryId; emoji: string; items: Array<{ description: string; quantity?: string; unit?: Unit }> }) => void;
}

export function CreateTemplateModal({ isOpen, onClose, onCreate }: CreateTemplateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>("groceries");
  const [items, setItems] = useState<{ id: string; description: string }[]>([
    { id: "1", description: "" },
  ]);

  const handleCreate = () => {
    if (name.trim() && items.some((it) => it.description.trim())) {
      const category = categories.find((item) => item.id === selectedCategory);
      onCreate({
        name: name.trim(),
        description: description.trim() || "A custom template",
        categoryId: selectedCategory,
        emoji: category?.emoji ?? "✨",
        items: items
          .filter((it) => it.description.trim())
          .map((it) => ({ description: it.description.trim() })),
      });
      // reset
      setName("");
      setDescription("");
      setSelectedCategory("groceries");
      setItems([{ id: Date.now().toString(), description: "" }]);
      onClose();
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: "" }]);
  };

  const updateItem = (id: string, desc: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, description: desc } : it)));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((it) => it.id !== id));
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
        className="bg-card rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-2">
          <h3>Create New Template</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">Create a reusable template for your everyday lists.</p>

        <div className="overflow-y-auto pr-2 -mr-2 space-y-6 mb-6">
          <div>
            <label className="block mb-2 text-sm">Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Workout"
              className="w-full px-4 py-3 rounded-2xl bg-input-background border-0 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Exercises for the gym"
              className="w-full px-4 py-3 rounded-2xl bg-input-background border-0 focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div>
            <label className="block mb-3 text-sm">Category</label>
            <div className="grid grid-cols-5 gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    p-2 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center
                    ${selectedCategory === category.id
                      ? "border-primary bg-primary/10"
                      : "border-muted bg-white"
                    }
                  `}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-2xl">{category.emoji}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-3 text-sm">Template Items</label>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, e.target.value)}
                      placeholder={`Item ${index + 1}`}
                      className="flex-1 px-4 py-3 rounded-2xl bg-input-background border-0 focus:ring-2 focus:ring-primary outline-none transition-all"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && item.description.trim()) {
                           addItem();
                        }
                      }}
                       autoFocus={index === items.length - 1 && index > 0}
                    />
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-3 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button
              onClick={addItem}
              className="mt-3 flex items-center gap-2 text-sm text-primary font-medium hover:underline px-2"
            >
              <Plus className="w-4 h-4" /> Add another item
            </button>
          </div>
        </div>

        <motion.button
          onClick={handleCreate}
          disabled={!name.trim() || !items.some((it) => it.description.trim())}
          className={`
            w-full py-3 px-4 rounded-2xl font-semibold transition-all mt-auto
            ${name.trim() && items.some((it) => it.description.trim())
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
            }
          `}
          whileTap={name.trim() && items.some((it) => it.description.trim()) ? { scale: 0.98 } : {}}
        >
          Save Template
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
