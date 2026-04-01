import { motion } from "motion/react";
import { X } from "lucide-react";
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
        <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <motion.div className="bg-card rounded-3xl p-6 w-full max-w-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="mb-1">Create new list from "{source.title}"</h3>
                        <p className="text-sm text-muted-foreground">Select items to include and add any new items below.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-4">
                    <label className="text-sm text-muted-foreground">New list name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-2 px-3 py-2 rounded-lg border bg-input-background" />
                </div>

                <div className="max-h-56 overflow-auto mb-4 space-y-2">
                    {source.items.map((it) => (
                        <label key={it.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20">
                            <input type="checkbox" checked={!!selected[it.id]} onChange={() => toggle(it.id)} />
                            <div>
                                <div className="font-medium">{it.description}</div>
                                {(it.quantity || it.unit) && <div className="text-sm text-muted-foreground">{it.quantity} {it.unit}</div>}
                            </div>
                        </label>
                    ))}
                </div>

                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-muted-foreground">Add new items</div>
                        <button onClick={addNewItemRow} className="text-sm text-primary underline">Add row</button>
                    </div>

                    <div className="space-y-2">
                        {newItems.map((it, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input value={it.description} onChange={(e) => updateNewItem(idx, { description: e.target.value })} placeholder="Description" className="flex-1 px-2 py-1 rounded-lg border bg-white" />
                                <input value={it.quantity} onChange={(e) => updateNewItem(idx, { quantity: e.target.value })} placeholder="Qty" className="w-24 px-2 py-1 rounded-lg border bg-white" />
                                <input value={it.unit} onChange={(e) => updateNewItem(idx, { unit: e.target.value })} placeholder="Unit" className="w-28 px-2 py-1 rounded-lg border bg-white" />
                                <button onClick={() => removeNewItem(idx)} className="p-2 text-destructive">Remove</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-2xl">Cancel</button>
                    <button onClick={handleCreate} className="px-4 py-2 rounded-2xl bg-primary text-primary-foreground">Create</button>
                </div>
            </motion.div>
        </motion.div>
    );
}
