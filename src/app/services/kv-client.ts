/**
 * Browser-side client for the AWS KV API.
 * Replaces the Node.js server's KvClient — called directly from the browser.
 */

const KV_BASE = "https://i3qgw56auc.execute-api.ap-south-1.amazonaws.com/api/kv";

function parseEnvelope<T>(data: unknown): T | null {
    if (data == null) return null;

    if (typeof data === "string") {
        try { return JSON.parse(data) as T; } catch { return null; }
    }

    if (typeof data === "object") {
        const candidate = data as { value?: unknown };
        if (candidate.value === undefined) return data as T;
        if (typeof candidate.value === "string") {
            try { return JSON.parse(candidate.value) as T; } catch { return null; }
        }
        return candidate.value as T;
    }

    return data as T;
}

export async function kvGet<T>(key: string): Promise<T | null> {
    try {
        const res = await fetch(`${KV_BASE}/${key}`, {
            headers: { accept: "application/json" },
        });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`KV GET failed (${key}): ${res.status}`);
        const data = await res.json();
        return parseEnvelope<T>(data);
    } catch (err) {
        console.error("[kv-client] GET error", key, err);
        return null;
    }
}

export async function kvPut<T>(key: string, value: T): Promise<void> {
    try {
        const res = await fetch(`${KV_BASE}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify({ id: key, value: JSON.stringify(value) }),
        });
        if (!res.ok) throw new Error(`KV PUT failed (${key}): ${res.status}`);
    } catch (err) {
        console.error("[kv-client] PUT error", key, err);
        throw err;
    }
}
