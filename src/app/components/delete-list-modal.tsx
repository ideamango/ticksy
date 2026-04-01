import { motion } from "motion/react";
import { X, Trash2 } from "lucide-react";

interface DeleteListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  listName: string;
}

export function DeleteListModal({ isOpen, onClose, onConfirm, listName }: DeleteListModalProps) {
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
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center"
      >
        <div className="flex justify-center mb-4 text-destructive">
          <div className="p-4 bg-destructive/10 rounded-full">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <h3 className="mb-2">Delete List?</h3>
        <p className="text-muted-foreground mb-6">
          Are you sure you want to delete "{listName}"? This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <motion.button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-muted text-foreground font-semibold hover:bg-muted/80 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-2xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            Delete
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
