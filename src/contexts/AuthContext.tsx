
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthState } from "@/types";
import { authAPI } from "@/services/api";
import { toast } from "sonner";

interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (!authState.token) {
        setAuthState({
          ...authState,
          isLoading: false,
        });
        return;
      }

      try {
        const userData = await authAPI.getProfile();
        setAuthState({
          user: userData,
          token: authState.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        localStorage.removeItem("token");
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Authentication failed. Please log in again.",
        });
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState({
        ...authState,
        isLoading: true,
      });

      const data = await authAPI.login({ email, password });
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      toast.success("Successfully logged in!");
    } catch (error: any) {
      setAuthState({
        ...authState,
        isLoading: false,
        error: error.toString(),
      });
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setAuthState({
        ...authState,
        isLoading: true,
      });

      const data = await authAPI.register({ name, email, password });
      setAuthState({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      toast.success("Successfully registered and logged in!");
    } catch (error: any) {
      setAuthState({
        ...authState,
        isLoading: false,
        error: error.toString(),
      });
    }
  };

  const logout = () => {
    authAPI.logout();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    toast.success("Successfully logged out!");
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
