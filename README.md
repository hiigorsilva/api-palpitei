# Palpitei API

Backend do Palpitei, uma API para gerenciar um bolão online de jogos da Copa do Mundo.

## Sobre a Aplicação

O Palpitei permite que participantes entrem no bolão pelo nome, façam palpites em jogos, usem cartas de dobro de pontos, escolham um campeão, acompanhem pontuação, ranking e progresso de participação.

A API também possui rotas administrativas para popular a base com seleções e jogos, atualizar resultados, corrigir placares, recalcular pontuação e apurar o campeão.

## Stack

- Node.js
- TypeScript
- Fastify
- Zod
- Drizzle ORM
- PostgreSQL
- Swagger/OpenAPI com Scalar
- Biome

## Requisitos

- Node.js `>=22.17.1`
- pnpm `11.5.0`
- Banco PostgreSQL

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz com:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/name_database
ADMIN_USER=seu_user_admin
ADMIN_PASSWORD=sua_senha_admin
PORT=3333
HOST=0.0.0.0
API_URL=http://localhost:3333
```

Observações:

- `DATABASE_URL` deve começar com `postgresql://`.
- `API_URL` é usada para montar a documentação e o endereço público da API.
- `HOST` é opcional e usa `0.0.0.0` por padrão.
- Rotas administrativas usam Basic Auth com `ADMIN_USER` e `ADMIN_PASSWORD`.

## Instalação

```bash
pnpm install
```

## Desenvolvimento

```bash
pnpm dev
```

A API sobe usando as variáveis do `.env`.

## Build

```bash
pnpm build
```

## Produção

```bash
pnpm start
```

## Banco de Dados

Gerar migrations:

```bash
pnpm db:generate
```

Executar migrations:

```bash
pnpm db:migrate
```

Abrir Drizzle Studio:

```bash
pnpm db:studio
```

## Documentação da API

Com o servidor rodando, acesse:

```txt
/api/docs
```

Exemplo local:

```txt
http://localhost:3333/api/docs
```

## Principais Módulos

- `users`: cadastro/login por nome, perfil do usuário, palpite de campeão e histórico de cartas.
- `teams`: listagem de seleções.
- `games`: listagem, filtros, jogos de hoje, pendentes e palpites por jogo.
- `bet`: criação, edição e listagem de apostas por usuário.
- `ranking`: ranking por pontos, taxa de acerto e estatísticas por usuário.
- `bonus-progresso`: progresso de participação e níveis de bônus.
- `admin`: popular base, atualizar resultados, recalcular pontuação e dashboard.
- `healths`: health check da API.

## Rotas Base

Todas as rotas são registradas com prefixo:

```txt
/api
```

Exemplos:

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/users`
- `GET /api/games`
- `POST /api/users/:userId/games/:gameId/bets`
- `GET /api/ranking/pontos`
- `POST /api/admin/resultado`

## Dados Locais da Copa

Os dados base da Copa ficam em:

- `src/data/worldcup-2026/teams.json`
- `src/data/worldcup-2026/matches.json`

A rota administrativa `POST /api/admin/popular-base` utiliza esses arquivos para inserir ou atualizar seleções e jogos.

## Regras Principais

- Cada usuário pode fazer apenas uma aposta por jogo.
- Apostas só podem ser criadas ou editadas até 15 minutos antes do início do jogo.
- Acerto em vitória vale `7` pontos.
- Acerto em empate vale `5` pontos.
- Carta de dobro de pontos duplica a pontuação da aposta.
- Usuário só pode usar carta de dobro se possuir saldo disponível.
- Palpite correto de campeão concede pontuação extra.
