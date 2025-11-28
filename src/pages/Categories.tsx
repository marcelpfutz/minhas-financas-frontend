/**
 * Página de Categorias
 * Gerenciamento de categorias de receitas e despesas
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
  Tabs,
  Tab,
  Chip,
} from '@nextui-org/react';
import { Tag, Plus, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Layout } from '../components/Layout';
import api from '../lib/api';
import { Category, CreateCategoryData } from '../types';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTab, setSelectedTab] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    description: '',
    type: 'EXPENSE',
    color: '#EF4444',
    icon: 'tag',
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get<Category[]>('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (type: 'INCOME' | 'EXPENSE') => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      type,
      color: type === 'INCOME' ? '#10B981' : '#EF4444',
      icon: 'tag',
    });
    onOpen();
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      type: category.type,
      color: category.color,
      icon: category.icon,
    });
    onOpen();
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (selectedCategory) {
        await api.put(`/categories/${selectedCategory.id}`, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
          icon: formData.icon,
        });
      } else {
        await api.post('/categories', formData);
      }
      await loadCategories();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao salvar categoria');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      await api.delete(`/categories/${id}`);
      await loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao deletar categoria');
    }
  };

  const incomeCategories = categories.filter((c) => c.type === 'INCOME');
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      </Layout>
    );
  }

  const renderCategories = (cats: Category[]) => {
    if (cats.length === 0) {
      return (
        <Card>
          <CardBody className="text-center py-12">
            <Tag className="mx-auto text-default-300 mb-4" size={48} />
            <p className="text-default-500">Nenhuma categoria cadastrada</p>
          </CardBody>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map((category) => (
          <Card key={category.id}>
            <CardBody>
              <div className="flex items-start gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: category.color + '20' }}
                >
                  {category.type === 'INCOME' ? '📈' : '📉'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-md font-semibold truncate">
                      {category.name}
                    </p>
                    {category.isActive && (
                      <Chip size="sm" color="success" variant="dot" />
                    )}
                  </div>
                  {category.description && (
                    <p className="text-small text-default-500 mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<Edit size={14} />}
                      onPress={() => handleEdit(category)}
                      className="flex-1"
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      isIconOnly
                      onPress={() => handleDelete(category.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categorias</h1>
            <p className="text-default-500 mt-1">
              Organize suas receitas e despesas
            </p>
          </div>
        </div>

        <Tabs
          selectedKey={selectedTab}
          onSelectionChange={(key) => setSelectedTab(key as 'INCOME' | 'EXPENSE')}
          color="primary"
          variant="underlined"
          classNames={{
            tabList: 'gap-6',
            cursor: 'w-full',
          }}
        >
          <Tab
            key="EXPENSE"
            title={
              <div className="flex items-center gap-2">
                <TrendingDown size={18} />
                <span>Despesas ({expenseCategories.length})</span>
              </div>
            }
          >
            <div className="space-y-4 mt-4">
              <Button
                color="danger"
                startContent={<Plus size={18} />}
                onPress={() => handleCreate('EXPENSE')}
              >
                Nova Categoria de Despesa
              </Button>
              {renderCategories(expenseCategories)}
            </div>
          </Tab>

          <Tab
            key="INCOME"
            title={
              <div className="flex items-center gap-2">
                <TrendingUp size={18} />
                <span>Receitas ({incomeCategories.length})</span>
              </div>
            }
          >
            <div className="space-y-4 mt-4">
              <Button
                color="success"
                startContent={<Plus size={18} />}
                onPress={() => handleCreate('INCOME')}
              >
                Nova Categoria de Receita
              </Button>
              {renderCategories(incomeCategories)}
            </div>
          </Tab>
        </Tabs>

        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <ModalHeader>
              {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {!selectedCategory && (
                  <Select
                    label="Tipo"
                    selectedKeys={[formData.type]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'INCOME' | 'EXPENSE',
                      })
                    }
                    variant="bordered"
                  >
                    <SelectItem key="INCOME" value="INCOME">
                      Receita
                    </SelectItem>
                    <SelectItem key="EXPENSE" value="EXPENSE">
                      Despesa
                    </SelectItem>
                  </Select>
                )}

                <Input
                  label="Nome"
                  placeholder="Ex: Alimentação"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  isRequired
                  variant="bordered"
                />

                <Textarea
                  label="Descrição"
                  placeholder="Ex: Gastos com supermercado e restaurantes"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  variant="bordered"
                />

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
                    placeholder="tag"
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
                {selectedCategory ? 'Salvar' : 'Criar'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </Layout>
  );
}
