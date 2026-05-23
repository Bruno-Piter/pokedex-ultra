# Pokédex Ultra

Uma Pokédex moderna e interativa, feita depois de poucos anos de prática de programação — um projeto para explorar dados reais da [PokéAPI](https://pokeapi.co/), experimentar uma stack atual de front-end e consolidar o que aprendi ao longo do caminho.

## Sobre o projeto

O **Pokédex Ultra** permite navegar por centenas de Pokémon, filtrar por tipo, geração e ordenação, buscar rapidamente pelo nome e abrir páginas de detalhe com informações completas: stats, moves, habilidades, evolução e muito mais.

Interface em português, tema claro/escuro e animações sutis para deixar a experiência mais fluida.

## Funcionalidades

- **Listagem completa** — grid responsivo com paginação e filtros (tipo, geração, ordenação)
- **Busca rápida** — command menu (`Ctrl+K` / `Cmd+K`) para ir direto a qualquer Pokémon
- **Página de detalhe** — artwork oficial, tipos, medidas, descrição e árvore de evolução
- **Stats** — gráfico radar, barras de base stats e tabela min/máx por nível (50, 100, 150, 200), inspirada em referências como Serebii
- **Moves** — agrupados por Level Up, TM/HM, Egg e Tutor, com tipo, poder, precisão e PP
- **Tema** — alternância entre modo claro e escuro

## Stack

| Tecnologia | Uso |
|---|---|
| [Next.js 16](https://nextjs.org/) | App Router, SSR/CSR |
| [React 19](https://react.dev/) | UI |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem |
| [TanStack Query](https://tanstack.com/query) | Cache e fetching da API |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilização |
| [shadcn/ui](https://ui.shadcn.com/) + Base UI | Componentes |
| [Framer Motion](https://www.framer.com/motion/) | Animações |
| [Recharts](https://recharts.org/) | Gráfico de stats |
| [PokéAPI](https://pokeapi.co/) | Dados dos Pokémon |

## Como rodar

Pré-requisitos: **Node.js 20+** e **npm**.

```bash
# Clonar o repositório
git clone https://github.com/Bruno-Piter/pokedex-ultra.git
cd pokedex-ultra

# Instalar dependências
npm install

# Subir o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Outros comandos

```bash
npm run build   # Build de produção
npm run start   # Servir build de produção
npm run lint    # ESLint
```

## Estrutura do projeto

```
src/
├── app/                    # Rotas (App Router)
├── components/             # Layout e UI compartilhados
├── features/pokemon/       # Domínio Pokémon (API, hooks, componentes)
├── lib/pokeapi/            # Cliente HTTP e endpoints
└── providers/              # Theme e React Query
```

## Autor

**Bruno Piter** — [GitHub](https://github.com/Bruno-Piter)

---

Dados fornecidos pela [PokéAPI](https://pokeapi.co/). Pokémon e nomes relacionados são marcas registradas da Nintendo, Game Freak e The Pokémon Company.
