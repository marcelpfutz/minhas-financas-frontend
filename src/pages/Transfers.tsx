/**
 * Página de Transferências
 * Transferência de valores entre carteiras
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
} from '@nextui-org/react';
import { ArrowLeftRight, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { Transfer, CreateTransferData, Wallet } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<CreateTransferData>({
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    fromWalletId: '',
    toWalletId: '',
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transfersRes, walletsRes] = await Promise.all([
        api.get<Transfer[]>('/transfers'),
        api.get<Wallet[]>('/wallets'),
      ]);
      setTransfers(transfersRes.data);
      setWallets(walletsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      fromWalletId: wallets[0]?.id || '',
      toWalletId: wallets[1]?.id || '',
    });
    onOpen();
  };

  const handleSave = async () => {
    if (formData.fromWalletId === formData.toWalletId) {
      alert('As carteiras de origem e destino devem ser diferentes');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/transfers', formData);
      await loadData();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao criar transferência');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transferência?')) return;

    try {
      await api.delete(`/transfers/${id}`);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao deletar transferência');
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
            <h1 className="text-3xl font-bold">Transferências</h1>
            <p className="text-default-500 mt-1">
              Movimentações entre suas carteiras
            </p>
          </div>
          <Button
            color="primary"
            startContent={<Plus size={18} />}
            onPress={handleCreate}
            isDisabled={wallets.length < 2}
          >
            Nova Transferência
          </Button>
        </div>

        {wallets.length < 2 && (
          <Card className="border-l-4 border-warning">
            <CardBody>
              <p className="text-warning">
                Você precisa ter pelo menos 2 carteiras cadastradas para fazer
                transferências
              </p>
            </CardBody>
          </Card>
        )}

        {transfers.length > 0 ? (
          <div className="space-y-3">
            {transfers.map((transfer) => (
              <Card key={transfer.id}>
                <CardBody>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary flex-shrink-0">
                      <ArrowLeftRight size={24} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center text-sm"
                            style={{
                              backgroundColor: transfer.fromWallet.color + '20',
                            }}
                          >
                            {transfer.fromWallet.icon === 'wallet' ? '💼' : '💳'}
                          </div>
                          <span className="font-medium">
                            {transfer.fromWallet.name}
                          </span>
                        </div>

                        <ArrowRight
                          size={16}
                          className="text-default-400 flex-shrink-0"
                        />

                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center text-sm"
                            style={{
                              backgroundColor: transfer.toWallet.color + '20',
                            }}
                          >
                            {transfer.toWallet.icon === 'wallet' ? '💼' : '💳'}
                          </div>
                          <span className="font-medium">
                            {transfer.toWallet.name}
                          </span>
                        </div>
                      </div>

                      {transfer.description && (
                        <p className="text-small text-default-500">
                          {transfer.description}
                        </p>
                      )}

                      <p className="text-tiny text-default-400 mt-1">
                        {format(new Date(transfer.date), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </p>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <p className="text-xl font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(transfer.amount)}
                      </p>

                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        isIconOnly
                        onPress={() => handleDelete(transfer.id)}
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
              <ArrowLeftRight className="mx-auto text-default-300 mb-4" size={48} />
              <p className="text-default-500">Nenhuma transferência realizada</p>
            </CardBody>
          </Card>
        )}

        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <ModalHeader>Nova Transferência</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
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

                <Select
                  label="Da Carteira"
                  placeholder="Selecione a carteira de origem"
                  selectedKeys={formData.fromWalletId ? [formData.fromWalletId] : []}
                  onChange={(e) =>
                    setFormData({ ...formData, fromWalletId: e.target.value })
                  }
                  variant="bordered"
                  isRequired
                >
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name} (
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(wallet.balance)}
                      )
                    </SelectItem>
                  ))}
                </Select>

                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-default-100 flex items-center justify-center">
                    <ArrowRight className="text-default-400" size={20} />
                  </div>
                </div>

                <Select
                  label="Para a Carteira"
                  placeholder="Selecione a carteira de destino"
                  selectedKeys={formData.toWalletId ? [formData.toWalletId] : []}
                  onChange={(e) =>
                    setFormData({ ...formData, toWalletId: e.target.value })
                  }
                  variant="bordered"
                  isRequired
                >
                  {wallets
                    .filter((w) => w.id !== formData.fromWalletId)
                    .map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name} (
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(wallet.balance)}
                        )
                      </SelectItem>
                    ))}
                </Select>

                <Input
                  type="date"
                  label="Data"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  variant="bordered"
                />

                <Textarea
                  label="Descrição (opcional)"
                  placeholder="Ex: Transferência para poupança"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  variant="bordered"
                />
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
                Transferir
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Layout>
  );
}
