import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { categories } from "../data/templates";
import type { CategoryId, Unit } from "../types";

interface InlineCreateTemplateProps {
  onCancel: () => void;
  onCreate: (template: { 
    name: string; 
    description: string; 
    categoryId: CategoryId; 
    emoji: string; 
    items: Array<{ description: string; quantity?: string; unit?: Unit }> 
  }) => void;
}

export function InlineCreateTemplate({ onCancel, onCreate }: InlineCreateTemplateProps) {
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

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card dark:bg-level-2 rounded-xl border border-border p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold mb-1">Create New Template</h2>
          <p className="text-sm text-muted-foreground">Define your reusable list template.</p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly Workout"
              className="w-full px-4 py-3 rounded-lg bg-background dark:bg-level-3 border border-border text-foreground outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Exercises for the gym"
              className="w-full px-4 py-3 rounded-lg bg-background dark:bg-level-3 border border-border text-foreground outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block mb-3 text-sm font-medium">Category / Emoji</label>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  p-2 rounded-xl border transition-all text-center flex flex-col items-center justify-center
                  ${selectedCategory === category.id
                    ? "border-transparent bg-highlight text-highlight-foreground shadow-sm scale-110"
                    : "border-border bg-background dark:bg-level-3 text-foreground hover:border-foreground/20"
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
          <label className="block mb-3 text-sm font-medium">Template Items</label>
          <div className="space-y-2 max-h-[300px] overflow-auto pr-2 custom-scrollbar">
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
                    className="flex-1 px-4 py-3 rounded-lg bg-background dark:bg-level-3 border border-border text-foreground outline-none focus:border-foreground focus:ring-1 focus:ring-foreground transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && item.description.trim()) {
                        addItem();
                      }
                    }}
                  />
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-3 text-muted-foreground hover:text-red-500 transition-colors"
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
            className="mt-3 flex items-center gap-2 text-sm text-highlight font-bold hover:underline px-2"
          >
            <Plus className="w-4 h-4" /> Add another item
          </button>
        </div>
      </div>

      <div className="mt-8">
        <motion.button
          onClick={handleCreate}
          disabled={!name.trim() || !items.some((it) => it.description.trim())}
          className={`
            w-full py-4 px-4 font-bold transition-all shadow-md
            ${name.trim() && items.some((it) => it.description.trim())
              ? "bg-highlight text-highlight-foreground"
              : "bg-muted text-muted-foreground cursor-not-allowed"
            }
          `}
          style={{ borderRadius: "var(--btn-border-radius)" }}
          whileTap={name.trim() && items.some((it) => it.description.trim()) ? { scale: 0.98 } : {}}
        >
          Save Template
        </motion.button>
      </div>
    </motion.div>
  );
}
