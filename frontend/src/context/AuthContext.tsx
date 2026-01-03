import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthResponse } from "../types";
import * as authService from "../services/authService";
import { getAuthToken, removeAuthToken } from "../lib/apiClient";

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
    const initAuth = async () => {
      try {
        const token = getAuthToken();

        if (token) {
          // Verify token and fetch user details
          const userData = await authService.verifyToken(token);
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        removeAuthToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (loginId: string, password: string) => {
    const response: AuthResponse = await authService.signIn({
      loginId,
      password,
    });
    setUser(response.user);
    // Token is already stored by authService via setAuthToken()
  };

  const signUp = async (data: any) => {
    // Note: SignUp is not in the API spec - only Admin can create employees
    throw new Error(
      "Public signup is not allowed. Contact your administrator.",
    );
  };

  const signOut = () => {
    setUser(null);
    removeAuthToken();
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
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
