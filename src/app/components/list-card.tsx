import { motion } from "motion/react";
import { AnimatedProgressBar } from "./animated-progress-bar";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router";

interface ListCardProps {
  id: string;
  title: string;
  category: string;
  completed: number;
  total: number;
  lastUpdated: string;
  index: number;
  active?: boolean;
}

export function ListCard({
  id,
  title,
  category,
  completed,
  total,
  lastUpdated,
  index,
  active,
}: ListCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/list/${id}`)}
      className={`rounded-3xl p-6 transition-shadow cursor-pointer
        ${active ? "bg-primary/5 border-2 border-primary" : "bg-card shadow-md hover:shadow-xl"}
      `}
    >
      <div className="mb-4">
        <h3 className="mb-1">{title}</h3>
        <div className="mb-2">
          <span className="inline-flex px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
            {category}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{lastUpdated}</span>
        </div>
      </div>

      <AnimatedProgressBar value={completed} max={total} />

      {completed === total && total > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-3 text-center"
        >
          <span className="inline-flex items-center gap-1.5 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
            🎉 Complete!
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
