# CargoSlot - Gerenciador Inteligente de Vagas

Este é um sistema web completo (Frontend Vue 3 e Backend Node.js/Express) construído com TypeScript, gerenciado via pnpm workspaces.

## Stack Tecnológica
- **Backend**: Node.js, Express, Prisma ORM (SQLite), Zod, tsup, TypeScript (NodeNext).
- **Frontend**: Vue 3 (Composition API), Vite, Vue Router, Pinia, Axios, TypeScript (ESNext).

## Pré-requisito

Instale o pnpm globalmente, caso ainda não tenha:
```bash
npm install -g pnpm
```

## Primeira vez (Instalação e Configuração)

Acesse a pasta do projeto e rode os comandos abaixo para instalar as dependências e preparar o banco de dados:

```bash
cd cargoslot
pnpm install:all
pnpm db:push
pnpm seed
```

## Rodar o projeto (Desenvolvimento)

Para iniciar simultaneamente o servidor backend (na porta 3001) e o frontend (na porta 5173):

```bash
pnpm dev
```

## Build de produção

Para compilar o backend (com tsup) e o frontend (com vue-tsc e vite):

```bash
pnpm build
```

## Acesso

- App (Frontend):  http://localhost:5173
- API (Backend):   http://localhost:3001

## Observações
O backend possui um job interno no `server.ts` que verifica as sessões a cada 60 segundos para marcar como EXPIRADA caso ultrapassem o limite da vaga.
