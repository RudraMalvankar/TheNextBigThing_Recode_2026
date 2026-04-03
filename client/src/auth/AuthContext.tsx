import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AuthUser, getCurrentUser, loginWithPassword, setAuthToken } from "../api";

const AUTH_TOKEN_KEY = "insightos_auth_token";

type AuthContextValue = {
  user: AuthUser | null;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap(): Promise<void> {
      const token = window.localStorage.getItem(AUTH_TOKEN_KEY);

      if (!token) {
        if (mounted) {
          setIsBootstrapping(false);
        }
        return;
      }

      setAuthToken(token);

      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        window.localStorage.removeItem(AUTH_TOKEN_KEY);
        setAuthToken(null);
      } finally {
        if (mounted) {
          setIsBootstrapping(false);
        }
      }
    }

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const { token, user: signedUser } = await loginWithPassword(email, password);
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    setAuthToken(token);
    setUser(signedUser);
  }, []);

  const logout = useCallback((): void => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isBootstrapping,
      login,
      logout,
    }),
    [isBootstrapping, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}