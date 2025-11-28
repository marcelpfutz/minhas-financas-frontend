/**
 * Página de Lançamentos (Transações)
 * Gerenciamento de receitas e despesas
 */

import { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  useDisclosure,
  Spinner,
  Chip,
  Checkbox,
} from '@nextui-org/react';
import { Plus, Edit, Trash2, Check, Calendar } from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { Transaction, CreateTransactionData, Wallet, Category } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const [formData, setFormData] = useState<CreateTransactionData>({
    description: '',
    amount: 0,
    type: 'EXPENSE',
    dueDate: new Date().toISOString().split('T')[0],
    isPaid: false,
    isRecurring: false,
    notes: '',
    walletId: '',
    categoryId: '',
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsRes, walletsRes, categoriesRes] = await Promise.all([
        api.get<Transaction[]>('/transactions'),
        api.get<Wallet[]>('/wallets'),
        api.get<Category[]>('/categories'),
      ]);
      setTransactions(transactionsRes.data);
      setWallets(walletsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedTransaction(null);
    setFormData({
      description: '',
      amount: 0,
      type: 'EXPENSE',
      dueDate: new Date().toISOString().split('T')[0],
      isPaid: false,
      isRecurring: false,
      notes: '',
      walletId: wallets[0]?.id || '',
      categoryId: '',
    });
    onOpen();
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      dueDate: transaction.dueDate.split('T')[0],
      isPaid: transaction.isPaid,
      isRecurring: transaction.isRecurring,
      notes: transaction.notes || '',
      walletId: transaction.wallet.id,
      categoryId: transaction.category.id,
    });
    onOpen();
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (selectedTransaction) {
        await api.put(`/transactions/${selectedTransaction.id}`, formData);
      } else {
        await api.post('/transactions', formData);
      }
      await loadData();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar lançamento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;

    try {
      await api.delete(`/transactions/${id}`);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao deletar lançamento');
    }
  };

  const handlePay = async (id: string) => {
    try {
      await api.post(`/transactions/${id}/pay`, {
        paymentDate: new Date().toISOString(),
      });
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao marcar como pago');
    }
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lançamentos</h1>
            <p className="text-default-500 mt-1">
              Gerencie suas receitas e despesas
            </p>
          </div>
          <Button
            color="primary"
            startContent={<Plus size={18} />}
            onPress={handleCreate}
          >
            Novo Lançamento
          </Button>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardBody>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: transaction.category.color + '20' }}
                    >
                      {transaction.type === 'INCOME' ? '📈' : '📉'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{transaction.description}</p>
                        {transaction.isPaid ? (
                          <Chip size="sm" color="success" variant="flat">
                            Pago
                          </Chip>
                        ) : (
                          <Chip size="sm" color="warning" variant="flat">
                            Pendente
                          </Chip>
                        )}
                        {transaction.isRecurring && (
                          <Chip size="sm" variant="flat">
                            Recorrente
                          </Chip>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-small text-default-500">
                        <span>{transaction.category.name}</span>
                        <span>•</span>
                        <span>{transaction.wallet.name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(new Date(transaction.dueDate), 'dd/MM/yyyy', {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-xl font-bold ${
                          transaction.type === 'INCOME' ? 'text-success' : 'text-danger'
                        }`}
                      >
                        {transaction.type === 'INCOME' ? '+' : '-'}{' '}
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(transaction.amount)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!transaction.isPaid && (
                        <Button
                          size="sm"
                          color="success"
                          variant="flat"
                          isIconOnly
                          onPress={() => handlePay(transaction.id)}
                        >
                          <Check size={16} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="flat"
                        isIconOnly
                        onPress={() => handleEdit(transaction)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        isIconOnly
                        onPress={() => handleDelete(transaction.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardBody className="text-center py-12">
              <Calendar className="mx-auto text-default-300 mb-4" size={48} />
              <p className="text-default-500">Nenhum lançamento cadastrado</p>
            </CardBody>
          </Card>
        )}

        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <ModalHeader>
              {selectedTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Select
                  label="Tipo"
                  selectedKeys={[formData.type]}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'INCOME' | 'EXPENSE',
                      categoryId: '',
                    })
                  }
                  variant="bordered"
                  isDisabled={!!selectedTransaction}
                >
                  <SelectItem key="INCOME" value="INCOME">
                    Receita
                  </SelectItem>
                  <SelectItem key="EXPENSE" value="EXPENSE">
                    Despesa
                  </SelectItem>
                </Select>

                <Input
                  label="Descrição"
                  placeholder="Ex: Salário"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  isRequired
                  variant="bordered"
                />

                <Input
                  type="number"
                  label="Valor"
                  placeholder="0.00"
                  value={formData.amount.toString()}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  startContent={<span className="text-default-400">R$</span>}
                  isRequired
                  variant="bordered"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Carteira"
                    selectedKeys={formData.walletId ? [formData.walletId] : []}
                    onChange={(e) =>
                      setFormData({ ...formData, walletId: e.target.value })
                    }
                    variant="bordered"
                    isRequired
                  >
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Categoria"
                    selectedKeys={formData.categoryId ? [formData.categoryId] : []}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    variant="bordered"
                    isRequired
                  >
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <Input
                  type="date"
                  label="Data de Vencimento"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  variant="bordered"
                  isRequired
                />

                <Textarea
                  label="Observações"
                  placeholder="Informações adicionais..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  variant="bordered"
                />

                <div className="flex gap-4">
                  <Checkbox
                    isSelected={formData.isPaid}
                    onValueChange={(value) =>
                      setFormData({ ...formData, isPaid: value })
                    }
                  >
                    Já foi pago
                  </Checkbox>

                  <Checkbox
                    isSelected={formData.isRecurring}
                    onValueChange={(value) =>
                      setFormData({ ...formData, isRecurring: value })
                    }
                  >
                    Recorrente
                  </Checkbox>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={handleSave}
                isLoading={submitting}
              >
                {selectedTransaction ? 'Salvar' : 'Criar'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Layout>
  );
}
