import { motion } from "motion/react";
import { X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { SharedList } from "../types";

interface ReuseListModalProps {
    isOpen: boolean;
    onClose: () => void;
    source: SharedList;
    onCreateFromSelection: (name: string, selectedItemIds: string[], newItems: Array<{ description: string; quantity?: string; unit?: string }>) => void;
}

export function ReuseListModal({ isOpen, onClose, source, onCreateFromSelection }: ReuseListModalProps) {
    const [selected, setSelected] = useState<Record<string, boolean>>({});
    const [name, setName] = useState("");
    const [newItems, setNewItems] = useState<Array<{ description: string; quantity?: string; unit?: string }>>([]);

    useEffect(() => {
        if (!isOpen) return;
        setName(`${source.title} (copy)`);
        const sel: Record<string, boolean> = {};
        source.items.forEach((it) => (sel[it.id] = true));
        setSelected(sel);
        setNewItems([]);
    }, [isOpen, source]);

    if (!isOpen) return null;

    const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

    const addNewItemRow = () => setNewItems((n) => [...n, { description: "", quantity: "", unit: "" }]);
    const updateNewItem = (idx: number, patch: Partial<{ description: string; quantity?: string; unit?: string }>) =>
        setNewItems((n) => n.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
    const removeNewItem = (idx: number) => setNewItems((n) => n.filter((_, i) => i !== idx));

    const handleCreate = () => {
        const selectedIds = Object.keys(selected).filter((k) => selected[k]);
        const cleanedNew = newItems
            .map((it) => ({ description: it.description.trim(), quantity: it.quantity?.trim() || undefined, unit: it.unit?.trim() || undefined }))
            .filter((it) => it.description.length > 0);
        if (!name.trim()) return;
        onCreateFromSelection(name.trim(), selectedIds, cleanedNew);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="bg-card dark:bg-level-3 rounded-xl p-6 w-full max-w-2xl shadow-2xl border border-border"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="mb-1">Create new list from &ldquo;{source.title}&rdquo;</h3>
                        <p className="text-sm text-muted-foreground">Select items to include and add any new items below.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* List name input */}
                <div className="mb-4">
                    <label className="text-sm text-muted-foreground">New list name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-[var(--modal-input-bg)] text-foreground outline-none focus:border-white/80 focus:ring-1 focus:ring-white/20 transition-colors"
                    />
                </div>

                {/* Existing items – compact */}
                <div
                    className="max-h-56 overflow-auto mb-4"
                    style={{ display: "flex", flexDirection: "column", gap: "var(--list-item-gap)" }}
                >
                    {source.items.map((it) => (
                        <label
                            key={it.id}
                            className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-muted/20 cursor-pointer"
                        >
                            {/* Brand-highlight checkbox */}
                            <input
                                type="checkbox"
                                checked={!!selected[it.id]}
                                onChange={() => toggle(it.id)}
                                className="w-4 h-4 cursor-pointer"
                                style={{
                                    accentColor: "var(--checkbox-highlight)",
                                }}
                            />
                            <div>
                                <div className="font-medium text-foreground leading-tight">{it.description}</div>
                                {(it.quantity || it.unit) && (
                                    <div className="text-xs text-muted-foreground">{it.quantity} {it.unit}</div>
                                )}
                            </div>
                        </label>
                    ))}
                </div>

                {/* New items rows */}
                <div className="mb-4">
                    {/* Section header with + icon on the right */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-muted-foreground">New items</div>
                        <button
                            onClick={addNewItemRow}
                            title="Add new item"
                            className="p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--list-item-gap)" }}>
                        {newItems.map((it, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <input
                                    value={it.description}
                                    onChange={(e) => updateNewItem(idx, { description: e.target.value })}
                                    placeholder="Description"
                                    className="flex-1 px-2 py-1.5 rounded-lg border border-border bg-[var(--modal-input-bg)] text-foreground outline-none focus:border-white/80 focus:ring-1 focus:ring-white/20 text-sm transition-colors"
                                />
                                <input
                                    value={it.quantity}
                                    onChange={(e) => updateNewItem(idx, { quantity: e.target.value })}
                                    placeholder="Qty"
                                    className="w-20 px-2 py-1.5 rounded-lg border border-border bg-[var(--modal-input-bg)] text-foreground outline-none focus:border-white/80 focus:ring-1 focus:ring-white/20 text-sm transition-colors"
                                />
                                <input
                                    value={it.unit}
                                    onChange={(e) => updateNewItem(idx, { unit: e.target.value })}
                                    placeholder="Unit"
                                    className="w-24 px-2 py-1.5 rounded-lg border border-border bg-[var(--modal-input-bg)] text-foreground outline-none focus:border-white/80 focus:ring-1 focus:ring-white/20 text-sm transition-colors"
                                />
                                {/* × icon instead of Remove button */}
                                <button
                                    onClick={() => removeNewItem(idx)}
                                    title="Remove item"
                                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer buttons – reduced radius, cancel has visible border */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-foreground transition-colors hover:bg-muted/40"
                        style={{
                            borderRadius: "var(--btn-border-radius)",
                            border: "1px solid var(--cancel-btn-border)",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-primary text-primary-foreground transition-colors hover:opacity-90"
                        style={{ borderRadius: "var(--btn-border-radius)" }}
                    >
                        Create
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
