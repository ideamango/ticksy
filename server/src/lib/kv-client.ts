import { env } from "../config/env";
import { FileKvFallback } from "./file-kv-fallback";

interface KvEnvelope {
    id?: string;
    value?: unknown;
}

function buildKeyUrl(key: string): string {
    return `${env.kvApiBaseUrl}/${encodeURIComponent(key)}`;
}

function parseEnvelope<T>(payload: unknown): T | null {
    if (payload == null) {
        return null;
    }

    if (typeof payload === "string") {
        return JSON.parse(payload) as T;
    }

    if (typeof payload === "object") {
        const candidate = payload as KvEnvelope;
        if (candidate.value === undefined) {
            return payload as T;
        }

        if (typeof candidate.value === "string") {
            return JSON.parse(candidate.value) as T;
        }

        return candidate.value as T;
    }

    return payload as T;
}

export class KvClient {
    private readonly fallback = new FileKvFallback();

    async get<T>(key: string): Promise<T | null> {
        try {
            const response = await fetch(buildKeyUrl(key), {
                method: "GET",
                headers: {
                    accept: "application/json",
                },
            });

            if (response.status === 404) {
                return this.fallback.get<T>(key);
            }

            if (!response.ok) {
                throw new Error(`KV GET failed for ${key}: ${response.status}`);
            }

            const data = await response.json();
            return parseEnvelope<T>(data);
        } catch {
            return this.fallback.get<T>(key);
        }
    }

    async put<T>(key: string, value: T): Promise<void> {
        try {
            const response = await fetch(buildKeyUrl(key), {
                method: "PUT",
                headers: {
                    accept: "application/json",
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    id: key,
                    value: JSON.stringify(value),
                }),
            });

            if (!response.ok) {
                throw new Error(`KV PUT failed for ${key}: ${response.status}`);
            }
        } catch {
            await this.fallback.put(key, value);
        }
    }
}
