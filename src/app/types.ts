export type Unit = "count" | "kg" | "g" | "ltr" | "ml" | "mtr" | "pack" | "dozen";

export type CategoryId = "groceries" | "tasks" | "shopping" | "household" | "other";

export interface ListItem {
    id: string;
    description: string;
    quantity?: string;
    unit?: Unit;
    completed: boolean;
    createdAt: number;
    completedAt?: number;
}

export interface SharedList {
    id: string;
    title: string;
    categoryId: CategoryId;
    emoji?: string;
    createdAt: number;
    updatedAt: number;
    items: ListItem[];
}

export interface ListTemplate {
    id: string;
    name: string;
    description: string;
    emoji: string;
    categoryId: CategoryId;
    items: Array<{
        description: string;
        quantity?: string;
        unit?: Unit;
    }>;
}

export interface SharePayload {
    title: string;
    categoryId: CategoryId;
    emoji?: string;
    items: Array<{
        description: string;
        quantity?: string;
        unit?: Unit;
        completed?: boolean;
    }>;
}
