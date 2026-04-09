import { motion } from "motion/react";
import { useNavigate } from "react-router";

interface ListRowProps {
  id: string;
  title: string;
  category: string;
  completed: number;
  total: number;
  lastUpdated: string;
  index: number;
}

export function ListRow({
  id,
  title,
  category,
  completed,
  total,
  lastUpdated,
  index,
}: ListRowProps) {
  const navigate = useNavigate();
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate(`/list/${id}`)}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors px-2 sm:px-4 rounded-xl sm:rounded-none"
    >
      <div className="flex flex-col gap-1.5 flex-1 w-full sm:w-auto">
        <h3 className="text-base font-semibold text-foreground truncate">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="inline-flex px-2 py-0.5 bg-muted text-muted-foreground font-medium rounded-full text-[10px]">
            {category}
          </span>
          <span className="text-[10px] text-muted-foreground sm:hidden">
            {lastUpdated}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-64 shrink-0">
        <div className="flex-1 max-w-[150px] relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="absolute left-0 top-0 bottom-0 bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, delay: index * 0.05 + 0.2 }}
          />
        </div>
        <div className="w-10 text-right text-sm font-bold text-foreground">
          {Math.round(progress)}%
        </div>
      </div>
    </motion.div>
  );
}
