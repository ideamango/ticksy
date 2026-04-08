import { motion } from "motion/react";
import { Clock } from "lucide-react";

interface TemplateSidebarCardProps {
  id: string;
  name: string;
  emoji: string;
  category: string;
  itemCount: number;
  active?: boolean;
  onClick: () => void;
}

export function TemplateSidebarCard({
  name,
  emoji,
  category,
  itemCount,
  active,
  onClick,
}: TemplateSidebarCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-xl transition-all duration-300 cursor-pointer border p-3 sm:p-4
        ${active 
          ? "bg-muted/80 dark:bg-level-4 border-highlight ring-1 ring-highlight/30 scale-[1.02]" 
          : "bg-background dark:bg-level-2 border-border hover:border-foreground/10"
        }
      `}
    >
      <div className="mb-2">
        <h3 className="mb-1 text-foreground text-sm font-semibold truncate">{`${name} ${emoji}`.trim()}</h3>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex px-2 py-0.5 bg-foreground/10 text-foreground font-medium rounded-full text-[10px]">
            {category}
          </span>
          <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
            <span>{itemCount} items</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
