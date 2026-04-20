import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ChevronLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import { categories, templates } from "../data/templates";
import { useLists } from "../context/list-context";
import { ThemeToggle } from "../components/theme-toggle";

export function Templates() {
  const navigate = useNavigate();
  const { createFromTemplate } = useLists();

  const handleUseTemplate = (templateId: string) => {
    const created = createFromTemplate(templateId);
    if (!created) {
      toast.error("Could not create a list from this template.");
      return;
    }
    toast.success(`Created list from "${created.title}" template`);
    navigate(`/list/${created.id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Responsive container for desktop */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-6 pt-6 sm:pt-8 pb-6 rounded-b-[3rem] sticky top-0 z-20 backdrop-blur-xl mb-6 border-b border-border/60 shadow-md font-sans min-h-[108px] sm:min-h-[124px]">
          <div className="flex items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4 min-w-0 flex-1">
            <motion.button
              onClick={() => navigate("/")}
              className="p-2 bg-background hover:bg-muted rounded-full transition-colors shrink-0 border border-border"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

              <div className="min-w-0 flex flex-col justify-center">
                <h2 className="text-xl sm:text-3xl font-extrabold leading-tight truncate">Templates</h2>
                <p className="text-[10px] sm:text-sm text-muted-foreground font-medium truncate leading-snug">
                  Start with a ready-made list template
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="mt-6">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 sm:gap-5 lg:gap-6 justify-items-center">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-full min-h-[196px] max-w-[360px] sm:max-w-[400px] lg:max-w-[420px] rounded-3xl p-5 sm:p-6 border border-border bg-card text-foreground shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="truncate leading-tight">{template.name}</h3>
                    <div className="text-2xl leading-none shrink-0">{template.emoji}</div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">
                    {template.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <div className="flex items-center gap-2 text-xs min-w-0">
                      <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full truncate">
                        {categories.find((item) => item.id === template.categoryId)?.label ?? "Other"}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {template.items.length} items
                      </span>
                    </div>

                    <motion.button
                      onClick={() => handleUseTemplate(template.id)}
                      className="group/icon h-9 w-9 rounded-lg border border-border bg-background/70 text-foreground transition-all duration-200 flex items-center justify-center hover:scale-110 hover:text-primary hover:bg-primary/10"
                      whileTap={{ scale: 0.95 }}
                      title="Use template"
                      aria-label={`Use ${template.name} template`}
                    >
                      <Copy className="w-4 h-4 transition-transform duration-200 group-hover/icon:scale-110" strokeWidth={2.2} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Custom Template Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: templates.length * 0.1 }}
            className="mt-6 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-3xl p-6 text-center"
          >
            <div className="text-4xl mb-3">✨</div>
            <h3 className="mb-2">Create Your Own Template</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Save any list as a reusable template
            </p>
            <motion.button
              onClick={() => alert('Template creation coming soon!')}
              className="px-6 py-2 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/80 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              Create New Template
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}