import { motion } from "motion/react";
import { Check } from "lucide-react";
import { useState } from "react";

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export function AnimatedCheckbox({ checked, onChange, id }: AnimatedCheckboxProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleChange = () => {
    if (!checked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
    onChange(!checked);
  };

  return (
    <motion.button
      type="button"
      id={id}
      onClick={handleChange}
      className={`
        relative flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all group-hover:border-foreground/60
        ${
          checked
            ? "bg-foreground border-foreground shadow-[0_0_15px_rgba(255,255,255,0.1)]"
            : "bg-background border-foreground/30"
        }
      `}
      whileTap={{ scale: 0.9 }}
      animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
    >
      {checked && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <Check className="w-4 h-4 text-background" strokeWidth={4} />
        </motion.div>
      )}
    </motion.button>
  );
}
