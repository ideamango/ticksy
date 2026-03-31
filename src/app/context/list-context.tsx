import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { defaultLists, templates } from "../data/templates";
import type { CategoryId, SharePayload, SharedList, Unit } from "../types";

const STORAGE_KEY = "shared-list-app-v1";

interface ListsContextValue {
    lists: SharedList[];
    createList: (name: string, categoryId: CategoryId, emoji?: string) => SharedList;
    createFromTemplate: (templateId: string) => SharedList | null;
    getListById: (id: string) => SharedList | undefined;
    addItem: (listId: string, item: { description: string; quantity?: string; unit?: Unit }) => void;
    toggleItem: (listId: string, itemId: string) => void;
    deleteItem: (listId: string, itemId: string) => void;
    buildShareToken: (listId: string) => string | null;
    importSharedList: (token: string) => SharedList | null;
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

function toBase64Url(input: string): string {
    return btoa(unescape(encodeURIComponent(input)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function fromBase64Url(input: string): string {
    const padded = input.padEnd(Math.ceil(input.length / 4) * 4, "=").replace(/-/g, "+").replace(/_/g, "/");
    return decodeURIComponent(escape(atob(padded)));
}

function loadLists(): SharedList[] {
    if (typeof window === "undefined") {
        return defaultLists;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return defaultLists;
    }

    try {
        const parsed = JSON.parse(raw) as SharedList[];
        return parsed.length ? parsed : defaultLists;
    } catch {
        return defaultLists;
    }
}

export function ListsProvider({ children }: { children: ReactNode }) {
    const [lists, setLists] = useState<SharedList[]>(() => loadLists());

    const persist = useCallback(
        (nextState: SharedList[] | ((previous: SharedList[]) => SharedList[])) => {
            setLists((previous) => {
                const nextLists = typeof nextState === "function" ? nextState(previous) : nextState;
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLists));
                }
                return nextLists;
            });
        },
        [],
    );

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
            persist((previous) => [newList, ...previous]);
            return newList;
        },
        [persist],
    );

    const createFromTemplate = useCallback(
        (templateId: string) => {
            const template = templates.find((item) => item.id === templateId);
            if (!template) {
                return null;
            }

            const now = Date.now();
            const list: SharedList = {
                id: createId("list"),
                title: template.name,
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

            persist((previous) => [list, ...previous]);
            return list;
        },
        [persist],
    );

    const getListById = useCallback(
        (id: string) => {
            return lists.find((list) => list.id === id);
        },
        [lists],
    );

    const addItem = useCallback(
        (listId: string, item: { description: string; quantity?: string; unit?: Unit }) => {
            const now = Date.now();
            persist((previous) =>
                previous.map((list) => {
                    if (list.id !== listId) return list;
                    return {
                        ...list,
                        updatedAt: now,
                        items: [
                            ...list.items,
                            {
                                id: createId("item"),
                                description: item.description,
                                quantity: item.quantity,
                                unit: item.unit,
                                completed: false,
                                createdAt: now,
                            },
                        ],
                    };
                }),
            );
        },
        [persist],
    );

    const toggleItem = useCallback(
        (listId: string, itemId: string) => {
            const now = Date.now();
            persist((previous) =>
                previous.map((list) => {
                    if (list.id !== listId) return list;
                    return {
                        ...list,
                        updatedAt: now,
                        items: list.items.map((item) => {
                            if (item.id !== itemId) return item;
                            const nextCompleted = !item.completed;
                            return {
                                ...item,
                                completed: nextCompleted,
                                completedAt: nextCompleted ? now : undefined,
                            };
                        }),
                    };
                }),
            );
        },
        [persist],
    );

    const deleteItem = useCallback(
        (listId: string, itemId: string) => {
            const now = Date.now();
            persist((previous) =>
                previous.map((list) => {
                    if (list.id !== listId) return list;
                    return {
                        ...list,
                        updatedAt: now,
                        items: list.items.filter((item) => item.id !== itemId),
                    };
                }),
            );
        },
        [persist],
    );

    const buildShareToken = useCallback(
        (listId: string) => {
            const list = lists.find((entry) => entry.id === listId);
            if (!list) return null;

            const payload: SharePayload = {
                title: list.title,
                categoryId: list.categoryId,
                emoji: list.emoji,
                items: list.items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unit: item.unit,
                    completed: item.completed,
                })),
            };

            return toBase64Url(JSON.stringify(payload));
        },
        [lists],
    );

    const importSharedList = useCallback(
        (token: string) => {
            try {
                const parsed = JSON.parse(fromBase64Url(token)) as SharePayload;
                if (!parsed?.title || !Array.isArray(parsed.items)) {
                    return null;
                }

                const now = Date.now();
                const imported: SharedList = {
                    id: createId("list"),
                    title: `${parsed.title} (Shared)`,
                    categoryId: parsed.categoryId,
                    emoji: parsed.emoji,
                    createdAt: now,
                    updatedAt: now,
                    items: parsed.items.map((item) => ({
                        id: createId("item"),
                        description: item.description,
                        quantity: item.quantity,
                        unit: item.unit,
                        completed: Boolean(item.completed),
                        createdAt: now,
                        completedAt: item.completed ? now : undefined,
                    })),
                };

                persist((previous) => [imported, ...previous]);
                return imported;
            } catch {
                return null;
            }
        },
        [persist],
    );

    const value = useMemo<ListsContextValue>(
        () => ({
            lists,
            createList,
            createFromTemplate,
            getListById,
            addItem,
            toggleItem,
            deleteItem,
            buildShareToken,
            importSharedList,
        }),
        [
            lists,
            createList,
            createFromTemplate,
            getListById,
            addItem,
            toggleItem,
            deleteItem,
            buildShareToken,
            importSharedList,
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
