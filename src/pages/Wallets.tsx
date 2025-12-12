/**
 * Página de Carteiras
 * Gerenciamento completo de carteiras (criar, editar, listar, deletar)
 */

import { useEffect, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  useDisclosure,
  Spinner,
  Chip,
} from '@nextui-org/react';
import { Wallet as WalletIcon, Plus, Edit, Trash2, Power } from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { Wallet, CreateWalletData, Transaction } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Wallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [walletTransactions, setWalletTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [formData, setFormData] = useState<CreateWalletData>({
    name: '',
    description: '',
    balance: 0,
    color: '#3B82F6',
    icon: 'wallet',
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isTransactionsOpen, 
    onOpen: onTransactionsOpen, 
    onClose: onTransactionsClose 
  } = useDisclosure();
  const { 
    isOpen: isConfirmOpen, 
    onOpen: onConfirmOpen, 
    onClose: onConfirmClose 
  } = useDisclosure();
  const {
    isOpen: isAlertOpen,
    onOpen: onAlertOpen,
    onClose: onAlertClose
  } = useDisclosure();
  const [submitting, setSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'toggle' | 'delete';
    wallet?: Wallet;
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [alertMessage, setAlertMessage] = useState({ title: '', message: '', type: 'error' as 'error' | 'success' });

  const showAlert = (title: string, message: string, type: 'error' | 'success' = 'error') => {
    setAlertMessage({ title, message, type });
    onAlertOpen();
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      // Inclui carteiras inativas na tela de gerenciamento
      const response = await api.get<Wallet[]>('/wallets', {
        params: { includeInactive: 'true' }
      });
      setWallets(response.data);
    } catch (error) {
      console.error('Erro ao carregar carteiras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedWallet(null);
    setFormData({
      name: '',
      description: '',
      balance: 0,
      color: '#3B82F6',
      icon: 'wallet',
    });
    onOpen();
  };

  const handleEdit = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setFormData({
      name: wallet.name,
      description: wallet.description || '',
      balance: wallet.balance,
      color: wallet.color,
      icon: wallet.icon,
    });
    onOpen();
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (selectedWallet) {
        await api.put(`/wallets/${selectedWallet.id}`, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
        });
      } else {
        await api.post('/wallets', formData);
      }
      await loadWallets();
      onClose();
    } catch (error: any) {
      showAlert('Erro ao Salvar', error.response?.data?.error || 'Erro ao salvar carteira');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const wallet = wallets.find(w => w.id === id);
    if (!wallet) return;

    setConfirmAction({
      type: 'delete',
      wallet,
      message: wallet.balance !== 0 
        ? `Não é possível excluir a carteira "${wallet.name}" pois ela possui saldo de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(wallet.balance)}. Transfira ou ajuste o saldo para R$ 0,00 primeiro.`
        : `Tem certeza que deseja excluir a carteira "${wallet.name}"? Esta ação não poderá ser desfeita.`,
      onConfirm: async () => {
        try {
          await api.delete(`/wallets/${id}`);
          await loadWallets();
          onConfirmClose();
        } catch (error: any) {
          showAlert('Erro ao Deletar', error.response?.data?.error || 'Erro ao deletar carteira');
        }
      },
    });
    onConfirmOpen();
  };

  const handleToggleActive = async (wallet: Wallet) => {
    const newStatus = !wallet.isActive;
    const action = newStatus ? 'ativar' : 'desativar';
    
    setConfirmAction({
      type: 'toggle',
      wallet,
      message: `Tem certeza que deseja ${action} a carteira "${wallet.name}"?${
        !newStatus ? ' Carteiras inativas não aparecem no dashboard e não podem receber novos lançamentos.' : ''
      }`,
      onConfirm: async () => {
        try {
          await api.put(`/wallets/${wallet.id}`, {
            isActive: newStatus,
          });
          await loadWallets();
          onConfirmClose();
        } catch (error: any) {
          showAlert(`Erro ao ${action.charAt(0).toUpperCase() + action.slice(1)}`, error.response?.data?.error || `Erro ao ${action} carteira`);
        }
      },
    });
    onConfirmOpen();
  };

  const handleViewTransactions = async (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setLoadingTransactions(true);
    onTransactionsOpen();

    try {
      const response = await api.get<Transaction[]>(`/wallets/${wallet.id}/transactions`);
      setWalletTransactions(response.data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      alert('Erro ao carregar transações da carteira');
    } finally {
      setLoadingTransactions(false);
    }
  };

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
            <h1 className="text-3xl font-bold">Carteiras</h1>
            <p className="text-default-500 mt-1">
              Gerencie suas contas e carteiras
            </p>
          </div>
          <Button
            color="primary"
            startContent={<Plus size={18} />}
            onPress={handleCreate}
          >
            Nova Carteira
          </Button>
        </div>

        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <Card 
                key={wallet.id} 
                isPressable
                onPress={() => handleViewTransactions(wallet)}
                className="hover:scale-[1.02] transition-transform"
              >
                <CardHeader className="flex gap-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: wallet.color + '20' }}
                  >
                    {wallet.icon === 'wallet' ? '💼' : '💳'}
                  </div>
                  <div className="flex flex-col flex-1">
                    <p className="text-md font-semibold">{wallet.name}</p>
                    {wallet.description && (
                      <p className="text-small text-default-500">
                        {wallet.description}
                      </p>
                    )}
                  </div>
                  <Chip 
                    size="sm" 
                    color={wallet.isActive ? "success" : "default"} 
                    variant="flat"
                  >
                    {wallet.isActive ? 'Ativa' : 'Inativa'}
                  </Chip>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div>
                      <p className="text-small text-default-500">Saldo</p>
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(wallet.balance)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<Edit size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(wallet);
                        }}
                        className="flex-1"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        color={wallet.isActive ? "default" : "success"}
                        variant="flat"
                        startContent={<Power size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleActive(wallet);
                        }}
                        className="flex-1"
                      >
                        {wallet.isActive ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        startContent={<Trash2 size={16} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(wallet.id);
                        }}
                        className="flex-1"
                        isDisabled={wallet.balance !== 0}
                      >
                        Excluir
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
              <WalletIcon className="mx-auto text-default-300 mb-4" size={48} />
              <p className="text-default-500">Nenhuma carteira cadastrada</p>
              <p className="text-small text-default-400 mt-1">
                Crie sua primeira carteira para começar
              </p>
            </CardBody>
          </Card>
        )}

        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <ModalHeader>
              {selectedWallet ? 'Editar Carteira' : 'Nova Carteira'}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Nome"
                  placeholder="Ex: Conta Corrente"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  isRequired
                  variant="bordered"
                />

                <Textarea
                  label="Descrição"
                  placeholder="Ex: Banco XYZ - Conta Principal"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  variant="bordered"
                />

                {!selectedWallet && (
                  <Input
                    type="number"
                    label="Saldo Inicial"
                    placeholder="0.00"
                    value={formData.balance?.toString() || '0'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        balance: parseFloat(e.target.value) || 0,
                      })
                    }
                    startContent={<span className="text-default-400">R$</span>}
                    variant="bordered"
                  />
                )}

                <div className="flex gap-4">
                  <Input
                    type="color"
                    label="Cor"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="flex-1"
                    variant="bordered"
                  />

                  <Input
                    label="Ícone"
                    placeholder="wallet ou bank"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="flex-1"
                    variant="bordered"
                  />
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
                {selectedWallet ? 'Salvar' : 'Criar'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isTransactionsOpen} onClose={onTransactionsClose} size="3xl" scrollBehavior="inside">
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: selectedWallet?.color + '20' }}
                >
                  {selectedWallet?.icon === 'wallet' ? '💼' : '💳'}
                </div>
                <div>
                  <p className="text-lg font-semibold">{selectedWallet?.name}</p>
                  <p className="text-sm text-default-500 font-normal">
                    Últimas movimentações (15 dias)
                  </p>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              {loadingTransactions ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : walletTransactions.length > 0 ? (
                <div className="space-y-3">
                  {walletTransactions.map((transaction) => (
                    <Card key={transaction.id} shadow="sm">
                      <CardBody>
                        <div className="flex items-center justify-between">
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
                                {transaction.category.name}
                                {transaction.isPaid && (
                                  <Chip size="sm" color="success" variant="flat" className="ml-2">
                                    Pago
                                  </Chip>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${
                              transaction.type === 'INCOME' ? 'text-success' : 'text-danger'
                            }`}>
                              {transaction.type === 'INCOME' ? '+' : '-'}{' '}
                              {new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                              }).format(transaction.amount)}
                            </p>
                            <p className="text-small text-default-400">
                              {format(new Date(transaction.dueDate), 'dd/MM/yyyy', {
                                locale: ptBR,
                              })}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-default-500">Nenhuma movimentação nos últimos 15 dias</p>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onTransactionsClose}>
                Fechar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de Confirmação */}
        <Modal isOpen={isConfirmOpen} onClose={onConfirmClose}>
          <ModalContent>
            <ModalHeader>
              {confirmAction?.type === 'delete' ? 'Excluir Carteira' : 
               confirmAction?.wallet?.isActive ? 'Desativar Carteira' : 'Ativar Carteira'}
            </ModalHeader>
            <ModalBody>
              <p className="text-default-700">{confirmAction?.message}</p>
              {confirmAction?.wallet && (
                <Card className="mt-4" shadow="sm">
                  <CardBody>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: confirmAction.wallet.color + '20' }}
                      >
                        {confirmAction.wallet.icon === 'wallet' ? '💼' : '💳'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{confirmAction.wallet.name}</p>
                        <p className="text-small text-default-500">
                          Saldo: {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(confirmAction.wallet.balance)}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onConfirmClose}>
                Cancelar
              </Button>
              {confirmAction?.wallet?.balance === 0 || confirmAction?.type === 'toggle' ? (
                <Button
                  color={confirmAction?.type === 'delete' ? 'danger' : 'primary'}
                  onPress={() => confirmAction?.onConfirm()}
                >
                  {confirmAction?.type === 'delete' ? 'Excluir' :
                   confirmAction?.wallet?.isActive ? 'Desativar' : 'Ativar'}
                </Button>
              ) : null}
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de Alerta */}
        <Modal isOpen={isAlertOpen} onClose={onAlertClose}>
          <ModalContent>
            <ModalHeader className={alertMessage.type === 'error' ? 'text-danger' : 'text-success'}>
              {alertMessage.title}
            </ModalHeader>
            <ModalBody>
              <p className="text-default-700">{alertMessage.message}</p>
            </ModalBody>
            <ModalFooter>
              <Button color={alertMessage.type === 'error' ? 'danger' : 'primary'} onPress={onAlertClose}>
                Ok
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Layout>
  );
}
