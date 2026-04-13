/**
 * ticksy-api.ts
 *
 * High-level API layer that replaces the Node.js Express server.
 * All data lives in the AWS KV store, keyed as follows:
 *
 *   user:{userId}          → StoredUser   (owned + shared list IDs)
 *   list:{listId}          → StoredListMeta  (title, category, emoji, owner, sharedWith)
 *   list:{listId}:items    → StoredListItem[]
 */

import { kvGet, kvPut } from "./kv-client";
import type { CategoryId, ListItem, Unit } from "../types";

// ─────────────────────────────── Storage shapes ───────────────────────────────

export interface StoredUser {
    userId: string;
    ownedListIds: string[];
    sharedListIds: string[];
    createdAt: number;
    updatedAt: number;
}

export interface StoredListMeta {
    listId: string;
    ownerId: string;
    sharedWith: string[];
    title: string;
    categoryId?: string;
    emoji?: string;
    createdAt: number;
    updatedAt: number;
    deletedAt?: number;
}

// ─────────────────────────────── Key helpers ──────────────────────────────────

function userKey(userId: string): string {
    return `user:${userId}`;
}

function listMetaKey(listId: string): string {
    return `list:${listId}`;
}

function listItemsKey(listId: string): string {
    return `list:${listId}:items`;
}

// ─────────────────────────────── User helpers ─────────────────────────────────

export async function ensureUser(userId: string): Promise<StoredUser> {
    const existing = await kvGet<StoredUser>(userKey(userId));
    if (existing) return existing;

    const now = Date.now();
    const newUser: StoredUser = {
        userId,
        ownedListIds: [],
        sharedListIds: [],
        createdAt: now,
        updatedAt: now,
    };
    await kvPut(userKey(userId), newUser);
    return newUser;
}

async function saveUser(user: StoredUser): Promise<void> {
    await kvPut(userKey(user.userId), user);
}

// ─────────────────────────────── List CRUD ────────────────────────────────────

export interface CreateListInput {
    listId: string;
    title: string;
    categoryId?: CategoryId;
    emoji?: string;
    items?: ListItem[];
}

export interface AppList {
    id: string;
    listId: string;
    ownerId: string;
    sharedWith: string[];
    title: string;
    categoryId: CategoryId;
    emoji?: string;
    items: ListItem[];
    createdAt: number;
    updatedAt: number;
}

function buildAppList(meta: StoredListMeta, items: ListItem[]): AppList {
    return {
        id: meta.listId,
        listId: meta.listId,
        ownerId: meta.ownerId,
        sharedWith: meta.sharedWith,
        title: meta.title,
        categoryId: (meta.categoryId ?? "other") as CategoryId,
        emoji: meta.emoji,
        items,
        createdAt: meta.createdAt,
        updatedAt: meta.updatedAt,
    };
}

export async function createList(
    userId: string,
    input: CreateListInput
): Promise<AppList> {
    const user = await ensureUser(userId);
    const now = Date.now();

    const meta: StoredListMeta = {
        listId: input.listId,
        ownerId: userId,
        sharedWith: [],
        title: input.title,
        categoryId: input.categoryId,
        emoji: input.emoji,
        createdAt: now,
        updatedAt: now,
    };

    const items: ListItem[] = input.items ?? [];

    // Write list metadata and items as separate keys
    await Promise.all([
        kvPut(listMetaKey(input.listId), meta),
        kvPut(listItemsKey(input.listId), items),
    ]);

    // Add to user's owned list
    const updatedUser: StoredUser = {
        ...user,
        ownedListIds: Array.from(new Set([...user.ownedListIds, input.listId])),
        updatedAt: now,
    };
    await saveUser(updatedUser);

    return buildAppList(meta, items);
}

export async function getMyLists(userId: string): Promise<AppList[]> {
    const user = await ensureUser(userId);
    const allIds = Array.from(new Set([...user.ownedListIds, ...user.sharedListIds]));

    const results = await Promise.all(
        allIds.map(async (listId) => {
            const [meta, items] = await Promise.all([
                kvGet<StoredListMeta>(listMetaKey(listId)),
                kvGet<ListItem[]>(listItemsKey(listId)),
            ]);
            if (!meta || meta.deletedAt) return null;
            return buildAppList(meta, items ?? []);
        })
    );

    return results.filter((l): l is AppList => l !== null);
}

