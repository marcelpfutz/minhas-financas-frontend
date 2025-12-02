/**
 * Cliente Axios configurado para requisições à API
 * Inclui interceptor para adicionar token de autenticação automaticamente
 */

import axios from 'axios';

// Cria instância do axios com configurações base
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se receber 401 (não autorizado), remove token e redireciona para login
    // EXCETO se for uma requisição de login/register (onde 401 é erro esperado)
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                             error.config?.url?.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/minhas-financas/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
