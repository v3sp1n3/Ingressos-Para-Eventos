# Sistema de Ingressos para Eventos

Sistema completo de venda de ingressos para eventos culturais, demonstrando os principais conceitos de banco de dados relacionais.

## Equipe

- **[Nome Completo]** - RGM: [RGM]
- **[Nome Completo]** - RGM: [RGM]
- **[Nome Completo]** - RGM: [RGM]

## Mapeamento de Conceitos

| Conceito (Aula) | Implementação no Projeto |
|----------------|-------------------------|
| **OneToOne** (Usuario <-> Endereco) | Tabela `enderecos` com `usuario_id UNIQUE`, garantindo um endereço por usuário |
| **ManyToOne/OneToMany** (Evento <-> Local) | FK `local_id` em `eventos` referenciando `locais` |
| **Entidade de Transação** (Ingresso) | Tabela `ingressos` com FK para `usuarios` e `eventos` |
| **Validação de Regra de Negócio** | Capacidade máxima do local + limite 5 ingressos por usuário por evento |
| **Métricas In-Memory** | Endpoint `/dashboard` calcula estatísticas em memória |
| **Segurança JWT** | Autenticação Supabase Auth com Row Level Security |
| **Documentação Interativa** | Interface web completa demonstrando todos os endpoints |

## Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Backend/Database**: Supabase (PostgreSQL)
- **Auth**: JWT (Supabase Auth)
- **Segurança**: Row Level Security (RLS)

## Estrutura do Banco de Dados

```
usuarios (estende auth.users)
  ↓ OneToOne
enderecos (usuario_id UNIQUE)

locais
  ↓ OneToMany
eventos (local_id FK)

usuarios
  ↓ ManyToMany via ingressos
eventos
  ↑
ingressos (entidade de transação)
```

## Regras de Negócio

1. **Capacidade Máxima**: Não permite vender ingressos além da capacidade do local
2. **Limite por Usuário**: Máximo de 5 ingressos por usuário para o mesmo evento

## Endpoints

### Públicos
- `POST /auth/signup` - Cadastro de usuário
- `POST /auth/login` - Login
- `GET /eventos` - Lista eventos disponíveis

### Autenticados
- `GET /meus-ingressos` - Lista ingressos do usuário
- `POST /ingressos` - Compra ingresso (valida regras de negócio)
- `GET /perfil` - Dados do usuário
- `PUT /perfil/endereco` - Atualiza endereço (OneToOne)

### Dashboard (Métricas In-Memory)
- `GET /dashboard` - Retorna:
  - Total de ingressos vendidos
  - Receita total
  - Taxa de ocupação média
  - Evento com mais vendas

### Admin
- `GET/POST/PUT/DELETE /admin/locais` - CRUD de locais
- `GET/POST/PUT/DELETE /admin/eventos` - CRUD de eventos

## Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado:

- **usuarios/enderecos**: Usuário só acessa seus próprios dados
- **locais/eventos**: Leitura pública, escrita para autenticados
- **ingressos**: Usuário só vê seus próprios ingressos

## Como Executar

```bash
npm install
npm run dev
```

O servidor de desenvolvimento iniciará automaticamente.

## Build

```bash
npm run build
```

Os arquivos de produção serão gerados em `dist/`.
