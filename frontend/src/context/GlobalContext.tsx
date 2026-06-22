import {createContext, useState, ReactNode, useContext, useEffect } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface AccessTokenClaims extends JwtPayload {
    subscriptionType?: string;
    role?: string;
    permissions?: string[];
}

interface AuthenticationState {
    isLoggedIn: boolean;
    isPremiumUser: boolean;
    role: string | null;
    permissions: string[];
}

interface GlobalContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
    isPremiumUser: boolean;
    setIsPremiumUser: (value: boolean) => void;
    role: string | null;
    permissions: string[];
    isAdmin: boolean;
    hasPermission: (permission: string) => boolean;
  }
  interface GlobalProviderProps {
    children: ReactNode;
  }

export const UserContext = createContext< GlobalContextType | undefined>(undefined);

const emptyAuthentication: AuthenticationState = {
    isLoggedIn: false,
    isPremiumUser: false,
    role: null,
    permissions: [],
};

const readAuthentication = (): AuthenticationState => {
    const token = localStorage.getItem("accessToken");
    if (!token) return emptyAuthentication;

    try {
        const claims = jwtDecode<AccessTokenClaims>(token);
        return {
            isLoggedIn: true,
            isPremiumUser: claims.subscriptionType === "PREMIUM",
            role: claims.role ?? null,
            permissions: Array.isArray(claims.permissions) ? claims.permissions : [],
        };
    } catch {
        return emptyAuthentication;
    }
};


export const GlobalProvider = ({children}: GlobalProviderProps) => {
    const [authentication, setAuthentication] = useState<AuthenticationState>(readAuthentication);

    useEffect(() => {
      const updateAuthentication = () => setAuthentication(readAuthentication());
      window.addEventListener("auth-token-updated", updateAuthentication);
      return () => window.removeEventListener("auth-token-updated", updateAuthentication);
    }, []);

    const setIsLoggedIn = (value: boolean) => {
      setAuthentication(value ? readAuthentication() : emptyAuthentication);
    };

    const setIsPremiumUser = (value: boolean) => {
      setAuthentication(current => ({ ...current, isPremiumUser: value }));
    };

    const hasPermission = (permission: string) =>
      authentication.permissions.includes(permission);

    return(
        <UserContext.Provider value={{
          isLoggedIn: authentication.isLoggedIn,
          setIsLoggedIn,
          isPremiumUser: authentication.isPremiumUser,
          setIsPremiumUser,
          role: authentication.role,
          permissions: authentication.permissions,
          isAdmin: authentication.role === "ROLE_ADMIN",
          hasPermission,
        }}>
        {children}
        </UserContext.Provider >
    );

};

export const UseGlobalContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
