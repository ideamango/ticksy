import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface AnimatedProgressBarProps {
  value: number;
  max: number;
}

export function AnimatedProgressBar({ value, max }: AnimatedProgressBarProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = max > 0 ? (value / max) * 100 : 0;

  useEffect(() => {
    // Animate the value change
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-muted-foreground">
          {value} of {max} done
        </span>
        <span className="text-sm font-bold text-foreground">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full h-3 bg-muted dark:bg-level-1 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-highlight rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
