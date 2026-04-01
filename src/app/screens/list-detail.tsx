import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Share2, MoreVertical, Plus, Edit2, Trash2 } from "lucide-react";
import { ListItem } from "../components/list-item";
import { ListCard } from "../components/list-card";
import { ShareModal } from "../components/share-modal";
import { ReuseListModal } from "../components/reuse-list-modal";
import { EditListModal } from "../components/edit-list-modal";
import { DeleteListModal } from "../components/delete-list-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { categories, unitOptions } from "../data/templates";
import type { Unit } from "../types";
import { formatLastUpdated, useLists } from "../context/list-context";

export function ListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getListById, addItem, toggleItem, deleteItem, buildShareToken, updateItem, createListWithItems, deleteList, lists } = useLists();
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState(unitOptions[0]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReuseModalOpen, setIsReuseModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleEditItem = (itemId: string, patch: { description?: string; quantity?: string; unit?: string | undefined }) => {
    updateItem(list.id, itemId, { ...patch, unit: patch.unit as Unit | undefined });
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
    <div className="min-h-screen bg-background pb-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6 rounded-b-[2rem] sm:rounded-b-[3rem] sticky top-0 z-10 backdrop-blur-lg mb-6">
          <div className="flex flex-row items-center justify-between gap-2 mb-0">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <motion.button
                onClick={() => navigate("/")}
                className="p-2 bg-white/50 hover:bg-white/80 rounded-full transition-colors shrink-0"
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <h2 className="mb-0 text-xl sm:text-2xl font-bold truncate block w-full">{`${list.title} ${list.emoji ?? ""}`.trim()}</h2>
                <p className="text-sm sm:text-base text-muted-foreground truncate block w-full leading-snug">{categoryLabel}</p>
              </div>
            </div>

            <div className="flex flex-row items-center gap-1 sm:gap-2 shrink-0">
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-nowrap">
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

              <div className="flex gap-2">
                <motion.button
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => setIsReuseModalOpen(true)}
                  className="p-2 hover:bg-white/50 rounded-full transition-colors"
                  whileTap={{ scale: 0.9 }}
                >
                  ♻️
                </motion.button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      className="p-2 hover:bg-white/50 rounded-full transition-colors outline-none cursor-pointer"
                      whileTap={{ scale: 0.9 }}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-card rounded-2xl p-2 shadow-xl border-0">
                    <DropdownMenuItem
                      onClick={() => setIsEditModalOpen(true)}
                      className="gap-2 p-3 rounded-xl cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                      <span>Edit List</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="gap-2 p-3 rounded-xl cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                      <span>Delete List</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main grid: left lists sidebar + right detail */}
        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-6 px-0 -mt-6">
          <aside className="hidden lg:block lg:col-span-1 px-2">
            {/* Sidebar lists (scrollable) */}
            <div className="max-h-[calc(100vh-6rem)] overflow-auto space-y-4 pr-4">
              {/** Render small list overview so users can switch lists on wide screens */}
              {lists.map((l, idx) => (
                <ListCard
                  key={l.id}
                  id={l.id}
                  title={`${l.title} ${l.emoji ?? ""}`.trim()}
                  category={categories.find((c) => c.id === l.categoryId)?.label ?? "Other"}
                  completed={l.items.filter((it) => it.completed).length}
                  total={l.items.length}
                  lastUpdated={formatLastUpdated(l.updatedAt)}
                  index={idx}
                  active={l.id === list.id}
                />
              ))}
            </div>
          </aside>

          <main className="lg:col-span-2 px-2">
            <div className="px-2 mt-6">
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
                    onEdit={handleEditItem}
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
          </main>
        </div>
      </div>

      {/* Fixed Bottom Add Item Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-6 pb-5 sm:pb-8 bg-gradient-to-t from-background via-background to-transparent pointer-events-none z-40">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-card border-2 border-primary/30 focus-within:border-primary shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] p-1.5 flex items-center transition-colors"
          >
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Item Description..."
              className="w-full flex-1 px-3 sm:px-4 py-2.5 bg-transparent border-0 outline-none min-w-[80px] text-sm sm:text-base font-medium placeholder:text-muted-foreground/60"
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            />
            
            <div className="w-px h-6 bg-border/50 mx-1 hidden sm:block shrink-0"></div>

            <input
              type="text"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              placeholder="Qty"
              className="w-12 sm:w-16 px-1 sm:px-2 py-2.5 bg-transparent border-0 outline-none text-center text-sm sm:text-base font-medium placeholder:text-muted-foreground/60"
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            />
            
            <div className="relative w-16 sm:w-24 shrink-0">
              <select
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value as Unit)}
                className="w-full py-2.5 pl-1 pr-5 sm:px-2 bg-transparent border-0 outline-none appearance-none cursor-pointer text-sm sm:text-base font-medium text-muted-foreground"
              >
                {unitOptions.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <motion.button
              onClick={handleAddItem}
              disabled={!newItemName.trim()}
              className={`
                w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0 rounded-[1.25rem] transition-all ml-1
                ${newItemName.trim()
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                }
              `}
              whileTap={newItemName.trim() ? { scale: 0.95 } : {}}
            >
              <Plus className="w-5 h-5" strokeWidth={2.5} />
            </motion.button>
          </motion.div>
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        listName={list.title}
        shareLink={shareLink}
      />
      <ReuseListModal
        isOpen={isReuseModalOpen}
        onClose={() => setIsReuseModalOpen(false)}
        source={list}
        onCreateFromSelection={(name, selectedItemIds, newItems) => {
          const selectedFromSource = list.items.filter((it) => selectedItemIds.includes(it.id)).map((it) => ({ description: it.description, quantity: it.quantity, unit: it.unit as Unit | undefined }));
          // merge selected + newItems
          const itemsToCreate = [...selectedFromSource, ...newItems] as { description: string; quantity?: string; unit?: Unit | undefined }[];
          // default category same as source
          createListWithItems(name, list.categoryId, list.emoji, itemsToCreate);
        }}
      />
      <EditListModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        list={list}
      />
      <DeleteListModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        listName={`${list.title} ${list.emoji ?? ""}`.trim()}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          deleteList(list.id);
          toast.success("List deleted");
          navigate("/", { replace: true });
        }}
      />
    </div>
  );
}