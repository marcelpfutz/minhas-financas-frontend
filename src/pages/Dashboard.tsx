/**
 * Página do Dashboard
 * Visão geral das finanças com resumos, gráficos e estatísticas
 */

import { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Spinner, Chip } from '@nextui-org/react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { DashboardSummary, Transaction } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [upcoming, setUpcoming] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega dados do dashboard
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryRes, upcomingRes] = await Promise.all([
          api.get<DashboardSummary>('/dashboard/summary'),
          api.get<Transaction[]>('/dashboard/upcoming?days=7'),
        ]);

        setSummary(summaryRes.data);
        setUpcoming(upcomingRes.data);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-default-500 mt-1">
            Visão geral das suas finanças
          </p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Saldo Total */}
          <Card>
            <CardBody className="gap-2">
              <div className="flex items-center justify-between">
                <p className="text-small text-default-500">Saldo Total</p>
                <Wallet className="text-primary" size={20} />
              </div>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(summary?.totalBalance || 0)}
              </p>
            </CardBody>
          </Card>

          {/* Receitas do Mês */}
          <Card>
            <CardBody className="gap-2">
              <div className="flex items-center justify-between">
                <p className="text-small text-default-500">Receitas</p>
                <TrendingUp className="text-success" size={20} />
              </div>
              <p className="text-2xl font-bold text-success">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(summary?.income.total || 0)}
              </p>
              <p className="text-tiny text-default-400">
                Pago: {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(summary?.income.paid || 0)}
              </p>
            </CardBody>
          </Card>

          {/* Despesas do Mês */}
          <Card>
            <CardBody className="gap-2">
              <div className="flex items-center justify-between">
                <p className="text-small text-default-500">Despesas</p>
                <TrendingDown className="text-danger" size={20} />
              </div>
              <p className="text-2xl font-bold text-danger">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(summary?.expense.total || 0)}
              </p>
              <p className="text-tiny text-default-400">
                Pago: {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(summary?.expense.paid || 0)}
              </p>
            </CardBody>
          </Card>

          {/* Balanço do Mês */}
          <Card>
            <CardBody className="gap-2">
              <div className="flex items-center justify-between">
                <p className="text-small text-default-500">Balanço</p>
                <Calendar className="text-default-400" size={20} />
              </div>
              <p className={`text-2xl font-bold ${
                (summary?.balance || 0) >= 0 ? 'text-success' : 'text-danger'
              }`}>
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(summary?.balance || 0)}
              </p>
              <p className="text-tiny text-default-400">
                Período: {summary?.period.month}/{summary?.period.year}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* Alertas */}
        {(summary?.overdueTransactions || 0) > 0 && (
          <Card className="border-l-4 border-danger">
            <CardBody>
              <div className="flex items-center gap-3">
                <AlertCircle className="text-danger flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-danger">
                    Atenção: Você tem {summary?.overdueTransactions} lançamento(s) vencido(s)
                  </p>
                  <p className="text-small text-default-500">
                    Verifique seus lançamentos pendentes
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Carteiras */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Minhas Carteiras</h2>
          </CardHeader>
          <CardBody>
            {summary?.wallets && summary.wallets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.wallets.map((wallet) => (
                  <Card key={wallet.id} shadow="sm">
                    <CardBody>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: wallet.color + '20' }}
                        >
                          {wallet.icon === 'wallet' ? '💼' : '💳'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{wallet.name}</p>
                          <p className="text-xl font-bold">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(wallet.balance)}
                          </p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-default-500 py-4">
                Nenhuma carteira cadastrada
              </p>
            )}
          </CardBody>
        </Card>

        {/* Próximos Vencimentos */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Próximos Vencimentos (7 dias)</h2>
          </CardHeader>
          <CardBody>
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-default-100 dark:bg-default-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: transaction.category.color + '20' }}
                      >
                        {transaction.type === 'INCOME' ? '📈' : '📉'}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-small text-default-500">
                          {transaction.category.name} • {transaction.wallet.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'INCOME' ? 'text-success' : 'text-danger'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}{' '}
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(transaction.amount)}
                      </p>
                      <p className="text-small text-default-500">
                        {format(new Date(transaction.dueDate), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-default-500 py-4">
                Nenhum lançamento nos próximos 7 dias
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
}
