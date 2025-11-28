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
import { Wallet as WalletIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { Wallet, CreateWalletData } from '../types';

export default function Wallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [formData, setFormData] = useState<CreateWalletData>({
    name: '',
    description: '',
    balance: 0,
    color: '#3B82F6',
    icon: 'wallet',
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [submitting, setSubmitting] = useState(false);

  // Carrega carteiras
  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const response = await api.get<Wallet[]>('/wallets');
      setWallets(response.data);
    } catch (error) {
      console.error('Erro ao carregar carteiras:', error);
    } finally {
      setLoading(false);
    }
  };

  // Abre modal para criar
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

  // Abre modal para editar
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

  // Salva (criar ou editar)
  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (selectedWallet) {
        // Editar
        await api.put(`/wallets/${selectedWallet.id}`, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
        });
      } else {
        // Criar
        await api.post('/wallets', formData);
      }
      await loadWallets();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar carteira');
    } finally {
      setSubmitting(false);
    }
  };

  // Deleta carteira
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta carteira?')) return;

    try {
      await api.delete(`/wallets/${id}`);
      await loadWallets();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao deletar carteira');
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
        {/* Cabeçalho */}
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

        {/* Lista de Carteiras */}
        {wallets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wallets.map((wallet) => (
              <Card key={wallet.id}>
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
                  {wallet.isActive && (
                    <Chip size="sm" color="success" variant="flat">
                      Ativa
                    </Chip>
                  )}
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
                        onPress={() => handleEdit(wallet)}
                        className="flex-1"
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        startContent={<Trash2 size={16} />}
                        onPress={() => handleDelete(wallet.id)}
                        className="flex-1"
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

        {/* Modal de Criar/Editar */}
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
      </div>
    </Layout>
  );
}
