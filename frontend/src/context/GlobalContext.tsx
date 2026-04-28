import {createContext, useState, ReactNode, useContext, useEffect } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface GlobalContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
    isPremiumUser: boolean;
    setIsPremiumUser: (value: boolean) => void;
  }
  interface GlobalProviderProps {
    children: ReactNode;
  }

export const UserContext = createContext< GlobalContextType | undefined>(undefined);



export const GlobalProvider = ({children}: GlobalProviderProps) => {
    const [isLoggedIn, setIsLoggedInState] = useState<boolean>(false);
    const [isPremiumUser, setIsPremiumUserState] = useState<boolean>(false);

    useEffect(() => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        setIsLoggedInState(true);
        const decodedToken: any = jwtDecode<JwtPayload>(token);
        console.log("decoded token: ",decodedToken);
        
        const premiumUser = decodedToken["subscriptionType"] === "PREMIUM" ? "true" : "false";
        if (premiumUser) {
          setIsPremiumUserState(premiumUser === "true");
        }
      }
      
    }, []);

    const setIsLoggedIn = (value: boolean) => {
      setIsLoggedInState(value);
      // localStorage.setItem("isLoggedIn", String(value));
    };

    const setIsPremiumUser = (value: boolean) => {
      setIsPremiumUserState(value);
      // localStorage.setItem("isPremiumUser", String(value));
    };

    return(
        <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn, isPremiumUser, setIsPremiumUser }}>
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