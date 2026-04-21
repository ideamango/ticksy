import { motion, AnimatePresence } from "motion/react";
import { AnimatedCheckbox } from "./animated-checkbox";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { useState, useRef, type MouseEvent } from "react";
import { unitOptions } from "../data/templates";

interface ListItemProps {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string, patch: { description?: string; quantity?: string; unit?: string }) => void;
}

export function ListItem({
  id,
  name,
  quantity,
  unit,
  completed,
  onToggle,
  onDelete,
  onEdit,
}: ListItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(name);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [editQuantity, setEditQuantity] = useState(quantity ?? "");
  const [editUnit, setEditUnit] = useState<string | undefined>(unit);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(id);
    }, 250);
  };

  const startEditing = (e: MouseEvent) => {
    e.stopPropagation();
    setEditText(name);
    setEditQuantity(quantity ?? "");
    setEditUnit(unit);
    setIsEditing(true);
    setIsActionsOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitEdit = () => {
    const trimmed = editText.trim();
    const qty = editQuantity.trim() || undefined;
    const u = editUnit || undefined;
    setIsEditing(false);
    if (
      trimmed !== name ||
      qty !== (quantity || undefined) ||
      u !== (unit || undefined)
    ) {
      onEdit?.(id, { description: trimmed || undefined, quantity: qty, unit: u });
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditText(name);
  };

  return (
    <AnimatePresence>
      {!isDeleting && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.2 }}
          layout
        >
          {isEditing ? (
            // ── Inline edit row ──────────────────────────────────────────
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-foreground/30 bg-card shadow-sm mb-1"
            >
              <input
                ref={inputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
                className="flex-1 min-w-0 bg-transparent outline-none text-sm font-medium text-foreground placeholder:text-muted-foreground"
                placeholder="Item name…"
              />
              <input
                value={editQuantity}
                onChange={(e) => setEditQuantity(e.target.value)}
                placeholder="Qty"
                className="w-12 bg-transparent outline-none text-center text-sm text-muted-foreground border-l border-border pl-2"
                onKeyDown={(e) => { if (e.key === "Enter") commitEdit(); }}
              />
              <select
                value={editUnit ?? ""}
                onChange={(e) => setEditUnit(e.target.value || undefined)}
                className="bg-transparent outline-none text-sm text-muted-foreground border-l border-border pl-2 max-w-[70px]"
              >
                <option value="">unit</option>
                {unitOptions.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <button
                onClick={commitEdit}
                className="p-1.5 rounded-full bg-highlight text-highlight-foreground hover:opacity-90 transition-opacity shrink-0"
                aria-label="Save"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={cancelEdit}
                className="p-1.5 rounded-full hover:bg-muted transition-colors shrink-0"
                aria-label="Cancel"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </motion.div>
          ) : (
            // ── Compact list row ─────────────────────────────────────────
            <div
              className={`
                group flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200
                ${completed
                  ? "opacity-50"
                  : "hover:bg-muted/40 dark:hover:bg-level-2/60"
                }
              `}
            >
              <AnimatedCheckbox
                checked={completed}
                onChange={() => onToggle(id)}
                id={`item-${id}`}
              />

              {/* Name + qty badge */}
              <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
                <span
                  className={`
                    text-sm font-medium leading-tight truncate transition-all
                    ${completed ? "line-through text-muted-foreground" : "text-foreground"}
                  `}
                >
                  {name}
                </span>
                {(quantity || unit) && (
                  <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground leading-none">
                    {[quantity, unit].filter(Boolean).join(" ")}
                  </span>
                )}
              </div>

              {/* Action buttons — desktop: appear on hover; mobile: toggle */}
              <div className="flex items-center gap-0.5 shrink-0">
                {/* Mobile toggle */}
                <motion.button
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    setIsActionsOpen((v) => !v);
                  }}
                  className="sm:hidden p-1.5 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                  whileTap={{ scale: 0.85 }}
                  aria-label="Actions"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="8" cy="3" r="1.2" />
                    <circle cx="8" cy="8" r="1.2" />
                    <circle cx="8" cy="13" r="1.2" />
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {isActionsOpen && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex items-center gap-0.5 overflow-hidden sm:hidden"
                    >
                      {onEdit && (
                        <motion.button
                          onClick={startEditing}
                          whileTap={{ scale: 0.85 }}
                          className="p-1.5 hover:bg-secondary/15 rounded-full transition-colors"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-foreground" />
                        </motion.button>
                      )}
                      <motion.button
                        onClick={handleDelete}
                        whileTap={{ scale: 0.85 }}
                        className="p-1.5 hover:bg-destructive/10 rounded-full transition-colors"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Desktop hover actions */}
                {onEdit && (
                  <motion.button
                    onClick={startEditing}
                    whileTap={{ scale: 0.85 }}
                    className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-secondary/15 rounded-full items-center justify-center"
                    aria-label="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </motion.button>
                )}
                <motion.button
                  onClick={handleDelete}
                  whileTap={{ scale: 0.85 }}
                  className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 rounded-full items-center justify-center"
                  aria-label="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}