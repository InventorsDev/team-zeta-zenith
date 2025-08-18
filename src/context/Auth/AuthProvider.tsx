import {  useEffect, useState, type ReactNode } from "react";

import type { User } from "../../types/user";
import { setAccessToken } from "../../utils/tokenStore";
import { api } from "../../api/auth";
import { AuthContext } from "./AuthContext";

export default function AuthProvider({children}:{children: ReactNode}){
    const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On app load, try refreshing to get an access token and user
    (async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.accessToken);
        const me = await api.get("/auth/me");
        setUser(me.data);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    const me = await api.get("/auth/me");
    setUser(me.data);
  };

  const register = async (email: string, password: string) => {
    const { data } = await api.post("/auth/register", { email, password });
    setAccessToken(data.accessToken);
    const me = await api.get("/auth/me");
    setUser(me.data);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setAccessToken(null);
    setUser(null);
  };


    return (
        <AuthContext.Provider value={{user, loading,login, logout, register}}>
            {children}
        </AuthContext.Provider>
    )
}









