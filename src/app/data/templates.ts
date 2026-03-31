import type { CategoryId, ListTemplate, SharedList, Unit } from "../types";

export const unitOptions: Unit[] = [
    "count",
    "kg",
    "g",
    "ltr",
    "ml",
    "mtr",
    "pack",
    "dozen",
];

export const categories: Array<{ id: CategoryId; label: string; emoji: string }> = [
    { id: "groceries", label: "Groceries", emoji: "🛒" },
    { id: "tasks", label: "Tasks", emoji: "✅" },
    { id: "shopping", label: "Shopping", emoji: "🛍️" },
    { id: "household", label: "Household", emoji: "🏠" },
    { id: "other", label: "Other", emoji: "📝" },
];

export const templates: ListTemplate[] = [
    {
        id: "tpl-weekly-grocery",
        name: "Weekly Grocery",
        emoji: "🛒",
        categoryId: "groceries",
        description: "Essential items for the week",
        items: [
            { description: "Milk", quantity: "2", unit: "ltr" },
            { description: "Eggs", quantity: "1", unit: "dozen" },
            { description: "Rice", quantity: "5", unit: "kg" },
            { description: "Tomatoes", quantity: "500", unit: "g" },
            { description: "Apples", quantity: "6", unit: "count" },
        ],
    },
    {
        id: "tpl-weekend-cleaning",
        name: "Weekend Cleaning",
        emoji: "🧹",
        categoryId: "tasks",
        description: "Deep clean checklist",
        items: [
            { description: "Dust shelves" },
            { description: "Mop floors" },
            { description: "Wash bedsheets" },
            { description: "Clean kitchen counter" },
            { description: "Sort laundry" },
        ],
    },
    {
        id: "tpl-home-supplies",
        name: "Home Supplies",
        emoji: "🏠",
        categoryId: "household",
        description: "Monthly household refill list",
        items: [
            { description: "Dish soap", quantity: "2", unit: "pack" },
            { description: "Trash bags", quantity: "1", unit: "pack" },
            { description: "Toilet paper", quantity: "2", unit: "pack" },
            { description: "Handwash", quantity: "3", unit: "count" },
        ],
    },
];

export const defaultLists: SharedList[] = [
    {
        id: "list-1",
        title: "Weekly Grocery",
        categoryId: "groceries",
        emoji: "🛒",
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 2 * 60 * 60 * 1000,
        items: [
            {
                id: "item-1",
                description: "Milk",
                quantity: "2",
                unit: "ltr",
                completed: false,
                createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
            },
            {
                id: "item-2",
                description: "Bread",
                quantity: "2",
                unit: "count",
                completed: true,
                createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
                completedAt: Date.now() - 24 * 60 * 60 * 1000,
            },
            {
                id: "item-3",
                description: "Eggs",
                quantity: "1",
                unit: "dozen",
                completed: false,
                createdAt: Date.now() - 24 * 60 * 60 * 1000,
            },
        ],
    },
    {
        id: "list-2",
        title: "Weekend Tasks",
        categoryId: "tasks",
        emoji: "✅",
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 24 * 60 * 60 * 1000,
        items: [
            {
                id: "item-4",
                description: "Pay electricity bill",
                completed: true,
                createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
                completedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
            },
            {
                id: "item-5",
                description: "Book plumber",
                completed: false,
                createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
            },
        ],
    },
];
