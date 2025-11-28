/**
 * Context de Autenticação
 * Gerencia o estado global de autenticação do usuário
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';
import { User, AuthResponse, LoginData, RegisterData } from '../types';

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega dados do usuário ao iniciar a aplicação
  useEffect(() => {
    const loadStoredData = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    };

    loadStoredData();
  }, []);

  /**
   * Realiza login do usuário
   */
  const login = async (data: LoginData) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', data);
      const { user, token } = response.data;

      // Armazena no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Atualiza o estado
      setToken(token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao fazer login');
    }
  };

  /**
   * Registra novo usuário
   */
  const register = async (data: RegisterData) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      const { user, token } = response.data;

      // Armazena no localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Atualiza o estado
      setToken(token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao criar conta');
    }
  };

  /**
   * Faz logout do usuário
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar o contexto de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
