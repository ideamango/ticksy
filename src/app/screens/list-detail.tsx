import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Share2, MoreVertical, Plus, Edit2, Trash2 } from "lucide-react";
import { ListItem } from "../components/list-item";
import { ListCard } from "../components/list-card";
import { ShareModal } from "../components/share-modal";
import { ReuseListModal } from "../components/reuse-list-modal";
import { EditListModal } from "../components/edit-list-modal";
import { DeleteListModal } from "../components/delete-list-modal";
import { CreateListModal } from "../components/create-list-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { categories, unitOptions } from "../data/templates";
import type { CategoryId, Unit } from "../types";
import { formatLastUpdated, useLists } from "../context/list-context";
import { ReuseCircularIcon } from "../components/icons/reuse-circular-icon";

export function ListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getListById, fetchListAndJoin, addItem, toggleItem, deleteItem, buildShareToken, updateItem, createList, createListWithItems, deleteList, lists } = useLists();
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState(unitOptions[0]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReuseModalOpen, setIsReuseModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const list = id ? getListById(id) : undefined;
  const hasLists = lists.length > 0;
  const isListsIndexView = hasLists && !list;

  useEffect(() => {
    if (id) {
      fetchListAndJoin(id);
    }
  }, [id, fetchListAndJoin]);

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

  const pendingItems = sortedItems.filter((i) => !i.completed);
  const completedItems = sortedItems.filter((i) => i.completed);

  const categoryLabel = list ? (categories.find((category) => category.id === list.categoryId)?.label ?? "Other") : "";
  const headerSubtitle = list ? categoryLabel : "Manage and switch your shared lists.";
  const doneLabel = `${completedCount}/${totalCount} DONE`;

  const handleToggleItem = (itemId: string) => {
    if (!list) return;
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
    if (!list) return;
    deleteItem(list.id, itemId);
  };

  const handleEditItem = (itemId: string, patch: { description?: string; quantity?: string; unit?: string | undefined }) => {
    if (!list) return;
    updateItem(list.id, itemId, { ...patch, unit: patch.unit as Unit | undefined });
  };

  const handleAddItem = () => {
    if (!list) return;
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

  const handleCreateList = (name: string, categoryId: CategoryId, emoji: string) => {
    const created = createList(name, categoryId, emoji);
    setIsCreateModalOpen(false);
    navigate(`/list/${created.id}`);
  };

  const token = list ? buildShareToken(list.id) : null;
  const baseUrl = window.location.origin;
  const shareLink = token
    ? `${baseUrl}/?import=${token}`
    : window.location.href;

  return (
    <div
      className={`${isListsIndexView
        ? "h-full overflow-hidden pb-0 lg:min-h-screen lg:overflow-visible lg:pb-40"
        : "min-h-screen pb-40"
        } bg-background dark:bg-level-1 transition-colors duration-300`}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isListsIndexView ? "h-full flex flex-col" : ""}`}>
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 px-6 pt-6 sm:pt-8 pb-6 rounded-b-[3rem] sticky top-0 z-20 backdrop-blur-xl mb-6 border-b border-border/60 shadow-md font-sans min-h-[108px] sm:min-h-[124px]">
          <div className="flex flex-row items-start justify-between gap-3 mb-0">
            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
              <motion.button
                onClick={() => {
                  if (list) {
                    navigate("/lists");
                  } else {
                    navigate("/");
                  }
                }}
                className="p-2 bg-background hover:bg-muted rounded-full transition-colors shrink-0 border border-border"
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <h2 className="mb-0 text-xl sm:text-3xl font-extrabold block w-full leading-tight line-clamp-2 sm:truncate">
                    {list ? `${list.title} ${list.emoji ?? ""}`.trim() : "Lists"}
                  </h2>
                  {list && (
                    <span className="inline-flex w-fit shrink-0 rounded-full bg-highlight px-3 py-1 text-[10px] font-bold text-highlight-foreground shadow-sm sm:text-xs">
                      {doneLabel}
                    </span>
                  )}
                </div>
                {!list && (
                  <p className="text-[10px] sm:text-sm text-muted-foreground font-medium truncate block w-full leading-snug">{headerSubtitle}</p>
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {list && completedCount === totalCount && totalCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="hidden rounded-full bg-highlight px-3 py-1 text-xs font-bold text-highlight-foreground shadow-lg sm:inline-flex"
                >
                  🎉 ALL DONE!
                </motion.span>
              )}

              {list && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      className="p-2 hover:bg-muted dark:hover:bg-level-2 rounded-full transition-colors outline-none cursor-pointer"
                      whileTap={{ scale: 0.9 }}
                      aria-label="Open list actions"
                    >
                      <MoreVertical className="w-5 h-5 text-foreground" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-card rounded-xl p-2 shadow-xl border border-border">
                    <DropdownMenuItem
                      onClick={() => setIsShareModalOpen(true)}
                      className="gap-2 p-3 rounded-xl cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
                    >
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                      <span>Share List</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsReuseModalOpen(true)}
                      className="gap-2 p-3 rounded-xl cursor-pointer hover:bg-muted/50 focus:bg-muted/50"
                    >
                      <ReuseCircularIcon className="w-4 h-4 text-foreground" />
                      <span>Reuse List</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="mx-1 my-2" />
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
              )}
            </div>
          </div>
        </div>

        {/* Main grid: left lists sidebar + right detail */}
        <div className={`relative z-20 grid grid-cols-1 ${hasLists ? 'lg:grid-cols-[280px_1fr]' : ''} gap-6 px-0 pb-12 sm:pb-16 ${isListsIndexView ? 'flex-1 min-h-0 pb-0 sm:pb-0' : ''}`}>
          {hasLists && (
            <aside className={`${list ? 'hidden lg:block' : 'block w-full'} min-w-0 lg:sticky lg:top-24 lg:self-start`}>
              <div className={`min-h-0 px-2 lg:px-0 lg:pr-4 pt-2 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-8 flex flex-col overflow-x-hidden ${isListsIndexView ? 'h-full lg:h-[calc(100vh-10rem)]' : 'h-[calc(100vh-10rem)]'}`}>
                {/* Sidebar lists (scrollable) */}
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-3 custom-scrollbar pr-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
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
                      active={l.id === id}
                      compact
                    />
                  ))}
                </div>

              </div>
            </aside>
          )}

          <main className={`px-2 relative ${!list && hasLists ? 'hidden lg:block' : 'block w-full'}`}>
            <div className={`px-2 mt-6 ${!list && hasLists ? 'hidden lg:block' : ''}`}>
              {/* Items List */}
              {list ? (
                <div>
                  {/* ── Pending items ── */}
                  {pendingItems.length > 0 && (
                    <div className="mb-1">
                      <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 select-none">
                        {pendingItems.length} remaining
                      </p>
                      <div>
                        {pendingItems.map((item) => (
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
                      </div>
                    </div>
                  )}

                  {/* ── Divider ── */}
                  {pendingItems.length > 0 && completedItems.length > 0 && (
                    <div className="flex items-center gap-3 my-3 px-3">
                      <div className="flex-1 h-px bg-border/50" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 select-none">done</span>
                      <div className="flex-1 h-px bg-border/50" />
                    </div>
                  )}

                  {/* ── Completed items ── */}
                  {completedItems.length > 0 && (
                    <div>
                      {completedItems.length > 0 && pendingItems.length === 0 && (
                        <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 select-none">
                          {completedItems.length} completed
                        </p>
                      )}
                      <div>
                        {completedItems.map((item) => (
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
                      </div>
                    </div>
                  )}

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
              ) : !hasLists ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32 flex flex-col items-center justify-center h-full"
                >
                  <motion.button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 rounded-xl bg-foreground text-background font-semibold transition-opacity hover:opacity-90 flex items-center justify-center gap-2 shadow-lg"
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-4 h-4" />
                    New List
                  </motion.button>
                  <p className="text-muted-foreground max-w-sm mt-5">
                    You don&apos;t have any list yet.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32 flex flex-col items-center justify-center h-full"
                >
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-border">
                    <Share2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-xl mb-2 text-foreground">Select a List</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Choose a list from the sidebar to view its items, or create a new one from your dashboard.
                  </p>
                </motion.div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Combined Bottom Action Area */}
      {hasLists && (
        <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-40 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-background via-background/90 to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-1 ${hasLists ? 'lg:grid-cols-[280px_1fr]' : ''} gap-6 items-end`}>
              
              {/* Left Column: New List Button */}
              <div className={`pointer-events-auto w-full ${list ? 'hidden lg:block' : 'block'}`}>
                <motion.button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-950 font-semibold transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-none border-none"
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="w-4 h-4" />
                  New List
                </motion.button>
              </div>

              {/* Right Column: Add Item Box */}
              <div className={`pointer-events-auto w-full ${list ? 'block' : 'hidden'} lg:max-w-[700px]`}>
                {list && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card dark:bg-level-2/95 backdrop-blur-xl border border-border/80 shadow-[0_4px_20px_var(--color-border)] hover:border-border focus-within:border-foreground focus-within:ring-1 focus-within:ring-foreground rounded-2xl p-1.5 flex items-center transition-all duration-300 group"
                  >
                    <input
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="Item Description..."
                      className="w-full flex-1 px-3 sm:px-4 py-2.5 bg-transparent border-0 outline-none min-w-[80px] text-sm sm:text-base font-medium placeholder:text-muted-foreground/60 text-foreground"
                      onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                    />

                    <div className="w-px h-6 bg-border/60 mx-1 hidden sm:block shrink-0 transition-colors group-focus-within:bg-border"></div>

                    <input
                      type="text"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(e.target.value)}
                      placeholder="Qty"
                      className="w-12 sm:w-16 px-1 sm:px-2 py-2.5 bg-transparent border-0 outline-none text-center text-sm sm:text-base font-medium placeholder:text-muted-foreground/60 text-foreground"
                      onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                    />

                    <div className="relative w-16 sm:w-24 shrink-0">
                      <select
                        value={newItemUnit}
                        onChange={(e) => setNewItemUnit(e.target.value as Unit)}
                        className="w-full py-2.5 pl-1 pr-5 sm:px-2 bg-transparent border-0 outline-none appearance-none cursor-pointer text-sm sm:text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {unitOptions.map((unit) => (
                          <option key={unit} value={unit} className="bg-card text-foreground">
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
                        w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0 transition-all ml-1 rounded-[10px] sm:rounded-xl
                        ${newItemName.trim()
                          ? "bg-highlight text-highlight-foreground hover:-translate-y-0.5"
                          : "bg-muted dark:bg-level-1 text-muted-foreground cursor-not-allowed border border-border"
                        }
                      `}
                      whileTap={newItemName.trim() ? { scale: 0.95 } : {}}
                    >
                      <Plus className="w-5 h-5" strokeWidth={3} />
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateList}
      />

      {list && (
        <>
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
        </>
      )}
    </div>
  );
}