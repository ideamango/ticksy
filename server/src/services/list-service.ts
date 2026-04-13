import { ListPatch, StoredList, StoredListItem } from "../domain/storage";
import { ListRepository } from "../repositories/list-repository";
import { UserRepository } from "../repositories/user-repository";

interface CreateListInput {
    listId: string;
    title: string;
    categoryId?: string;
    emoji?: string;
    items?: StoredListItem[];
}

interface UpdateListInput {
    items?: StoredListItem[];
    patch?: ListPatch;
}

export class ForbiddenError extends Error { }
export class NotFoundError extends Error { }

export class ListService {
    constructor(
        private readonly listRepository: ListRepository,
        private readonly userRepository: UserRepository,
    ) { }

    async createList(userId: string, input: CreateListInput): Promise<StoredList> {
        await this.userRepository.ensure(userId);

        const now = Date.now();
        const nextList: StoredList = {
            listId: input.listId,
            ownerId: userId,
            sharedWith: [],
            title: input.title,
            categoryId: input.categoryId,
            emoji: input.emoji,
            items: input.items || [],
            createdAt: now,
            updatedAt: now,
        };

        await this.listRepository.save(nextList);
        await this.userRepository.addOwnedList(userId, input.listId);
        return nextList;
    }

    async getMyLists(userId: string): Promise<StoredList[]> {
        const user = await this.userRepository.ensure(userId);
        const listIds = Array.from(new Set([...user.ownedListIds, ...user.sharedListIds]));
        const lists = await Promise.all(listIds.map((listId) => this.listRepository.getById(listId)));
        return lists.filter((list): list is StoredList => Boolean(list && !list.deletedAt));
    }

    async fetchAndJoin(listId: string, userId: string): Promise<StoredList> {
        await this.userRepository.ensure(userId);
        const list = await this.listRepository.getById(listId);
        if (!list || list.deletedAt) {
            throw new NotFoundError("List not found");
        }

        if (list.ownerId !== userId && !list.sharedWith.includes(userId)) {
            const nextList: StoredList = {
                ...list,
                sharedWith: [...list.sharedWith, userId],
                updatedAt: Date.now(),
            };
            await this.listRepository.save(nextList);
            await this.userRepository.addSharedList(userId, listId);
            return nextList;
        }

        return list;
    }

    async updateList(listId: string, userId: string, input: UpdateListInput): Promise<StoredList> {
        const list = await this.listRepository.getById(listId);
        if (!list || list.deletedAt) {
            throw new NotFoundError("List not found");
        }

        if (list.ownerId !== userId && !list.sharedWith.includes(userId)) {
            throw new ForbiddenError("Forbidden");
        }

        const nextList: StoredList = {
            ...list,
            updatedAt: Date.now(),
            items: input.items ?? list.items,
            title: input.patch?.title ?? list.title,
            categoryId: input.patch?.categoryId ?? list.categoryId,
            emoji: input.patch?.emoji ?? list.emoji,
        };

        await this.listRepository.save(nextList);
        return nextList;
    }

    async deleteList(listId: string, userId: string): Promise<void> {
        const list = await this.listRepository.getById(listId);
        if (!list || list.deletedAt) {
            return;
        }

        if (list.ownerId !== userId) {
            throw new ForbiddenError("Forbidden");
        }

        const nextList: StoredList = {
            ...list,
            deletedAt: Date.now(),
            updatedAt: Date.now(),
        };

        await this.listRepository.save(nextList);
        await this.userRepository.removeOwnedList(list.ownerId, list.listId);
        await Promise.all(list.sharedWith.map((sharedUserId) => this.userRepository.removeSharedList(sharedUserId, list.listId)));
    }
}
