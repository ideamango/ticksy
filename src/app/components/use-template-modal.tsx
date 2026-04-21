import { motion } from "motion/react";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import type { ListTemplate } from "../types";

interface UseTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ListTemplate | null;
  onCreate: (name: string, templateId: string) => void;
}

export function UseTemplateModal({ isOpen, onClose, template, onCreate }: UseTemplateModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (template) {
      setName(template.name);
    }
  }, [template]);

  const handleCreate = () => {
    if (name.trim() && template) {
      onCreate(name.trim(), template.id);
      onClose();
    }
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-xl p-6 w-full max-w-md shadow-2xl relative"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="flex items-center gap-2">
            <span className="text-2xl">{template.emoji}</span>
            Use Template
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          You are starting a new list using the <strong>{template.name}</strong> template, which contains {template.items.length} items.
        </p>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">Name your list</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[var(--modal-input-bg)] border border-border text-foreground outline-none focus:border-white/80 focus:ring-1 focus:ring-white/20 transition-colors"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
        </div>

        <motion.button
          onClick={handleCreate}
          disabled={!name.trim()}
          className={`
            mt-4 w-full border border-white/50 py-4 px-4 font-bold transition-all shadow-md
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
      </motion.div>
    </div>
  );
}
