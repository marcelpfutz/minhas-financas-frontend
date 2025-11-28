/**
 * Página de Login
 * Formulário de autenticação para acesso ao sistema
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Divider,
} from '@nextui-org/react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3 items-center pt-8">
          <div className="text-5xl">💰</div>
          <div className="flex flex-col gap-1 items-center">
            <h1 className="text-2xl font-bold">Minhas Finanças</h1>
            <p className="text-small text-default-500">
              Entre para gerenciar suas finanças
            </p>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-danger-50 dark:bg-danger-100 text-danger-600 dark:text-danger-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              type="email"
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Mail className="text-default-400" size={18} />}
              isRequired
              variant="bordered"
            />

            <Input
              type="password"
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<Lock className="text-default-400" size={18} />}
              isRequired
              variant="bordered"
            />

            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={loading}
              startContent={!loading && <LogIn size={18} />}
              className="mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardBody>

        <Divider />

        <CardFooter className="flex justify-center">
          <p className="text-small text-default-500">
            Não tem uma conta?{' '}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
