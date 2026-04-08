import { motion } from "motion/react";
import { Copy } from "lucide-react";
import type { ListTemplate } from "../types";
import { categories } from "../data/templates";

interface InlineViewTemplateProps {
  template: ListTemplate;
  onUse: (template: ListTemplate) => void;
}

export function InlineViewTemplate({ template, onUse }: InlineViewTemplateProps) {
  const category = categories.find((c) => c.id === template.categoryId);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card dark:bg-level-2 rounded-xl border border-border p-6 shadow-sm min-h-[400px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">{`${template.name} ${template.emoji}`}</h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-highlight/10 text-highlight font-bold rounded-full text-xs">
              {category?.label ?? "Other"}
            </span>
            <span className="text-sm text-muted-foreground">{template.items.length} items</span>
          </div>
        </div>
      </div>

      {template.description && (
        <p className="text-muted-foreground mb-8">{template.description}</p>
      )}

      <div className="flex-1 space-y-3 mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Included Items</h3>
        <div className="space-y-2">
          {template.items.map((item, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-3 p-3 bg-background dark:bg-level-3 border border-border rounded-xl"
            >
              <div className="w-5 h-5 rounded-full border-2 border-muted flex-shrink-0" />
              <span className="font-medium">{item.description}</span>
              {(item.quantity || item.unit) && (
                <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                  {item.quantity} {item.unit}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <motion.button
        onClick={() => onUse(template)}
        className="w-full py-4 px-4 bg-highlight text-highlight-foreground font-bold shadow-md flex items-center justify-center gap-2"
        style={{ borderRadius: "var(--btn-border-radius)" }}
        whileTap={{ scale: 0.98 }}
      >
        <Copy className="w-5 h-5" />
        Use this Template
      </motion.button>
    </motion.div>
  );
}
