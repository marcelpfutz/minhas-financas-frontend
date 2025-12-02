/**
 * Layout Principal da Aplicação
 * Contém sidebar de navegação e área de conteúdo
 */

import { ReactNode } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Switch,
} from '@nextui-org/react';
import {
  LayoutDashboard,
  Wallet,
  Tag,
  ArrowLeftRight,
  TrendingUp,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/wallets', label: 'Carteiras', icon: Wallet },
    { path: '/categories', label: 'Categorias', icon: Tag },
    { path: '/transactions', label: 'Lançamentos', icon: TrendingUp },
    { path: '/transfers', label: 'Transferências', icon: ArrowLeftRight },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar superior */}
      <Navbar isBordered maxWidth="full">
        <NavbarBrand>
          <p className="font-bold text-xl text-primary">💰 Minhas Finanças</p>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-6" justify="center">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavbarItem key={item.path} isActive={isActive}>
                <RouterLink
                  to={item.path}
                  className={`flex items-center gap-2 ${
                    isActive ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </RouterLink>
              </NavbarItem>
            );
          })}
        </NavbarContent>

        <NavbarContent justify="end">
          {/* Switch de tema */}
          <NavbarItem>
            <Switch
              isSelected={isDark}
              onValueChange={toggleTheme}
              size="sm"
              color="primary"
              startContent={<Sun size={16} />}
              endContent={<Moon size={16} />}
            />
          </NavbarItem>

          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                isBordered
                as="button"
                className="transition-transform"
                color="primary"
                name={user?.name}
                size="sm"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2" textValue="Profile">
                <p className="font-semibold">Conectado como</p>
                <p className="font-semibold">{user?.email}</p>
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                startContent={<LogOut size={18} />}
                onClick={handleLogout}
              >
                Sair
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">{children}</main>
    </div>
  );
}
