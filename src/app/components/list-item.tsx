import { motion, AnimatePresence } from "motion/react";
import { AnimatedCheckbox } from "./animated-checkbox";
import { Trash2, Edit2, MoreVertical } from "lucide-react";
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
  const [showMobileActions, setShowMobileActions] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(id);
    }, 300);
  };

  const startEditing = (e: MouseEvent) => {
    e.stopPropagation();
    setEditText(name);
    setIsEditing(true);
    // focus next tick
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
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          layout
          className={`
            flex items-center gap-3 py-4 px-4 rounded-2xl transition-all duration-300 group
            ${completed 
              ? "bg-muted dark:bg-level-1 opacity-60 scale-[0.98]" 
              : "bg-card dark:bg-level-2 border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5"
            }
          `}
        >
          <AnimatedCheckbox
            checked={completed}
            onChange={() => onToggle(id)}
            id={`item-${id}`}
          />

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  ref={inputRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-muted bg-white outline-none"
                />
                <div className="flex gap-2">
                  <input
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    placeholder="Qty"
                    className="w-24 px-2 py-1 rounded-lg border border-muted bg-white outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                    }}
                  />
                  <select
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-muted bg-white outline-none"
                  >
                    <option value="">unit</option>
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div
                className={`
                  block transition-all select-text
                  ${completed ? "line-through text-muted-foreground" : "text-foreground"}
                `}
              >
                {name}
              </div>
            )}
            {(quantity || unit) && (
              <span className="text-sm text-muted-foreground">
                {quantity} {unit}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Mobile: show MoreVertical toggle */}
            <motion.button
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                setShowMobileActions(!showMobileActions);
              }}
              className="sm:hidden p-2 hover:bg-muted/50 rounded-full transition-colors"
              whileTap={{ scale: 0.9 }}
              aria-label="Actions"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </motion.button>

            {/* Desktop: show on group hover | Mobile: show when toggled */}
            <AnimatePresence>
              {(showMobileActions || undefined) && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-1 overflow-hidden sm:hidden"
                >
                  {onEdit && (
                    <motion.button
                      onClick={startEditing}
                      className="p-2 hover:bg-secondary/10 rounded-full"
                      whileTap={{ scale: 0.9 }}
                      aria-label="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-foreground" />
                    </motion.button>
                  )}
                  <motion.button
                    onClick={handleDelete}
                    className="p-2 hover:bg-destructive/10 rounded-full"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                    <span className="sr-only">Delete</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Desktop hover actions */}
            {onEdit && (
              <motion.button
                onClick={startEditing}
                className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-secondary/10 rounded-full"
                whileTap={{ scale: 0.9 }}
                aria-label="Edit"
              >
                <Edit2 className="w-4 h-4 text-foreground" />
              </motion.button>
            )}
            <motion.button
              onClick={handleDelete}
              className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-full"
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
              <span className="sr-only">Delete</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}