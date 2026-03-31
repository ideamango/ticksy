import { motion, AnimatePresence } from "motion/react";
import { AnimatedCheckbox } from "./animated-checkbox";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface ListItemProps {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ListItem({
  id,
  name,
  quantity,
  unit,
  completed,
  onToggle,
  onDelete,
}: ListItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(id);
    }, 300);
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
            flex items-center gap-3 py-4 px-4 rounded-2xl transition-all group
            ${completed ? "bg-muted/30" : "bg-white"}
          `}
        >
          <AnimatedCheckbox
            checked={completed}
            onChange={() => onToggle(id)}
            id={`item-${id}`}
          />
          
          <div className="flex-1 min-w-0">
            <label
              htmlFor={`item-${id}`}
              className={`
                block cursor-pointer transition-all
                ${completed ? "line-through text-muted-foreground" : "text-foreground"}
              `}
            >
              {name}
            </label>
            {(quantity || unit) && (
              <span className="text-sm text-muted-foreground">
                {quantity} {unit}
              </span>
            )}
          </div>

          <motion.button
            onClick={handleDelete}
            className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/10 rounded-full"
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
            <span className="sr-only">Delete</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}