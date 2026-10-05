# Portfolio PS2

Portfólio bilíngue inspirado na interface do PlayStation 2, construído com Astro, React e TypeScript. O projeto é gerado como site estático e inclui animações 3D, um minijogo em Phaser, prévias de projetos e testes automatizados de interface, acessibilidade e performance.

## Requisitos

- Node.js 24
- pnpm 10.25.0

## Desenvolvimento

```sh
pnpm install --frozen-lockfile
pnpm astro dev --background
```

O servidor em segundo plano pode ser administrado com:

```sh
pnpm astro dev status
pnpm astro dev logs
pnpm astro dev stop
```

Copie `.env.example` para `.env` quando quiser definir uma URL pública para metadados, sitemap e URLs canônicas:

```env
PUBLIC_SITE_URL=https://seu-dominio.com.br
```

Na Vercel, `VERCEL_PROJECT_PRODUCTION_URL` é detectada automaticamente quando `PUBLIC_SITE_URL` não está definida.

## Qualidade e build

```sh
pnpm validate   # Astro check, ESLint, Prettier e testes unitários
pnpm verify     # validação, build, E2E, acessibilidade e performance
pnpm build      # gera o site estático em dist/
pnpm preview    # serve o build localmente
```

O workflow `.github/workflows/ci.yml` executa `pnpm verify` em pushes e pull requests direcionados à `main`.

## Deploy na Vercel

O projeto usa `output: "static"`; portanto, não precisa do adapter `@astrojs/vercel` para o deploy atual.

```sh
vercel link --yes --project portfolio-ps2
vercel deploy
vercel deploy --prod
```

- `vercel deploy` cria um Preview.
- `vercel deploy --prod` publica no ambiente de produção.
- A pasta local `.vercel/` guarda o vínculo do projeto e não deve ser versionada.

## Estrutura principal

- `src/pages/`: rotas em português, inglês e `robots.txt`.
- `src/components/`: componentes Astro e ilhas React.
- `src/content/`: conteúdo localizado e tipos compartilhados.
- `src/game/`: regras, assets e runtime do minijogo.
- `tests/`: testes unitários, E2E, acessibilidade e performance.
