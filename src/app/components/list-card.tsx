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
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/list/${id}`)}
      className={`rounded-3xl transition-all duration-300 cursor-pointer border
        ${compact ? "p-4" : "p-6"}
        ${active 
          ? "bg-muted dark:bg-level-3 border-foreground/30 shadow-xl scale-[1.02]" 
          : "bg-card border-border shadow-md hover:shadow-xl hover:border-foreground/20"
        }
      `}
    >
      <div className={compact ? "mb-2" : "mb-4"}>
        <h3 className={`mb-1 text-foreground ${compact ? "text-sm font-semibold truncate" : "text-lg font-bold"}`}>{title}</h3>
        <div className="mb-1">
          <span className={`inline-flex px-2 py-0.5 bg-foreground/10 text-foreground font-medium rounded-full ${compact ? "text-[10px]" : "text-xs py-1"}`}>
            {category}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
          <Clock className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
          <span>{lastUpdated}</span>
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
