/**
 * AuthContext.tsx
 * Provee el usuario autenticado, login, logout a toda la app.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService, tokenStorage } from "@/data";
import type { Usuario } from "@/data";

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Usuario>;
  logout: () => void;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Al montar, intenta recuperar sesión existente
  useEffect(() => {
    const init = async () => {
      if (tokenStorage.getAccess()) {
        try {
          const me = await authService.me();
          setUser(me);
        } catch {
          tokenStorage.clear();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const me = await authService.login(email, password);
    setUser(me);
    return me;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin: user?.rol === "admin",
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export default AuthContext;
