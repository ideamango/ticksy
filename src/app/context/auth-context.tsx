import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "ticksy-user-id";

interface AuthContextValue {
  userId: string;
  isLoading: false;
  isLoggingIn: false;
  login: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getOrCreateUserId(): string {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  // Generate a new anonymous ID using the Web Crypto API
  const newId = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, newId);
  return newId;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId] = useState<string>(() => getOrCreateUserId());

  const login = useCallback(async (): Promise<string> => {
    // No-op: user is always logged in via their local UUID
    return userId;
  }, [userId]);

  const value = useMemo<AuthContextValue>(
    () => ({
      userId,
      isLoading: false,
      isLoggingIn: false,
      login,
    }),
    [userId, login]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}