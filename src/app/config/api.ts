const DEFAULT_API_URL = "http://localhost:4000";

function trimTrailingSlash(url: string): string {
    return url.replace(/\/+$/, "");
}

function resolveApiUrl(): string {
    const configuredUrl = import.meta.env.VITE_API_URL?.trim();
    if (configuredUrl) {
        return trimTrailingSlash(configuredUrl);
    }

    return DEFAULT_API_URL;
}

export const API_URL = resolveApiUrl();