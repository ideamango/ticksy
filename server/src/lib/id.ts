function randomSegment(length: number): string {
    return Math.random().toString(36).slice(2).toUpperCase().padEnd(length, "0").slice(0, length);
}

export function generateUserId(): string {
    return `TK${randomSegment(8)}`;
}
