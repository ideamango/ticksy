import type { StoredList, StoredListItem, StoredUser } from "../domain/storage";

export const STORAGE_SCHEMA_VERSION = 1;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | undefined {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function readTimestamp(value: unknown, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readOptionalTimestamp(value: unknown): number | undefined {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
}

function readItems(value: unknown, fallbackCreatedAt: number): StoredListItem[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.flatMap((entry, index) => {
        if (!isRecord(entry)) {
            return [];
        }

        const description = readString(entry.description);
        if (!description) {
            return [];
        }

        const createdAt = readTimestamp(entry.createdAt, fallbackCreatedAt);
        const completed = typeof entry.completed === "boolean" ? entry.completed : false;

        return [
            {
                id: readString(entry.id) ?? `legacy-item-${index}-${createdAt}`,
                description,
                quantity: readString(entry.quantity),
                unit: readString(entry.unit),
                completed,
                createdAt,
                completedAt: completed ? readOptionalTimestamp(entry.completedAt) ?? createdAt : undefined,
            },
        ];
    });
}

export function normalizeStoredUser(value: unknown): StoredUser | null {
    if (!isRecord(value)) {
        return null;
    }

    const userId = readString(value.userId);
    if (!userId) {
        return null;
    }

    const createdAt = readTimestamp(value.createdAt, Date.now());

    return {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        userId,
        ownedListIds: readStringArray(value.ownedListIds),
        sharedListIds: readStringArray(value.sharedListIds),
        createdAt,
        updatedAt: readTimestamp(value.updatedAt, createdAt),
    };
}

export function normalizeStoredList(value: unknown): StoredList | null {
    if (!isRecord(value)) {
        return null;
    }

    const listId = readString(value.listId) ?? readString(value.id);
    const ownerId = readString(value.ownerId);
    const title = readString(value.title);

    if (!listId || !ownerId || !title) {
        return null;
    }

    const createdAt = readTimestamp(value.createdAt, Date.now());

    return {
        schemaVersion: STORAGE_SCHEMA_VERSION,
        listId,
        ownerId,
        sharedWith: readStringArray(value.sharedWith),
        title,
        categoryId: readString(value.categoryId),
        emoji: readString(value.emoji),
        items: readItems(value.items, createdAt),
        createdAt,
        updatedAt: readTimestamp(value.updatedAt, createdAt),
        deletedAt: readOptionalTimestamp(value.deletedAt),
    };
}