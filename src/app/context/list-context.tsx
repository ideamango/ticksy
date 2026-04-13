import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { defaultLists, templates } from "../data/templates";
import type { CategoryId, SharePayload, SharedList, Unit, ListTemplate } from "../types";
import { io } from "socket.io-client";
import { useAuth } from "./auth-context";

const API_URL = "http://localhost:4000";

const socket = io(API_URL);

function getRequestHeaders(userId: string): HeadersInit {
    return {
        "Content-Type": "application/json",
        "x-user-id": userId,
    };
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
}

const ListsContext = createContext<ListsContextValue | null>(null);

function toRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return "Just now";
    if (diff < hour) return `${Math.floor(diff / minute)} min ago`;
    if (diff < day) return `${Math.floor(diff / hour)} hours ago`;
    return `${Math.floor(diff / day)} days ago`;
}

export function formatLastUpdated(timestamp: number): string {
    return toRelativeTime(timestamp);
}

function createId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Convert Backend List to Frontend List format
function mapFromDb(dbList: any): SharedList {
    return {
        ...dbList,
        id: dbList.listId || dbList.id,
        items: typeof dbList.items === 'string' ? JSON.parse(dbList.items) : dbList.items || []
    };
}

export function ListsProvider({ children }: { children: ReactNode }) {
    const { userId } = useAuth();
    const [lists, setLists] = useState<SharedList[]>([]);
    const [customTemplates, setCustomTemplates] = useState<ListTemplate[]>(() => {
        if (typeof window !== "undefined") {
            const raw = window.localStorage.getItem("ticksy-templates-v1");
            if (raw) {
                try {
                    const parsed = JSON.parse(raw) as ListTemplate[];
                    if (Array.isArray(parsed)) return parsed;
                } catch {}
            }
        }
        return [];
    });

    // Initial fetch lists
    useEffect(() => {
        if (!userId) {
            setLists([]);
            return;
        }

        fetch(`${API_URL}/my-lists`, { headers: getRequestHeaders(userId) })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setLists(data.map(mapFromDb));
                }
            })
            .catch(console.error);

        const handleListSync = (data: any) => {
            if (data.senderId === userId) return;
            setLists((prev) => prev.map(l => {
                if (l.id === data.listId) {
                    return {
                        ...l,
                        ...(data.items ? { items: data.items } : {}),
                        ...(data.patch ? { ...data.patch } : {})
                    };
                }
                return l;
            }));
        };

        socket.on("list-sync", handleListSync);

        return () => {
            socket.off("list-sync", handleListSync);
        };
    }, [userId]);

    const persistTemplates = useCallback((nextState: ListTemplate[] | ((prev: ListTemplate[]) => ListTemplate[])) => {
        setCustomTemplates((previous) => {
            const nextTemplates = typeof nextState === "function" ? nextState(previous) : nextState;
            if (typeof window !== "undefined") {
                window.localStorage.setItem("ticksy-templates-v1", JSON.stringify(nextTemplates));
            }
            return nextTemplates;
        });
    }, []);

    const createTemplate = useCallback((template: Omit<ListTemplate, "id">) => {
        persistTemplates((prev) => [
            {
                ...template,
                id: createId("tpl-custom"),
            },
            ...prev,
        ]);
    }, [persistTemplates]);

    const createListToDb = useCallback(async (list: SharedList) => {
        if (!userId) return;
        try {
            await fetch(`${API_URL}/create-list`, {
                method: "POST",
                headers: getRequestHeaders(userId),
                body: JSON.stringify({
                    listId: list.id,
                    title: list.title,
                    categoryId: list.categoryId,
                    emoji: list.emoji,
                    items: list.items,
                })
            });
        } catch (err) {
            console.error("Failed to create list backend", err);
        }
    }, [userId]);

    const syncListToDb = useCallback(async (listId: string, payload: any) => {
        if (!userId) return;
        socket.emit("list-updated", {
            listId,
            senderId: userId,
            ...payload
        });
        try {
            await fetch(`${API_URL}/update-item`, {
                method: "PUT",
                headers: getRequestHeaders(userId),
                body: JSON.stringify({ listId, ...payload })
            });
        } catch (err) {
            console.error(err);
        }
    }, [userId]);

    const createList = useCallback(
        (name: string, categoryId: CategoryId, emoji = "📝") => {
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
            setLists((previous) => [newList, ...previous]);
            createListToDb(newList);
            return newList;
        },
        [createListToDb],
    );

    const createListWithItems = useCallback(
        (name: string, categoryId: CategoryId, emoji: string | undefined, items: Array<{ description: string; quantity?: string; unit?: Unit }>) => {
            const now = Date.now();
            const newList: SharedList = {
                id: createId("list"),
                title: name,
                categoryId,
                emoji: emoji ?? "📝",
                createdAt: now,
                updatedAt: now,
                items: items.map((it) => ({
                    id: createId("item"),
                    description: it.description,
                    quantity: it.quantity,
                    unit: it.unit,
                    completed: false,
                    createdAt: now,
                })),
            };
            setLists((previous) => [newList, ...previous]);
            createListToDb(newList);
            return newList;
        },
        [createListToDb],
    );

    const createFromTemplate = useCallback(
        (templateId: string, customName?: string) => {
            const template = templates.find((item) => item.id === templateId) || customTemplates.find((t) => t.id === templateId);
            if (!template) {
                return null;
            }

            const now = Date.now();
            const list: SharedList = {
                id: createId("list"),
                title: customName || template.name,
                categoryId: template.categoryId,
                emoji: template.emoji,
                createdAt: now,
                updatedAt: now,
                items: template.items.map((item) => ({
                    id: createId("item"),
                    description: item.description,
                    quantity: item.quantity,
                    unit: item.unit,
                    completed: false,
                    createdAt: now,
                })),
            };

            setLists((previous) => [list, ...previous]);
            createListToDb(list);
            return list;
        },
        [createListToDb, customTemplates],
    );

    const getListById = useCallback(
        (id: string) => {
            return lists.find((list) => list.id === id);
        },
        [lists],
    );

    const fetchListAndJoin = useCallback(async (listId: string) => {
        if (!userId) return null;
        socket.emit("join-list", listId);
        try {
            const res = await fetch(`${API_URL}/list/${listId}`, { headers: getRequestHeaders(userId) });
            if (!res.ok) return null;
            const data = await res.json();
            const mapped = mapFromDb(data);
            setLists(prev => {
                if (prev.find(p => p.id === mapped.id)) {
                    return prev.map(p => p.id === mapped.id ? mapped : p);
                }
                return [mapped, ...prev];
            });
            return mapped;
        } catch (e) {
            return null;
        }
    }, [userId]);

    const addItem = useCallback(
        (listId: string, item: { description: string; quantity?: string; unit?: Unit }) => {
            const now = Date.now();
            let newItems: any[] = [];
            setLists((previous) =>
                previous.map((list) => {
                    if (list.id !== listId) return list;
                    newItems = [
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
                    return { ...list, updatedAt: now, items: newItems };
                }),
            );
            // After state update, sync:
            setTimeout(() => syncListToDb(listId, { items: newItems }), 0);
        },
        [syncListToDb],
    );

    const toggleItem = useCallback(
        (listId: string, itemId: string) => {
            const now = Date.now();
            let newItems: any[] = [];
            setLists((previous) =>
                previous.map((list) => {
                    if (list.id !== listId) return list;
                    newItems = list.items.map((item) => {
                        if (item.id !== itemId) return item;
                        const nextCompleted = !item.completed;
                        return {
                            ...item,
                            completed: nextCompleted,
                            completedAt: nextCompleted ? now : undefined,
                        };
                    });
                    return { ...list, updatedAt: now, items: newItems };
                }),
            );
            setTimeout(() => syncListToDb(listId, { items: newItems }), 0);
        },
        [syncListToDb],
    );

    const deleteItem = useCallback(
        (listId: string, itemId: string) => {
            const now = Date.now();
            let newItems: any[] = [];
            setLists((previous) =>
                previous.map((list) => {
                    if (list.id !== listId) return list;
                    newItems = list.items.filter((item) => item.id !== itemId);
                    return { ...list, updatedAt: now, items: newItems };
                }),
            );
            setTimeout(() => syncListToDb(listId, { items: newItems }), 0);
        },
        [syncListToDb],
    );

    const updateItem = useCallback(
        (listId: string, itemId: string, patch: { description?: string; quantity?: string; unit?: Unit }) => {
            const now = Date.now();
            let newItems: any[] = [];
            setLists((previous) =>
                previous.map((list) => {
                    if (list.id !== listId) return list;
                    newItems = list.items.map((item) => {
                        if (item.id !== itemId) return item;
                        return {
                            ...item,
                            description: patch.description ?? item.description,
                            quantity: patch.quantity ?? item.quantity,
                            unit: patch.unit ?? item.unit,
                        };
                    });
                    return { ...list, updatedAt: now, items: newItems };
                }),
            );
            setTimeout(() => syncListToDb(listId, { items: newItems }), 0);
        },
        [syncListToDb],
    );

    const deleteList = useCallback(
        async (listId: string) => {
            if (!userId) return;
            setLists((previous) => previous.filter((list) => list.id !== listId));
            try {
                await fetch(`${API_URL}/list/${listId}`, {
                    method: 'DELETE',
                    headers: getRequestHeaders(userId)
                });
            } catch (err) {}
        },
        [userId],
    );

    const updateList = useCallback(
        (listId: string, patch: { title?: string; emoji?: string; categoryId?: CategoryId }) => {
            const now = Date.now();
            let safePatch = {} as any;
            setLists((previous) =>
                previous.map((list) => {
                    if (list.id !== listId) return list;
                    safePatch = {
                        title: patch.title !== undefined ? patch.title : list.title,
                        emoji: patch.emoji !== undefined ? patch.emoji : list.emoji,
                        categoryId: patch.categoryId !== undefined ? patch.categoryId : list.categoryId,
                    };
                    return { ...list, ...safePatch, updatedAt: now };
                }),
            );
            setTimeout(() => syncListToDb(listId, { patch: safePatch }), 0);
        },
        [syncListToDb],
    );

    // Deep link is now just the URL of the list because it auto joins others.
    const buildShareToken = useCallback(
        (listId: string) => {
            // We just return the listId instead of a giant base64 string because DB handles access.
            // When link is clicked, /list/:id will fetch from server and add them to sharedWith.
            return listId;
        },
        [],
    );

    // Kept to avoid breaking interface, though typically we just load /list/:id directly now.
    const importSharedList = useCallback(
        (token: string) => {
            // with new DB logic, importing is just opening the list detail page which fetches it.
            return null;
        },
        [],
    );

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
        ],
    );

    return <ListsContext.Provider value={value}>{children}</ListsContext.Provider>;
}

export function useLists() {
    const context = useContext(ListsContext);
    if (!context) {
        throw new Error("useLists must be used inside ListsProvider");
    }
    return context;
}
