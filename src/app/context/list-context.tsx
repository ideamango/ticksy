import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    useEffect,
    useRef,
    type ReactNode,
} from "react";
import { templates } from "../data/templates";
import type { CategoryId, Unit, ListItem, ListTemplate } from "../types";
import { useAuth } from "./auth-context";
import {
    createList as apiCreateList,
    getMyLists,
    getListAndJoin,
    getListItems,
    updateListItems,
    updateListMeta,
    deleteList as apiDeleteList,
    ensureUser,
    type AppList,
} from "../services/ticksy-api";

// Polling interval for collaborative sync (ms)
const POLL_INTERVAL_MS = 5000;

export function formatLastUpdated(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return "Just now";
    if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
    if (diff < day) return `${Math.floor(diff / hour)} hours ago`;
    return `${Math.floor(diff / day)} days ago`;
}

function createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Map the API response (AppList) to the frontend SharedList shape
function mapToSharedList(apiList: AppList): SharedList {
    return {
        id: apiList.listId,
        title: apiList.title,
        categoryId: apiList.categoryId,
        emoji: apiList.emoji,
        items: apiList.items,
        createdAt: apiList.createdAt,
        updatedAt: apiList.updatedAt,
    };
}

interface SharedList {
    id: string;
    title: string;
    categoryId: CategoryId;
    emoji?: string;
    items: ListItem[];
    createdAt: number;
    updatedAt: number;
}

interface ListsContextValue {
    lists: SharedList[];
    createList: (name: string, categoryId: CategoryId, emoji?: string) => SharedList;
    createListWithItems: (name: string, categoryId: CategoryId, emoji: string | undefined, items: Array<{ description: string; quantity?: string; unit?: Unit }>) => SharedList;
    createFromTemplate: (templateId: string, customName?: string) => SharedList | null;
    getListById: (id: string) => SharedList | undefined;
    fetchListAndJoin: (id: string) => Promise<SharedList | null>;
    addItem: (listId: string, item: { description: string; quantity?: string; unit?: Unit }) => void;
    toggleItem: (listId: string, itemId: string) => void;
    deleteItem: (listId: string, itemId: string) => void;
    updateItem: (listId: string, itemId: string, patch: { description?: string; quantity?: string; unit?: Unit }) => void;
    buildShareToken: (listId: string) => string | null;
    importSharedList: (token: string) => SharedList | null;
    deleteList: (listId: string) => void;
    updateList: (listId: string, patch: { title?: string; emoji?: string; categoryId?: CategoryId }) => void;
    customTemplates: ListTemplate[];
    createTemplate: (template: Omit<ListTemplate, "id">) => void;
    setFocusedListId: (id: string | null) => void;
}

const ListsContext = createContext<ListsContextValue | null>(null);

