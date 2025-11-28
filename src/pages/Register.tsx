/**
 * Página de Registro
 * Formulário para criação de nova conta
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
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
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
            <h1 className="text-2xl font-bold">Criar Conta</h1>
            <p className="text-small text-default-500">
              Comece a gerenciar suas finanças hoje
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
              type="text"
              label="Nome completo"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              startContent={<User className="text-default-400" size={18} />}
              isRequired
              variant="bordered"
            />

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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<Lock className="text-default-400" size={18} />}
              isRequired
              variant="bordered"
            />

            <Input
              type="password"
              label="Confirmar senha"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              startContent={<Lock className="text-default-400" size={18} />}
              isRequired
              variant="bordered"
            />

            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={loading}
              startContent={!loading && <UserPlus size={18} />}
              className="mt-2"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>
        </CardBody>

        <Divider />

        <CardFooter className="flex justify-center">
          <p className="text-small text-default-500">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
