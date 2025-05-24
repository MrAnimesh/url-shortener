import {createContext, useState, ReactNode, useContext, useEffect } from "react";

interface GlobalContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
  }
  interface GlobalProviderProps {
    children: ReactNode;
  }

export const UserContext = createContext< GlobalContextType | undefined>(undefined);



export const GlobalProvider = ({children}: GlobalProviderProps) => {
    const [isLoggedIn, setIsLoggedInState] = useState<boolean>(false);

    useEffect(() => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        setIsLoggedInState(true);
      }
    }, []);

    const setIsLoggedIn = (value: boolean) => {
      setIsLoggedInState(value);
      // localStorage.setItem("isLoggedIn", String(value));
    };

    return(
        <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
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