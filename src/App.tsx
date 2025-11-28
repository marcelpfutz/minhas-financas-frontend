/**
 * Componente raiz da aplicação
 * Gerencia rotas e autenticação global
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivateRoute } from './components/PrivateRoute';

// Páginas públicas
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas privadas (protegidas)
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Categories from './pages/Categories';
import Transactions from './pages/Transactions';
import Transfers from './pages/Transfers';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rotas privadas (requerem autenticação) */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/wallets"
          element={
            <PrivateRoute>
              <Wallets />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          }
        />
        <Route
          path="/transfers"
          element={
            <PrivateRoute>
              <Transfers />
            </PrivateRoute>
          }
        />

        {/* Rota padrão - redireciona para dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
