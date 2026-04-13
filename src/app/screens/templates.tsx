import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ChevronLeft, Copy } from "lucide-react";
import { toast } from "sonner";
import { categories, templates } from "../data/templates";
import { useLists } from "../context/list-context";

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
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-6 pt-8 pb-8 rounded-b-[3rem] sticky top-0 z-10">
          <div className="flex items-center gap-4 mb-4">
            <motion.button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <h2>Templates</h2>
          </div>
          <p className="text-muted-foreground">
            Start with a ready-made list template
          </p>
        </div>

        {/* Templates Grid */}
        <div className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="mb-4">
                  <div className="text-4xl mb-3">{template.emoji}</div>
                  <h3 className="mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {template.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {categories.find((item) => item.id === template.categoryId)?.label ?? "Other"}
                    </span>
                    <span className="text-muted-foreground">
                      {template.items.length} items
                    </span>
                  </div>
                </div>

                <motion.button
                  onClick={() => handleUseTemplate(template.id)}
                  className="w-full py-3 px-4 rounded-2xl bg-primary text-primary-foreground font-semibold sm:opacity-0 sm:group-hover:opacity-100 transition-all flex items-center justify-center gap-2"
                  whileTap={{ scale: 0.95 }}
                >
                  <Copy className="w-4 h-4" />
                  Use Template
                </motion.button>
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