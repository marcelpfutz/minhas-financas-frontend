/**
 * Página do Dashboard
 * Visão geral das finanças com resumos, gráficos e estatísticas
 */

import { useEffect, useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Spinner, 
  Select, 
  SelectItem 
} from '@nextui-org/react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { DashboardSummary, Transaction } from '../types';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

type PeriodType = 'week' | 'biweekly' | 'month';

// Calcula o intervalo de datas baseado no tipo de período
const calculateDateRange = (type: PeriodType) => {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (type) {
    case 'week':
      // Semana atual (domingo a sábado)
      start = startOfWeek(now, { weekStartsOn: 0 });
      end = endOfWeek(now, { weekStartsOn: 0 });
      break;

    case 'biweekly':
      // Quinzena (1-15 ou 16-fim do mês)
      const dayOfMonth = now.getDate();
      if (dayOfMonth <= 15) {
        start = startOfMonth(now);
        end = new Date(now.getFullYear(), now.getMonth(), 15, 23, 59, 59);
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), 16);
        end = endOfMonth(now);
      }
      break;

    case 'month':
    default:
      // Mês completo
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
  }

  return { start, end };
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [upcoming, setUpcoming] = useState<Transaction[]>([]);
  const [paidTransactions, setPaidTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  // Carrega o tipo de período salvo no localStorage ou usa 'month' como padrão
  const [periodType, setPeriodType] = useState<PeriodType>(() => {
    const saved = localStorage.getItem('dashboard-period-type');
    return (saved as PeriodType) || 'month';
  });
  // Inicializa dateRange com o cálculo correto do período salvo
  const [dateRange, setDateRange] = useState(() => {
    const saved = localStorage.getItem('dashboard-period-type');
    return calculateDateRange((saved as PeriodType) || 'month');
  });
  const [walletsExpanded, setWalletsExpanded] = useState(false);
  const [upcomingExpanded, setUpcomingExpanded] = useState(false);
  const [paidExpanded, setPaidExpanded] = useState(false);

  // Atualiza o período quando o tipo muda e salva no localStorage
  useEffect(() => {
    const range = calculateDateRange(periodType);
    setDateRange(range);
    // Salva a preferência do usuário
    localStorage.setItem('dashboard-period-type', periodType);
  }, [periodType]);

  // Carrega dados do dashboard
  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        // Calcula quantos dias faltam até o fim do período
        const daysUntilEnd = Math.ceil(
          (dateRange.end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        const [summaryRes, upcomingRes, paidRes] = await Promise.all([
          api.get<DashboardSummary>('/dashboard/summary', {
            params: {
              startDate: dateRange.start.toISOString(),
              endDate: dateRange.end.toISOString(),
            },
          }),
          api.get<Transaction[]>('/dashboard/upcoming', {
            params: {
              days: Math.max(daysUntilEnd, 7), // Mínimo 7 dias
            },
          }),
          api.get<Transaction[]>('/transactions', {
            params: {
              startDate: dateRange.start.toISOString(),
              endDate: dateRange.end.toISOString(),
              isPaid: true,
            },
          }),
        ]);

        setSummary(summaryRes.data);
        setUpcoming(upcomingRes.data);
        setPaidTransactions(paidRes.data);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [dateRange]);

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
        {/* Cabeçalho com Filtro de Período */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-default-500 mt-1">
              Visão geral das suas finanças
            </p>
          </div>

          {/* Filtro de Período */}
          <div className="flex items-center gap-3">
            <Filter className="text-default-400" size={20} />
            <Select
              label="Período"
              placeholder="Selecione o período"
              selectedKeys={[periodType]}
              onChange={(e) => setPeriodType(e.target.value as PeriodType)}
              className="w-48"
              size="sm"
            >
              <SelectItem key="week" value="week">
                Semana Atual
              </SelectItem>
              <SelectItem key="biweekly" value="biweekly">
                Quinzena Atual
              </SelectItem>
              <SelectItem key="month" value="month">
                Mês Atual
              </SelectItem>
            </Select>
          </div>
        </div>

        {/* Indicador do Período Selecionado */}
        <Card className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary">
          <CardBody>
            <div className="flex items-center gap-3">
              <Calendar className="text-primary" size={20} />
              <div>
                <p className="font-semibold text-primary">
                  {periodType === 'week' && 'Semana: '}
                  {periodType === 'biweekly' && 'Quinzena: '}
                  {periodType === 'month' && 'Mês: '}
                  {format(dateRange.start, 'dd/MM/yyyy', { locale: ptBR })} até{' '}
                  {format(dateRange.end, 'dd/MM/yyyy', { locale: ptBR })}
                </p>
                <p className="text-small text-default-500">
                  Dados atualizados em tempo real
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

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

          {/* Balanço do Período */}
          <Card>
            <CardBody className="gap-2">
              <div className="flex items-center justify-between">
                <p className="text-small text-default-500">Balanço do Período</p>
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
                Balanço considerando receitas e despesas pagas
              </p>
              {/* <p className="text-tiny text-default-500 mt-1">
                {(summary?.balance || 0) >= 0 
                  ? '✓ Você ganhou mais do que gastou' 
                  : '⚠ Você gastou mais do que ganhou'}
              </p> */}
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
          <CardHeader className="flex justify-between items-center cursor-pointer hover:bg-default-100 transition-colors"
            onClick={() => setWalletsExpanded(!walletsExpanded)}
          >
            <h2 className="text-xl font-semibold">Minhas Carteiras</h2>
            <button
              className="p-2 rounded-lg hover:bg-default-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setWalletsExpanded(!walletsExpanded);
              }}
              aria-label={walletsExpanded ? 'Minimizar' : 'Expandir'}
            >
              {walletsExpanded ? (
                <ChevronUp className="text-default-500" size={20} />
              ) : (
                <ChevronDown className="text-default-500" size={20} />
              )}
            </button>
          </CardHeader>
          {walletsExpanded && (
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
          )}
        </Card>

        {/* Próximos Vencimentos */}
        <Card>
          <CardHeader className="flex justify-between items-center cursor-pointer hover:bg-default-100 transition-colors"
            onClick={() => setUpcomingExpanded(!upcomingExpanded)}
          >
            <h2 className="text-xl font-semibold">
              Próximos Vencimentos ({
                periodType === 'week' ? 'esta semana' :
                periodType === 'biweekly' ? 'nesta quinzena' :
                'neste mês'
              })
            </h2>
            <button
              className="p-2 rounded-lg hover:bg-default-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setUpcomingExpanded(!upcomingExpanded);
              }}
              aria-label={upcomingExpanded ? 'Minimizar' : 'Expandir'}
            >
              {upcomingExpanded ? (
                <ChevronUp className="text-default-500" size={20} />
              ) : (
                <ChevronDown className="text-default-500" size={20} />
              )}
            </button>
          </CardHeader>
          {upcomingExpanded && (
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
                  Nenhum lançamento próximo do vencimento
                </p>
              )}
            </CardBody>
          )}
        </Card>

        {/* Movimentos Pagos */}
        <Card>
          <CardHeader className="flex justify-between items-center cursor-pointer hover:bg-default-100 transition-colors"
            onClick={() => setPaidExpanded(!paidExpanded)}
          >
            <h2 className="text-xl font-semibold">
              Movimentos Pagos ({
                periodType === 'week' ? 'esta semana' :
                periodType === 'biweekly' ? 'nesta quinzena' :
                'neste mês'
              })
            </h2>
            <button
              className="p-2 rounded-lg hover:bg-default-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setPaidExpanded(!paidExpanded);
              }}
              aria-label={paidExpanded ? 'Minimizar' : 'Expandir'}
            >
              {paidExpanded ? (
                <ChevronUp className="text-default-500" size={20} />
              ) : (
                <ChevronDown className="text-default-500" size={20} />
              )}
            </button>
          </CardHeader>
          {paidExpanded && (
            <CardBody>
              {paidTransactions.length > 0 ? (
                <div className="space-y-3">
                  {paidTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-default-100 dark:bg-default-50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: transaction.category.color + '20' }}
                        >
                          {transaction.type === 'INCOME' ? '✅' : '💸'}
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
                          {format(new Date(transaction.paymentDate || transaction.dueDate), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-default-500 py-4">
                  Nenhum movimento pago no período
                </p>
              )}
            </CardBody>
          )}
        </Card>
      </div>
    </Layout>
  );
}
