import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { ChevronLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { categories, templates } from "../data/templates";
import { useLists } from "../context/list-context";
import { useState, useMemo } from "react";
import { UseTemplateModal } from "../components/use-template-modal";
import { TemplateSidebarCard } from "../components/template-sidebar-card";
import { InlineViewTemplate } from "../components/inline-view-template";
import { InlineCreateTemplate } from "../components/inline-create-template";
import { ThemeToggle } from "../components/theme-toggle";
import type { ListTemplate } from "../types";

export function Templates() {
  const navigate = useNavigate();
  const { createFromTemplate, customTemplates, createTemplate } = useLists();

  const allTemplates = useMemo(() => [...customTemplates, ...templates], [customTemplates]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(allTemplates[0]?.id || null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUseModalOpen, setIsUseModalOpen] = useState(false);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);
  const [templateToUse, setTemplateToUse] = useState<ListTemplate | null>(null);

  const selectedTemplate = useMemo(() => 
    allTemplates.find(t => t.id === selectedTemplateId) || allTemplates[0]
  , [allTemplates, selectedTemplateId]);

  const handleUseTemplateRequest = (template: ListTemplate) => {
    setTemplateToUse(template);
    setIsUseModalOpen(true);
  };

  const handleCreateListFromTemplate = (name: string, templateId: string) => {
    const created = createFromTemplate(templateId, name);
    if (!created) {
      toast.error("Could not create a list from this template.");
      return;
    }
    toast.success(`Created list "${created.title}"`);
    navigate(`/list/${created.id}`);
  };

  const handleCreateNewTemplate = (templateData: any) => {
    createTemplate(templateData);
    toast.success("Template created successfully!");
    setIsCreating(false);
    // Select the newly created template (it should be at the start of customTemplates)
    if (customTemplates.length > 0) {
      setSelectedTemplateId(customTemplates[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-level-1 pb-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Modern Sticky Header */}
        <div className="bg-card dark:bg-level-2/95 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6 rounded-b-xl sticky top-0 z-30 backdrop-blur-xl mb-6 border-b border-border shadow-md">
          <div className="flex flex-row items-center justify-between gap-2 mb-0">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <motion.button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 1024 && isMobileDetailOpen) {
                    setIsMobileDetailOpen(false);
                  } else {
                    navigate("/");
                  }
                }}
                className="p-2 bg-background hover:bg-muted rounded-full transition-colors shrink-0 border border-border"
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <h2 className="mb-0 text-lg sm:text-3xl font-extrabold block w-full leading-tight truncate">Templates</h2>
                <p className="text-xs sm:text-base text-muted-foreground truncate block w-full leading-snug">
                  {isCreating ? "Creating new template" : "Start with a ready-made list template"}
                </p>
              </div>
            </div>

            <div className="flex flex-row items-center gap-2 shrink-0">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Split Layout: Sidebar + main panel */}
        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 px-0">
          <aside className={`-ml-1 ${isMobileDetailOpen ? 'hidden lg:block' : 'block w-full'}`}>
            <div className="flex flex-col max-h-[calc(100vh-10rem)] h-full">
              <div className="flex-1 overflow-auto space-y-3 pl-1 pr-4 py-2 custom-scrollbar">
                {allTemplates.map((template) => (
                  <TemplateSidebarCard
                    key={template.id}
                    id={template.id}
                    name={template.name}
                    emoji={template.emoji}
                    category={categories.find((c) => c.id === template.categoryId)?.label ?? "Other"}
                    itemCount={template.items.length}
                    active={selectedTemplateId === template.id && !isCreating}
                    onClick={() => {
                      setSelectedTemplateId(template.id);
                      setIsCreating(false);
                      setIsMobileDetailOpen(true);
                    }}
                  />
                ))}
              </div>
              
              {!isCreating && (
                <div className="mt-4 pr-4">
                  <motion.button
                    onClick={() => {
                      setIsCreating(true);
                      setIsMobileDetailOpen(true);
                    }}
                    className="w-full py-4 bg-highlight text-highlight-foreground rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-5 h-5" />
                    New Template
                  </motion.button>
                </div>
              )}
            </div>
          </aside>

          <main className={`px-2 relative ${!isMobileDetailOpen ? 'hidden lg:block' : 'block w-full'}`}>
            {isCreating ? (
              <InlineCreateTemplate 
                onCancel={() => setIsCreating(false)} 
                onCreate={handleCreateNewTemplate}
              />
            ) : selectedTemplate ? (
              <InlineViewTemplate 
                template={selectedTemplate} 
                onUse={handleUseTemplateRequest}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center text-muted-foreground bg-card/50 rounded-xl border border-dashed border-border">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="mb-2">No template selected</h3>
                <p>Select a template from the sidebar or create a new one.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <UseTemplateModal
        isOpen={isUseModalOpen}
        onClose={() => setIsUseModalOpen(false)}
        template={templateToUse}
        onCreate={handleCreateListFromTemplate}
      />
    </div>
  );
}