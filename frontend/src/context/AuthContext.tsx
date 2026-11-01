import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthResponse, Role, Student, Canteen } from '../types';

interface AuthContextType {
  token: string | null;
  role: Role | null;
  user: {
    userId: number;
    fullName: string;
    email: string;
    phone: string;
  } | null;
  profile: Student | Canteen | null;
  login: (auth: AuthResponse) => void;
  logout: () => void;
  updateProfile: (profile: Student | Canteen) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('foodiehut_token'));
  const [role, setRole] = useState<Role | null>(() => (localStorage.getItem('foodiehut_role') as Role) || null);
  const [user, setUser] = useState<{ userId: number; fullName: string; email: string; phone: string } | null>(() => {
    const saved = localStorage.getItem('foodiehut_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<Student | Canteen | null>(() => {
    const saved = localStorage.getItem('foodiehut_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (auth: AuthResponse) => {
    setToken(auth.token);
    setRole(auth.role);
    const userInfo = {
      userId: auth.userId,
      fullName: auth.fullName,
      email: auth.email,
      phone: auth.phone,
    };
    setUser(userInfo);
    setProfile(auth.profile);

    localStorage.setItem('foodiehut_token', auth.token);
    localStorage.setItem('foodiehut_role', auth.role);
    localStorage.setItem('foodiehut_user', JSON.stringify(userInfo));
    localStorage.setItem('foodiehut_profile', JSON.stringify(auth.profile));
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem('foodiehut_token');
    localStorage.removeItem('foodiehut_role');
    localStorage.removeItem('foodiehut_user');
    localStorage.removeItem('foodiehut_profile');
    window.location.href = '/';
  };

  const updateProfile = (newProfile: Student | Canteen) => {
    setProfile(newProfile);
    localStorage.setItem('foodiehut_profile', JSON.stringify(newProfile));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        profile,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
