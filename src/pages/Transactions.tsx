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

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [editMode, setEditMode] = useState<'single' | 'all' | null>(null);
  
  const [formData, setFormData] = useState<CreateTransactionData>({
    description: '',
    amount: 0,
    type: 'EXPENSE',
    dueDate: new Date().toISOString().split('T')[0],
    isPaid: false,
    isRecurring: false,
    recurringType: undefined,
    isInstallment: false,
    installments: undefined,
    notes: '',
    walletId: '',
    categoryId: '',
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  const { 
    isOpen: isEditConfirmOpen, 
    onOpen: onEditConfirmOpen, 
    onClose: onEditConfirmClose 
  } = useDisclosure();
  const [submitting, setSubmitting] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

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
      recurringType: undefined,
      isInstallment: false,
      installments: undefined,
      notes: '',
      walletId: wallets[0]?.id || '',
      categoryId: '',
    });
    onOpen();
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    
    // Se for recorrente ou parcelado, pergunta se quer editar todos
    if (transaction.recurringGroupId || transaction.installmentGroupId) {
      setEditMode(null);
      onEditConfirmOpen();
    }
    
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      dueDate: transaction.dueDate.split('T')[0],
      isPaid: transaction.isPaid,
      isRecurring: transaction.isRecurring,
      recurringType: transaction.recurringType,
      isInstallment: transaction.isInstallment,
      installments: transaction.installments,
      notes: transaction.notes || '',
      walletId: transaction.wallet.id,
      categoryId: transaction.category.id,
    });
  };

  const confirmEdit = (mode: 'single' | 'all') => {
    setEditMode(mode);
    onEditConfirmClose();
    onOpen();
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (selectedTransaction) {
        // Atualização
        const updateData: any = { ...formData };
        if (editMode === 'all') {
          updateData.updateAll = true;
        }
        await api.put(`/transactions/${selectedTransaction.id}`, updateData);
      } else {
        // Criação
        await api.post('/transactions', formData);
      }
      await loadData();
      onClose();
      setEditMode(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar lançamento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction.id);
    
    // Se for recorrente ou parcelado, pergunta se quer deletar todos
    if (transaction.recurringGroupId || transaction.installmentGroupId) {
      onDeleteOpen();
    } else {
      // Deleta direto se for um lançamento único
      confirmDelete('single');
    }
  };

  const confirmDelete = async (mode: 'single' | 'all') => {
    if (!transactionToDelete) return;

    try {
      const params = mode === 'all' ? '?deleteAll=true' : '';
      await api.delete(`/transactions/${transactionToDelete}${params}`);
      await loadData();
      onDeleteClose();
      setTransactionToDelete(null);
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
                          <Chip size="sm" variant="flat" color="secondary">
                            Recorrente
                          </Chip>
                        )}
                        {transaction.isInstallment && (
                          <Chip size="sm" variant="flat" color="primary">
                            {transaction.currentInstallment}/{transaction.installments}
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
                          {transaction.dueDate.split('T')[0].split('-').reverse().join('/')}
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
                        onPress={() => handleDeleteClick(transaction)}
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

                <div className="space-y-4 border-t pt-4">
                  <div className="flex gap-4">
                    <Checkbox
                      isSelected={formData.isPaid}
                      onValueChange={(value) =>
                        setFormData({ ...formData, isPaid: value })
                      }
                    >
                      Já foi pago
                    </Checkbox>
                  </div>

                  <div className="flex gap-4">
                    <Checkbox
                      isSelected={formData.isRecurring}
                      onValueChange={(value) => {
                        setFormData({ 
                          ...formData, 
                          isRecurring: value,
                          isInstallment: value ? false : formData.isInstallment,
                          recurringType: value ? 'MONTHLY' : undefined
                        });
                      }}
                      isDisabled={formData.isInstallment}
                    >
                      Lançamento Recorrente
                    </Checkbox>

                    <Checkbox
                      isSelected={formData.isInstallment}
                      onValueChange={(value) => {
                        setFormData({ 
                          ...formData, 
                          isInstallment: value,
                          isRecurring: value ? false : formData.isRecurring,
                          installments: value ? 2 : undefined
                        });
                      }}
                      isDisabled={formData.isRecurring}
                    >
                      Lançamento Parcelado
                    </Checkbox>
                  </div>

                  {formData.isRecurring && (
                    <Select
                      label="Tipo de Recorrência"
                      selectedKeys={formData.recurringType ? [formData.recurringType] : []}
                      onChange={(e) =>
                        setFormData({ 
                          ...formData, 
                          recurringType: e.target.value as 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'INDEFINITE'
                        })
                      }
                      variant="bordered"
                      isRequired
                    >
                      <SelectItem key="WEEKLY" value="WEEKLY">
                        Semanal
                      </SelectItem>
                      <SelectItem key="MONTHLY" value="MONTHLY">
                        Mensal
                      </SelectItem>
                      <SelectItem key="YEARLY" value="YEARLY">
                        Anual
                      </SelectItem>
                      <SelectItem key="INDEFINITE" value="INDEFINITE">
                        Sem data definida (36 meses)
                      </SelectItem>
                    </Select>
                  )}

                  {formData.isInstallment && (
                    <Input
                      type="number"
                      label="Número de Parcelas"
                      placeholder="Ex: 12"
                      value={formData.installments?.toString() || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          installments: parseInt(e.target.value) || 2,
                        })
                      }
                      min={2}
                      isRequired
                      variant="bordered"
                      description="O valor será dividido igualmente entre as parcelas"
                    />
                  )}
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

        {/* Modal de Confirmação de Exclusão */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
          <ModalContent>
            <ModalHeader>Excluir Lançamento</ModalHeader>
            <ModalBody>
              <p>
                Este lançamento faz parte de um grupo (recorrente ou parcelado).
                Deseja excluir:
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={() => {
                  confirmDelete('single');
                }}
              >
                Apenas este lançamento
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  confirmDelete('all');
                }}
              >
                Todos do grupo
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de Confirmação de Edição */}
        <Modal isOpen={isEditConfirmOpen} onClose={onEditConfirmClose}>
          <ModalContent>
            <ModalHeader>Editar Lançamento</ModalHeader>
            <ModalBody>
              <p>
                Este lançamento faz parte de um grupo (recorrente ou parcelado).
                Deseja editar:
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={() => {
                  confirmEdit('single');
                }}
              >
                Apenas este lançamento
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  confirmEdit('all');
                }}
              >
                Todos do grupo
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Layout>
  );
}
