/**
 * Componente de Rota Privada
 * Protege rotas que requerem autenticação
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '@nextui-org/react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { user, loading } = useAuth();

  // Mostra loading enquanto carrega dados de autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, mostra o conteúdo
  return <>{children}</>;
}
