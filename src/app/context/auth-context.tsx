import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const API_URL = "http://localhost:4000";
const STORAGE_KEY = "ticksy-user-id";

interface AuthUser {
  userId: string;
  ownedListIds: string[];
  sharedListIds: string[];
  createdAt: number;
  updatedAt: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  userId: string | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  login: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUserId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(STORAGE_KEY);
}

function persistUserId(userId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (userId) {
    window.localStorage.setItem(STORAGE_KEY, userId);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [storedUserId, setStoredUserId] = useState<string | null>(() => getStoredUserId());
  const [isLoading, setIsLoading] = useState(Boolean(getStoredUserId()));
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const applyUser = useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser);
    const nextUserId = nextUser?.userId ?? null;
    setStoredUserId(nextUserId);
    persistUserId(nextUserId);
  }, []);

  const loginWithUserId = useCallback(async (preferredUserId?: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(preferredUserId ? { userId: preferredUserId } : {}),
    });

    if (!response.ok) {
      throw new Error(`Login failed with status ${response.status}`);
    }

    const data = await response.json();
    const nextUser = data.user as AuthUser;
    applyUser(nextUser);
    return nextUser.userId;
  }, [applyUser]);

  useEffect(() => {
    if (!storedUserId) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    loginWithUserId(storedUserId)
      .catch((error) => {
        if (!isCancelled) {
          console.error(error);
          applyUser(null);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [applyUser, loginWithUserId, storedUserId]);

  const login = useCallback(async () => {
    if (isLoggingIn) {
      return user?.userId ?? storedUserId;
    }

    setIsLoggingIn(true);
    try {
      const userId = await loginWithUserId();
      return userId;
    } finally {
      setIsLoggingIn(false);
    }
  }, [isLoggingIn, loginWithUserId, storedUserId, user?.userId]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    userId: user?.userId ?? storedUserId,
    isLoading,
    isLoggingIn,
    login,
  }), [isLoading, isLoggingIn, login, storedUserId, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}