export function ListsProvider({ children }: { children: ReactNode }) {
    const { userId } = useAuth();
    const [lists, setLists] = useState<SharedList[]>([]);
    const [focusedListId, setFocusedListId] = useState<string | null>(null);
    const [customTemplates, setCustomTemplates] = useState<ListTemplate[]>(() => {
        if (typeof window !== "undefined") {
            const raw = window.localStorage.getItem("ticksy-templates-v1");
            if (raw) {
                try {
                    const parsed = JSON.parse(raw) as ListTemplate[];
                    if (Array.isArray(parsed)) return parsed;
                } catch { }
            }
        }
        return [];
    });

    // ── Initial load: fetch all lists owned/shared by this user ──────────────
    useEffect(() => {
        if (!userId) return;
        let cancelled = false;

        ensureUser(userId)
            .then(() => getMyLists(userId))
            .then((apiLists) => {
                if (!cancelled) {
                    setLists(apiLists.map(mapToSharedList));
                }
            })
            .catch(console.error);

        return () => { cancelled = true; };
    }, [userId]);

    // ── Polling for the currently focused list ────────────────────────────────
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (pollRef.current) clearInterval(pollRef.current);
        if (!focusedListId) return;

        const poll = async () => {
            try {
                const items = await getListItems(focusedListId);
                if (items) {
                    setLists((prev) =>
                        prev.map((l) =>
                            l.id === focusedListId
                                ? { ...l, items, updatedAt: Date.now() }
                                : l
                        )
                    );
                }
            } catch (err) {
                console.error("[polling] failed to fetch items", err);
            }
        };

        pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [focusedListId]);

    // ── Templates persistence ─────────────────────────────────────────────────
    const persistTemplates = useCallback(
        (nextState: ListTemplate[] | ((prev: ListTemplate[]) => ListTemplate[])) => {
            setCustomTemplates((previous) => {
                const next =
                    typeof nextState === "function" ? nextState(previous) : nextState;
                if (typeof window !== "undefined") {
                    window.localStorage.setItem("ticksy-templates-v1", JSON.stringify(next));
                }
                return next;
            });
        },
        []
    );

    const createTemplate = useCallback(
        (template: Omit<ListTemplate, "id">) => {
            persistTemplates((prev) => [
                { ...template, id: createId("tpl-custom") },
                ...prev,
            ]);
        },
        [persistTemplates]
    );

    // ── List mutation helpers (optimistic local + async remote) ──────────────

    const syncItems = useCallback(
        (listId: string, items: ListItem[]) => {
            // Fire-and-forget remote sync
            updateListItems(listId, userId, items).catch(console.error);
        },
        [userId]
    );

    const createList = useCallback(
        (name: string, categoryId: CategoryId, emoji = "📝"): SharedList => {
            const now = Date.now();
            const newList: SharedList = {
                id: createId("list"),
                title: name,
                categoryId,
                emoji,
                createdAt: now,
                updatedAt: now,
                items: [],
            };
            setLists((prev) => [newList, ...prev]);
            // async persist to KV
            apiCreateList(userId, {
                listId: newList.id,
                title: newList.title,
                categoryId: newList.categoryId,
                emoji: newList.emoji,
                items: [],
            }).catch(console.error);
            return newList;
        },
        [userId]
    );

    const createListWithItems = useCallback(
        (
            name: string,
            categoryId: CategoryId,
            emoji: string | undefined,
            items: Array<{ description: string; quantity?: string; unit?: Unit }>
        ): SharedList => {
            const now = Date.now();
            const mappedItems: ListItem[] = items.map((it) => ({
                id: createId("item"),
                description: it.description,
                quantity: it.quantity,
                unit: it.unit,
                completed: false,
                createdAt: now,
            }));
            const newList: SharedList = {
                id: createId("list"),
                title: name,
                categoryId,
                emoji: emoji ?? "📝",
                createdAt: now,
                updatedAt: now,
                items: mappedItems,
            };
            setLists((prev) => [newList, ...prev]);
            apiCreateList(userId, {
                listId: newList.id,
                title: newList.title,
                categoryId: newList.categoryId,
                emoji: newList.emoji,
                items: mappedItems,
            }).catch(console.error);
            return newList;
        },
        [userId]
    );

    const createFromTemplate = useCallback(
        (templateId: string, customName?: string): SharedList | null => {
            const template =
                templates.find((t) => t.id === templateId) ||
                customTemplates.find((t) => t.id === templateId);
            if (!template) return null;

            const now = Date.now();
            const mappedItems: ListItem[] = template.items.map((item) => ({
                id: createId("item"),
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                completed: false,
                createdAt: now,
            }));
            const newList: SharedList = {
                id: createId("list"),
                title: customName || template.name,
                categoryId: template.categoryId,
                emoji: template.emoji,
                createdAt: now,
                updatedAt: now,
                items: mappedItems,
            };
            setLists((prev) => [newList, ...prev]);
            apiCreateList(userId, {
                listId: newList.id,
                title: newList.title,
                categoryId: newList.categoryId,
                emoji: newList.emoji,
                items: mappedItems,
            }).catch(console.error);
            return newList;
        },
        [userId, customTemplates]
    );

    const getListById = useCallback(
        (id: string) => lists.find((l) => l.id === id),
        [lists]
    );

    const fetchListAndJoin = useCallback(
        async (listId: string): Promise<SharedList | null> => {
            if (!userId) return null;
            try {
                const apiList = await getListAndJoin(listId, userId);
                if (!apiList) return null;
                const mapped = mapToSharedList(apiList);
                setLists((prev) => {
                    const exists = prev.find((l) => l.id === mapped.id);
                    if (exists) return prev.map((l) => (l.id === mapped.id ? mapped : l));
                    return [mapped, ...prev];
                });
                return mapped;
            } catch {
                return null;
            }
        },
        [userId]
    );

    const addItem = useCallback(
        (listId: string, item: { description: string; quantity?: string; unit?: Unit }) => {
            const now = Date.now();
            let nextItems: ListItem[] = [];
            setLists((prev) =>
                prev.map((list) => {
                    if (list.id !== listId) return list;
                    nextItems = [
                        ...list.items,
                        {
                            id: createId("item"),
                            description: item.description,
                            quantity: item.quantity,
                            unit: item.unit,
                            completed: false,
                            createdAt: now,
                        },
                    ];
                    return { ...list, updatedAt: now, items: nextItems };
                })
            );
            setTimeout(() => syncItems(listId, nextItems), 0);
        },
        [syncItems]
    );

    const toggleItem = useCallback(
        (listId: string, itemId: string) => {
            const now = Date.now();
            let nextItems: ListItem[] = [];
            setLists((prev) =>
                prev.map((list) => {
                    if (list.id !== listId) return list;
                    nextItems = list.items.map((item) => {
                        if (item.id !== itemId) return item;
                        const nextCompleted = !item.completed;
                        return {
                            ...item,
                            completed: nextCompleted,
                            completedAt: nextCompleted ? now : undefined,
                        };
                    });
                    return { ...list, updatedAt: now, items: nextItems };
                })
            );
            setTimeout(() => syncItems(listId, nextItems), 0);
        },
        [syncItems]
    );

    const deleteItem = useCallback(
        (listId: string, itemId: string) => {
            const now = Date.now();
            let nextItems: ListItem[] = [];
            setLists((prev) =>
                prev.map((list) => {
                    if (list.id !== listId) return list;
                    nextItems = list.items.filter((item) => item.id !== itemId);
                    return { ...list, updatedAt: now, items: nextItems };
                })
            );
            setTimeout(() => syncItems(listId, nextItems), 0);
        },
        [syncItems]
    );

    const updateItem = useCallback(
        (
            listId: string,
            itemId: string,
            patch: { description?: string; quantity?: string; unit?: Unit }
        ) => {
            const now = Date.now();
            let nextItems: ListItem[] = [];
            setLists((prev) =>
                prev.map((list) => {
                    if (list.id !== listId) return list;
                    nextItems = list.items.map((item) => {
                        if (item.id !== itemId) return item;
                        return {
                            ...item,
                            description: patch.description ?? item.description,
                            quantity: patch.quantity ?? item.quantity,
                            unit: patch.unit ?? item.unit,
                        };
                    });
                    return { ...list, updatedAt: now, items: nextItems };
                })
            );
            setTimeout(() => syncItems(listId, nextItems), 0);
        },
        [syncItems]
    );

    const deleteList = useCallback(
        (listId: string) => {
            setLists((prev) => prev.filter((l) => l.id !== listId));
            apiDeleteList(listId, userId).catch(console.error);
        },
        [userId]
    );

    const updateList = useCallback(
        (listId: string, patch: { title?: string; emoji?: string; categoryId?: CategoryId }) => {
            const now = Date.now();
            setLists((prev) =>
                prev.map((list) => {
                    if (list.id !== listId) return list;
                    return {
                        ...list,
                        ...patch,
                        updatedAt: now,
                    };
                })
            );
            updateListMeta(listId, userId, patch).catch(console.error);
        },
        [userId]
    );

    // Share token is just the listId — deep link resolves /list/:id which auto-joins
    const buildShareToken = useCallback((listId: string): string | null => listId, []);
    const importSharedList = useCallback((_token: string): SharedList | null => null, []);

    const value = useMemo<ListsContextValue>(
        () => ({
            lists,
            createList,
            createListWithItems,
            createFromTemplate,
            getListById,
            fetchListAndJoin,
            addItem,
            toggleItem,
            deleteItem,
            updateItem,
            buildShareToken,
            importSharedList,
            deleteList,
            updateList,
            customTemplates,
            createTemplate,
            setFocusedListId,
        }),
        [
            lists,
            createList,
            createListWithItems,
            createFromTemplate,
            getListById,
            fetchListAndJoin,
            addItem,
            toggleItem,
            deleteItem,
            updateItem,
            buildShareToken,
            importSharedList,
            deleteList,
            updateList,
            customTemplates,
            createTemplate,
            setFocusedListId,
        ]
    );

    return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}

export function useLists() {
    const context = useContext(ListsContext);
    if (!context) throw new Error("useLists must be used inside ListsProvider");
    return context;
}
