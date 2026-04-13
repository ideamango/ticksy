import { useEffect, useState } from "react";
import { LogIn, UserRound } from "lucide-react";

const STORAGE_KEY = "ticksy-user-id";

function generateUserId(): string {
    return `TK${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function LoginStatusButton() {
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        if (typeof window === "undefined") return;
        const existing = window.localStorage.getItem(STORAGE_KEY) || "";
        setUserId(existing);
    }, []);

    const handleLogin = () => {
        if (typeof window === "undefined") return;
        if (userId) return;
        const newId = generateUserId();
        window.localStorage.setItem(STORAGE_KEY, newId);
        setUserId(newId);
    };

    if (userId) {
        return (
            <div
                className="h-9 max-w-[108px] px-2.5 rounded-full border border-border bg-background/70 flex items-center gap-1.5 text-foreground"
                title={`Login ID: ${userId}`}
                aria-label={`Login ID ${userId}`}
            >
                <UserRound className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[11px] sm:text-xs font-semibold truncate">{userId}</span>
            </div>
        );
    }

    return (
        <button
            onClick={handleLogin}
            className="h-9 px-3 rounded-full border border-border bg-background/70 hover:bg-muted/60 transition-colors text-xs font-semibold text-foreground flex items-center gap-1.5"
            aria-label="Login"
            title="Login"
            type="button"
        >
            <LogIn className="w-3.5 h-3.5" />
            Login
        </button>
    );
}
