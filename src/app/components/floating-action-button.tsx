import { motion } from "motion/react";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export function FloatingActionButton({ onClick, label = "Add" }: FloatingActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 sm:right-1/2 sm:translate-x-[calc(50%+12rem)] w-16 h-16 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center z-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Plus className="w-7 h-7" strokeWidth={2.5} />
      <span className="sr-only">{label}</span>
    </motion.button>
  );
}