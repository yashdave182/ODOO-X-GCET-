import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthResponse } from "../types";
import * as authService from "../services/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response: AuthResponse = await authService.signIn({
      email,
      password,
    });
    setUser(response.user);
    localStorage.setItem("user", JSON.stringify(response.user));
    localStorage.setItem("token", response.token);
  };

  const signUp = async (data: any) => {
    const response: AuthResponse = await authService.signUp(data);
    setUser(response.user);
    localStorage.setItem("user", JSON.stringify(response.user));
    localStorage.setItem("token", response.token);
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    logout: signOut, // Alias for consistency
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
