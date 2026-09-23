# Pizzaria

API REST para gerenciamento de uma pizzaria, desenvolvida com Node.js,
TypeScript, Express, Prisma e PostgreSQL.

O projeto oferece a base para cadastro e autenticação de usuários,
gerenciamento de categorias e cadastro de produtos com upload de imagem.
As rotas protegidas utilizam autenticação por token JWT.

## Tecnologias

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT
- bcryptjs
- Multer
- Zod

## Pré-requisitos

- Node.js 18 ou superior
- Yarn ou npm
- PostgreSQL em execução

## Instalação

Clone o repositório e entre na pasta do projeto:

```bash
git clone https://github.com/Javicksongithub/pizzaria.git
cd pizzaria
```

Instale as dependências:

```bash
yarn install
```

ou:

```bash
npm install
```

## Configuração do ambiente

Crie um arquivo `.env` na raiz do projeto com a URL do PostgreSQL e uma
chave secreta para os tokens:

```env
DATABASE_URL="postgresql://<usuario>:<senha>@<host>:5432/pizzaria?schema=public"
JWT_SECRET="substitua-por-uma-chave-secreta"
```

Depois, gere o Prisma Client e aplique as migrações:

```bash
yarn prisma generate
yarn prisma migrate deploy
```

Durante o desenvolvimento, quando houver alterações no schema, use:

```bash
yarn prisma migrate dev
```

## Executando a aplicação

Inicie o servidor em modo de desenvolvimento:

```bash
yarn dev
```

A API ficará disponível em `http://localhost:3333`.

## Endpoints

### Usuários e autenticação

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `POST` | `/users` | Não | Cria um usuário |
| `POST` | `/session` | Não | Autentica um usuário e retorna um JWT |
| `GET` | `/me` | Bearer token | Retorna os dados do usuário autenticado |

Exemplo de criação de usuário:

```json
{
  "name": "Maria",
  "email": "maria@exemplo.com",
  "password": "senha123"
}
```

Para acessar rotas protegidas, envie o token retornado no login:

```http
Authorization: Bearer <TOKEN_JWT>
```

### Categorias

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `POST` | `/category` | Bearer token | Cria uma categoria |
| `GET` | `/category` | Bearer token | Lista as categorias |

Exemplo de criação:

```json
{
  "name": "Pizzas tradicionais"
}
```

### Produtos

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `POST` | `/product` | Bearer token | Cadastra um produto |

O cadastro de produto usa `multipart/form-data`. Envie os campos
`name`, `price`, `description` e `category_id`. O campo `banner` é opcional
e aceita imagens JPG, JPEG, PNG ou GIF de até 2 MB.

## Estrutura do projeto

```text
.
├── prisma/
│   ├── migrations/       # Migrações do banco de dados
│   └── schema.prisma     # Modelos User, Category, Product, Order e Item
├── src/
│   ├── config/           # Configurações, incluindo upload de imagens
│   ├── controllers/      # Camada HTTP da aplicação
│   ├── middleware/       # Autenticação e validação
│   ├── schemas/          # Schemas de entrada
│   ├── services/         # Regras de negócio
│   ├── routes.ts         # Rotas da API
│   └── server.ts         # Inicialização do servidor
├── package.json
└── tsconfig.json
```

## Banco de dados

O schema Prisma possui os modelos:

- `User`: usuários e perfis `ADMIN` ou `STAFF`;
- `Category`: categorias de produtos;
- `Product`: produtos, preços, imagens e disponibilidade;
- `Order`: pedidos associados a uma mesa;
- `Item`: produtos e quantidades de cada pedido.

## Scripts disponíveis

| Comando | Função |
| --- | --- |
| `yarn dev` | Inicia a API com recarga automática |
| `yarn prisma generate` | Gera o Prisma Client |
| `yarn prisma migrate dev` | Cria/aplica migrações em desenvolvimento |
| `yarn prisma migrate deploy` | Aplica migrações existentes |

## Observações

- Nunca versionar o arquivo `.env` ou credenciais do banco.
- O diretório `tmp/` é criado automaticamente quando uma imagem é enviada.
- A API permite requisições de diferentes origens por meio do CORS.

## Licença

Este projeto está sob a licença MIT.
