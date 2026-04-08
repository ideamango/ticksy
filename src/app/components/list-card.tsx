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
  compact?: boolean;
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
  compact,
}: ListCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/list/${id}`)}
      className={`rounded-xl transition-all duration-300 cursor-pointer border
        ${compact ? "p-3 sm:p-4" : "p-6"}
        ${active 
          ? "bg-muted/80 dark:bg-level-4 border-highlight ring-1 ring-highlight/30 scale-[1.02]" 
          : "bg-background dark:bg-level-2 border-border hover:border-foreground/10"
        }
      `}
    >
      <div className={compact ? "mb-2" : "mb-4"}>
        <h3 className={`mb-1 text-foreground ${compact ? "text-sm font-semibold truncate" : "text-lg font-bold"}`}>{title}</h3>
        <div className={`flex items-center justify-between gap-2 ${compact ? "mb-2" : "mb-3"}`}>
          <span className={`inline-flex px-2 py-0.5 bg-foreground/10 text-foreground font-medium rounded-full ${compact ? "text-[10px]" : "text-xs py-1"}`}>
            {category}
          </span>
          <div className={`flex items-center gap-1 text-muted-foreground ${compact ? "text-[10px]" : "text-sm"}`}>
            <Clock className={compact ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
            <span>{lastUpdated}</span>
          </div>
        </div>
      </div>

      <AnimatedProgressBar value={completed} max={total} />

      {!compact && completed === total && total > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-3 text-center"
        >
          <span className="inline-flex items-center gap-1.5 text-sm bg-foreground text-background px-3 py-1.5 rounded-full font-bold">
            DONE
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
