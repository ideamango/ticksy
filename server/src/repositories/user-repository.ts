import { StoredUser } from "../domain/storage";
import { KvClient } from "../lib/kv-client";
import { normalizeStoredUser, STORAGE_SCHEMA_VERSION } from "../lib/storage-normalizers";

function userKey(userId: string): string {
    return `user:${userId}`;
}

function uniqueIds(ids: string[]): string[] {
    return Array.from(new Set(ids));
}

export class UserRepository {
    constructor(private readonly kvClient: KvClient) { }

    async getById(userId: string): Promise<StoredUser | null> {
        const rawUser = await this.kvClient.get<unknown>(userKey(userId));
        const user = normalizeStoredUser(rawUser);

        if (user && JSON.stringify(rawUser) !== JSON.stringify(user)) {
            await this.save(user);
        }

        return user;
    }

    async ensure(userId: string): Promise<StoredUser> {
        const existing = await this.getById(userId);
        if (existing) {
            return existing;
        }

        const now = Date.now();
        const nextUser: StoredUser = {
            userId,
            ownedListIds: [],
            sharedListIds: [],
            createdAt: now,
            updatedAt: now,
        };
        await this.save(nextUser);
        return nextUser;
    }

    async save(user: StoredUser): Promise<void> {
        await this.kvClient.put(userKey(user.userId), {
            ...user,
            schemaVersion: STORAGE_SCHEMA_VERSION,
        });
    }

    async addOwnedList(userId: string, listId: string): Promise<StoredUser> {
        const user = await this.ensure(userId);
        const nextUser: StoredUser = {
            ...user,
            ownedListIds: uniqueIds([...user.ownedListIds, listId]),
            updatedAt: Date.now(),
        };
        await this.save(nextUser);
        return nextUser;
    }

    async addSharedList(userId: string, listId: string): Promise<StoredUser> {
        const user = await this.ensure(userId);
        const nextUser: StoredUser = {
            ...user,
            sharedListIds: uniqueIds([...user.sharedListIds, listId]),
            updatedAt: Date.now(),
        };
        await this.save(nextUser);
        return nextUser;
    }

    async removeOwnedList(userId: string, listId: string): Promise<StoredUser> {
        const user = await this.ensure(userId);
        const nextUser: StoredUser = {
            ...user,
            ownedListIds: user.ownedListIds.filter((id) => id !== listId),
            updatedAt: Date.now(),
        };
        await this.save(nextUser);
        return nextUser;
    }

    async removeSharedList(userId: string, listId: string): Promise<StoredUser> {
        const user = await this.ensure(userId);
        const nextUser: StoredUser = {
            ...user,
            sharedListIds: user.sharedListIds.filter((id) => id !== listId),
            updatedAt: Date.now(),
        };
        await this.save(nextUser);
        return nextUser;
    }
}
