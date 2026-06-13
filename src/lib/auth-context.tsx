'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Club, PlayerSportFocus, User } from '@/types';
import {
  getClub,
  getCurrentUser,
  login as storeLogin,
  logout as storeLogout,
  registerClub as storeRegisterClub,
  registerPlayer as storeRegisterPlayer,
  requestJoinClub as storeRequestJoin,
} from '@/lib/store';

interface AuthContextValue {
  user: User | null;
  club: Club | null;
  loading: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  registerClub: (input: {
    tofCode: string;
    clubName: string;
    sport: Club['sport'];
    adminName: string;
    email: string;
    password: string;
  }) => { user: User; club: Club };
  registerPlayer: (input: {
    joinCode: string;
    name: string;
    email: string;
    password: string;
    sportFocus?: PlayerSportFocus;
  }) => User;
  requestJoin: (input: {
    joinCode: string;
    name: string;
    email: string;
    password: string;
    sportFocus?: PlayerSportFocus;
  }) => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const current = getCurrentUser();
    setUser(current);
    setClub(current?.clubId ? getClub(current.clubId) : null);
  }, []);

  useEffect(() => {
    refresh();
    setLoading(false);
  }, [refresh]);

  const login = useCallback(
    (email: string, password: string) => {
      const u = storeLogin(email, password);
      setUser(u);
      setClub(u.clubId ? getClub(u.clubId) : null);
    },
    []
  );

  const logout = useCallback(() => {
    storeLogout();
    setUser(null);
    setClub(null);
  }, []);

  const registerClub = useCallback(
    (input: Parameters<AuthContextValue['registerClub']>[0]) => {
      const result = storeRegisterClub(input);
      setUser(result.user);
      setClub(result.club);
      return result;
    },
    []
  );

  const registerPlayer = useCallback(
    (input: Parameters<AuthContextValue['registerPlayer']>[0]) => {
      const u = storeRegisterPlayer(input);
      setUser(u);
      setClub(u.clubId ? getClub(u.clubId) : null);
      return u;
    },
    []
  );

  const requestJoin = useCallback(
    (input: Parameters<AuthContextValue['requestJoin']>[0]) => {
      storeRequestJoin(input);
      refresh();
    },
    [refresh]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        club,
        loading,
        login,
        logout,
        registerClub,
        registerPlayer,
        requestJoin,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
