import { LogIn, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/auth-context";

export function LoginStatusButton() {
    const { userId, login, isLoading, isLoggingIn } = useAuth();

    const handleLogin = async () => {
        if (userId) return;
        try {
            const nextUserId = await login();
            if (nextUserId) {
                toast.success(`Logged in as ${nextUserId}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to login");
        }
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
            className="h-9 px-3 rounded-full border border-border bg-background/70 hover:bg-muted/60 transition-colors text-xs font-semibold text-foreground flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Login"
            title="Login"
            type="button"
            disabled={isLoading || isLoggingIn}
        >
            <LogIn className="w-3.5 h-3.5" />
            {isLoading || isLoggingIn ? "Loading..." : "Login"}
        </button>
    );
}