export async function getListAndJoin(
    listId: string,
    userId: string
): Promise<AppList | null> {
    await ensureUser(userId);

    const [meta, items] = await Promise.all([
        kvGet<StoredListMeta>(listMetaKey(listId)),
        kvGet<ListItem[]>(listItemsKey(listId)),
    ]);

    if (!meta || meta.deletedAt) return null;

    // Auto-join: add user to sharedWith if not already owner or member
    if (meta.ownerId !== userId && !meta.sharedWith.includes(userId)) {
        const updatedMeta: StoredListMeta = {
            ...meta,
            sharedWith: [...meta.sharedWith, userId],
            updatedAt: Date.now(),
        };
        const user = await kvGet<StoredUser>(userKey(userId));
        if (user) {
            const updatedUser: StoredUser = {
                ...user,
                sharedListIds: Array.from(new Set([...user.sharedListIds, listId])),
                updatedAt: Date.now(),
            };
            await Promise.all([
                kvPut(listMetaKey(listId), updatedMeta),
                saveUser(updatedUser),
            ]);
            return buildAppList(updatedMeta, items ?? []);
        }
    }

    return buildAppList(meta, items ?? []);
}

export async function getListItems(listId: string): Promise<ListItem[] | null> {
    return kvGet<ListItem[]>(listItemsKey(listId));
}

export async function updateListItems(
    listId: string,
    userId: string,
    items: ListItem[]
): Promise<void> {
    const meta = await kvGet<StoredListMeta>(listMetaKey(listId));
    if (!meta || meta.deletedAt) throw new Error("List not found");
    if (meta.ownerId !== userId && !meta.sharedWith.includes(userId)) {
        throw new Error("Forbidden");
    }

    const updatedMeta: StoredListMeta = { ...meta, updatedAt: Date.now() };
    await Promise.all([
        kvPut(listItemsKey(listId), items),
        kvPut(listMetaKey(listId), updatedMeta),
    ]);
}

export async function updateListMeta(
    listId: string,
    userId: string,
    patch: { title?: string; emoji?: string; categoryId?: CategoryId }
): Promise<void> {
    const meta = await kvGet<StoredListMeta>(listMetaKey(listId));
    if (!meta || meta.deletedAt) throw new Error("List not found");
    if (meta.ownerId !== userId && !meta.sharedWith.includes(userId)) {
        throw new Error("Forbidden");
    }
    const updatedMeta: StoredListMeta = {
        ...meta,
        title: patch.title ?? meta.title,
        emoji: patch.emoji ?? meta.emoji,
        categoryId: patch.categoryId ?? meta.categoryId,
        updatedAt: Date.now(),
    };
    await kvPut(listMetaKey(listId), updatedMeta);
}

export async function deleteList(listId: string, userId: string): Promise<void> {
    const meta = await kvGet<StoredListMeta>(listMetaKey(listId));
    if (!meta || meta.deletedAt) return;
    if (meta.ownerId !== userId) throw new Error("Forbidden");

    const deletedMeta: StoredListMeta = {
        ...meta,
        deletedAt: Date.now(),
        updatedAt: Date.now(),
    };
    await kvPut(listMetaKey(listId), deletedMeta);

    // Remove from owner's list
    const user = await kvGet<StoredUser>(userKey(userId));
    if (user) {
        await saveUser({
            ...user,
            ownedListIds: user.ownedListIds.filter((id) => id !== listId),
            updatedAt: Date.now(),
        });
    }

    // Remove from all shared users' lists
    await Promise.all(
        meta.sharedWith.map(async (sharedUserId) => {
            const sharedUser = await kvGet<StoredUser>(userKey(sharedUserId));
            if (sharedUser) {
                await saveUser({
                    ...sharedUser,
                    sharedListIds: sharedUser.sharedListIds.filter((id) => id !== listId),
                    updatedAt: Date.now(),
                });
            }
        })
    );
}
