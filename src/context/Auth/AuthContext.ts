import { createContext, useContext } from "react";
import { type AuthContextType } from "../../types/authContext";


export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext =()=> {
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error("useAuthContext must be used within an AuthProvider");
    return ctx;

}