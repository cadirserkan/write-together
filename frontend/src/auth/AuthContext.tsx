import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, hasToken, setToken, setUnauthorizedHandler } from '../api/client';
import type { AuthResponse, User } from '../api/types';
import { disablePush } from '../push';

interface AuthContextValue {
  user: User | null;
  // True while we check whether the stored token is still valid.
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(hasToken());

  useEffect(() => {
    // Any request that comes back with 401 ends up here.
    setUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
    });

    if (!hasToken()) {
      return;
    }
    api
      .me()
      .then(setUser)
      .catch(() => {
        // An expired token is handled by the handler above; anything else just shows the login page.
      })
      .finally(() => setLoading(false));
  }, []);

  function startSession(response: AuthResponse) {
    setToken(response.token);
    setUser(response.user);
  }

  async function login(username: string, password: string) {
    startSession(await api.login(username, password));
  }

  async function register(username: string, email: string, password: string) {
    startSession(await api.register(username, email, password));
  }

  async function logout() {
    // Stop notifications for this browser first, while we still have a token to do it with.
    try {
      await disablePush();
    } catch {
      // Not being able to unsubscribe should not keep someone logged in.
    }
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth can only be used inside <AuthProvider>');
  }
  return context;
}
