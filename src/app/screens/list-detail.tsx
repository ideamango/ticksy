import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Share2, MoreVertical, Plus } from "lucide-react";
import { ListItem } from "../components/list-item";
import { ShareModal } from "../components/share-modal";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { categories, unitOptions } from "../data/templates";
import { useLists } from "../context/list-context";

export function ListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getListById, addItem, toggleItem, deleteItem, buildShareToken } = useLists();
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState(unitOptions[0]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const list = id ? getListById(id) : undefined;

  const completedCount = list?.items.filter((item) => item.completed).length ?? 0;
  const totalCount = list?.items.length ?? 0;

  const sortedItems = useMemo(() => {
    if (!list) return [];
    return [...list.items].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const aStamp = a.completedAt ?? a.createdAt;
      const bStamp = b.completedAt ?? b.createdAt;
      return aStamp - bStamp;
    });
  }, [list]);

  if (!id || !list) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="mb-2">List not found</h2>
          <p className="text-muted-foreground mb-6">This list may have been removed.</p>
          <button
            onClick={() => navigate("/")}
            className="px-5 py-3 bg-primary text-primary-foreground rounded-2xl"
          >
            Back to Lists
          </button>
        </div>
      </div>
    );
  }

  const handleToggleItem = (itemId: string) => {
    const item = list.items.find((i) => i.id === itemId);
    const wasCompleted = item?.completed || false;
    toggleItem(list.id, itemId);

    // Show feedback when item is completed
    if (!wasCompleted) {
      const newCompletedCount = completedCount + 1;

      // If all items are done, trigger confetti
      if (newCompletedCount === totalCount) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          toast.success("🎉 All items completed! Great job!");
        }, 300);
      } else {
        toast.success(`✓ ${item?.description} completed`);
      }
    }
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItem(list.id, itemId);
  };

  const handleAddItem = () => {
    if (newItemName.trim()) {
      addItem(list.id, {
        description: newItemName.trim(),
        quantity: newItemQuantity.trim() || undefined,
        unit: newItemQuantity.trim() ? newItemUnit : undefined,
      });
      setNewItemName("");
      setNewItemQuantity("");
      setNewItemUnit(unitOptions[0]);
    }
  };

  const categoryLabel = categories.find((category) => category.id === list.categoryId)?.label ?? "Other";
  const token = buildShareToken(list.id);
  const shareLink = token
    ? `${window.location.origin}/?import=${token}`
    : window.location.href;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Mobile-first container with max width for desktop */}
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-6 pt-8 pb-8 rounded-b-[3rem] sticky top-0 z-10 backdrop-blur-lg">
          <div className="flex items-center justify-between mb-6">
            <motion.button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>

            <div className="flex gap-2">
              <motion.button
                onClick={() => setIsShareModalOpen(true)}
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="p-2 hover:bg-white/50 rounded-full transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <MoreVertical className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          <h2 className="mb-2">{`${list.title} ${list.emoji ?? ""}`.trim()}</h2>
          <p className="text-sm text-muted-foreground mb-2">{categoryLabel}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">
              {completedCount}/{totalCount} done
            </span>
            {completedCount === totalCount && totalCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-accent/20 text-accent-foreground rounded-full"
              >
                🎉 All done!
              </motion.span>
            )}
          </div>
        </div>

        {/* Add Item Section */}
        <div className="px-6 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-4 shadow-md mb-6"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Add item..."
                className="w-full px-4 py-3 rounded-2xl bg-input-background border-0 focus:ring-2 focus:ring-primary outline-none transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              />

              <div className="flex gap-3">
                <input
                  type="text"
                  value={newItemQuantity}
                  onChange={(e) => setNewItemQuantity(e.target.value)}
                  placeholder="Qty"
                  className="w-20 px-4 py-3 rounded-2xl bg-input-background border-0 focus:ring-2 focus:ring-primary outline-none transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                />

                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-input-background border-0 focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>

                <motion.button
                  onClick={handleAddItem}
                  disabled={!newItemName.trim()}
                  className={`
                    px-6 py-3 rounded-2xl font-semibold transition-all flex items-center gap-2
                    ${newItemName.trim()
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                    }
                  `}
                  whileTap={newItemName.trim() ? { scale: 0.95 } : {}}
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Items List */}
          <div className="space-y-2">
            {sortedItems.map((item) => (
              <ListItem
                key={item.id}
                id={item.id}
                name={item.description}
                quantity={item.quantity}
                unit={item.unit}
                completed={item.completed}
                onToggle={handleToggleItem}
                onDelete={handleDeleteItem}
              />
            ))}

            {list.items.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">📋</div>
                <h3 className="mb-2">No items yet</h3>
                <p className="text-muted-foreground">
                  Add your first item to get started!
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        listName={list.title}
        shareLink={shareLink}
      />
    </div>
  );
}