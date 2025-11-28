# 💰 Minhas Finanças - Frontend

Interface web moderna para sistema de controle financeiro pessoal desenvolvida em React com NextUI.

## 🚀 Tecnologias

- **React** - Biblioteca JavaScript para interfaces
- **TypeScript** - Superset tipado do JavaScript  
- **Vite** - Build tool moderna e rápida
- **NextUI (Hero UI)** - Biblioteca de componentes modernos
- **React Router** - Roteamento de páginas
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS utilitário
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones modernos
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

## 📋 Funcionalidades

- ✅ Interface moderna e responsiva
- ✅ Tema claro e escuro
- ✅ Login e registro de usuários
- ✅ Dashboard com resumo financeiro
- ✅ Gestão de carteiras (contas bancárias, etc)
- ✅ Categorias personalizadas
- ✅ Lançamentos com controle de vencimento
- ✅ Transferências entre carteiras
- ✅ Gráficos e estatísticas
- ✅ Projeções financeiras
- ✅ Design intuitivo e fácil de usar

## 🗂️ Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/        # Componentes reutilizáveis
│   │   ├── Layout.tsx
│   │   └── PrivateRoute.tsx
│   ├── contexts/          # Contextos React (estado global)
│   │   └── AuthContext.tsx
│   ├── pages/             # Páginas da aplicação
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Wallets.tsx
│   │   ├── Categories.tsx
│   │   ├── Transactions.tsx
│   │   └── Transfers.tsx
│   ├── lib/               # Bibliotecas e utilitários
│   │   └── api.ts
│   ├── types/             # Tipos TypeScript
│   │   └── index.ts
│   ├── App.tsx            # Componente raiz
│   ├── main.tsx           # Entrada da aplicação
│   └── index.css          # Estilos globais
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── .env.example
```

## 🔧 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com a URL da API:

```env
VITE_API_URL=http://localhost:3333/api
```

### 3. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará rodando em `http://localhost:3000`

### 4. Build para produção

```bash
npm run build
```

Os arquivos de produção serão gerados na pasta `dist/`

## 🎨 Componentes e Páginas

### Páginas Públicas
- **Login** - Tela de login
- **Register** - Tela de registro

### Páginas Privadas (Requerem Autenticação)
- **Dashboard** - Visão geral das finanças com gráficos e estatísticas
- **Wallets** - Gestão de carteiras (criar, editar, listar)
- **Categories** - Gestão de categorias de receitas e despesas
- **Transactions** - Gestão de lançamentos financeiros
- **Transfers** - Transferências entre carteiras

### Componentes Principais
- **Layout** - Layout base com navegação
- **PrivateRoute** - Proteção de rotas autenticadas

## 🔐 Autenticação

O sistema usa JWT (JSON Web Token) armazenado no localStorage. O token é automaticamente incluído em todas as requisições através do interceptor do Axios.

## 🎨 Tema e Design

O projeto usa **NextUI** (Hero UI) como biblioteca de componentes, oferecendo:
- Design moderno e limpo
- Suporte a tema claro/escuro
- Componentes acessíveis
- Animações fluidas com Framer Motion
- Totalmente responsivo

## 📱 Responsividade

A interface é totalmente responsiva e funciona perfeitamente em:
- Desktop
- Tablet
- Mobile

## 🔄 Integração com Backend

A aplicação se comunica com o backend através do arquivo `src/lib/api.ts`, que configura o cliente Axios com:
- URL base da API
- Interceptores para autenticação automática
- Tratamento de erros 401 (redirecionamento para login)

## 📝 Scripts Disponíveis

```bash
npm run dev       # Inicia servidor de desenvolvimento
npm run build     # Cria build de produção
npm run preview   # Preview do build de produção
npm run lint      # Executa linter
```

## 🚀 Próximos Passos

Para completar o frontend, você precisará criar as páginas:

1. **Login.tsx** - Formulário de login
2. **Register.tsx** - Formulário de registro
3. **Dashboard.tsx** - Dashboard com resumo e gráficos
4. **Wallets.tsx** - CRUD de carteiras
5. **Categories.tsx** - CRUD de categorias
6. **Transactions.tsx** - CRUD de lançamentos
7. **Transfers.tsx** - CRUD de transferências

Cada página já tem os tipos TypeScript definidos em `src/types/index.ts` e o cliente da API configurado em `src/lib/api.ts`.

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença ISC.
