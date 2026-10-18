import { createContext, useContext, useMemo, useState } from 'react';
import * as auth from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.getSession());

  const value = useMemo(
    () => ({
      user,
      async register(data) {
        const u = await auth.registerUser(data);
        setUser(u);
        return u;
      },
      async login(email, password) {
        const u = await auth.loginUser(email, password);
        setUser(u);
        return u;
      },
      logout() {
        auth.logout();
        setUser(null);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
