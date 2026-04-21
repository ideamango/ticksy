export interface StoredListItem {
    id: string;
    description: string;
    quantity?: string;
    unit?: string;
    completed: boolean;
    createdAt: number;
    completedAt?: number;
}

export interface StoredList {
    schemaVersion?: number;
    listId: string;
    ownerId: string;
    sharedWith: string[];
    title: string;
    categoryId?: string;
    emoji?: string;
    items: StoredListItem[];
    createdAt: number;
    updatedAt: number;
    deletedAt?: number;
}

export interface StoredUser {
    schemaVersion?: number;
    userId: string;
    ownedListIds: string[];
    sharedListIds: string[];
    createdAt: number;
    updatedAt: number;
}

export interface ListPatch {
    title?: string;
    categoryId?: string;
    emoji?: string;
}
