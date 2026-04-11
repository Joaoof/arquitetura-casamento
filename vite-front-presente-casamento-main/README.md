# Frontend: Lista de Presentes de Casamento

<p align="center">
<a href="https://reactjs.org/" target="_blank">
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png" width="120" alt="React Logo" />
</a>
<a href="https://vitejs.dev/" target="_blank">
<img src="https://vitejs.dev/logo.svg" width="120" alt="Vite Logo" />
</a>
</p>

<p align="center">
Uma aplicação frontend moderna e responsiva, construída com <strong>React</strong>, <strong>Vite</strong>, <strong>TypeScript</strong> e <strong>Tailwind CSS</strong>, projetada para ser rápida e escalável.
</p>

<p align="center">
<a href="https://npmjs.com/package/react" target="_blank">
<img src="https://img.shields.io/npm/v/react.svg" alt="Versão do React" />
</a>
<a href="https://npmjs.com/package/react-dom" target="_blank">
<img src="https://img.shields.io/npm/v/react-dom.svg" alt="Versão do React DOM" />
</a>
<a href="https://github.com/vitejs/vite" target="_blank">
<img src="https://img.shields.io/badge/Vite-4.5.0-blue.svg" alt="Versão do Vite" />
</a>
<a href="https://tailwindcss.com/" target="_blank">
<img src="https://img.shields.io/badge/Tailwind_CSS-3.4.0-blue.svg" alt="Tailwind CSS" />
</a>
<a href="https://typescriptlang.org/" target="_blank">
<img src="https://img.shields.io/badge/TypeScript-5.0.0-blue.svg" alt="TypeScript" />
</a>
<a href="https://eslint.org/" target="_blank">
<img src="https://img.shields.io/badge/ESLint-8.54.0-green.svg" alt="ESLint" />
</a>
<a href="https://discord.gg/react" target="_blank">
<img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord" />
</a>
<a href="https://twitter.com/reactjs" target="_blank">
<img src="https://img.shields.io/twitter/follow/reactjs.svg?style=social&label=Follow" alt="Siga no Twitter" />
</a>
</p>

## 🚀 Visão Geral do Projeto

Este é o **frontend** de uma plataforma de lista de presentes para casamento. A aplicação oferece uma interface amigável para navegação, reserva de presentes e gerenciamento de autenticação de usuários.

A aplicação utiliza **Tailwind CSS** para estilização, **hooks personalizados** do React para gestão de estado, e uma estrutura modular e limpa para garantir escalabilidade e fácil manutenção.

-----

## 📁 Estrutura do Projeto

```
src/
├── components/         # Componentes de UI reutilizáveis
├── context/            # Contexto do React para estado global (ex: autenticação)
├── data/               # Dados estáticos (ex: lista de presentes)
├── helpers/            # Funções utilitárias
├── hooks/              # Hooks personalizados do React
├── libs/               # Bibliotecas ou utilitários genéricos
├── public/             # Arquivos públicos (imagens, ícones)
├── services/           # Serviços de API, armazenamento e integrações
├── styles/             # Estilos globais e animações
├── types/              # Definições de tipos do TypeScript
├── ui/                 # Elementos básicos de UI (botões, inputs)
├── App.tsx             # Componente principal da aplicação
├── main.tsx            # Ponto de entrada
└── vite-env.d.ts       # Tipos de ambiente do Vite
```

-----

## 🛠️ Configuração e Instalação

> **Pré-requisito rápido:** tenha o **pnpm** disponível. Se necessário, ative via Corepack:
>
> ```bash
> corepack enable
> corepack prepare pnpm@latest --activate
> ```

```bash
# Clone o repositório
git clone https://github.com/yourusername/your-repo.git

# Navegue até o diretório do projeto
cd your-repo

# Instale as dependências
pnpm install
```

-----

## 🚀 Como Executar

```bash
# Inicia o servidor de desenvolvimento (com hot reload)
pnpm dev

# Compila para produção
pnpm build

# Pré-visualiza o build de produção
pnpm preview
```

-----

## 🌐 Configuração de Ambiente

A aplicação usa variáveis de ambiente. Crie um arquivo `.env` na raiz do projeto e adicione as variáveis abaixo (mantendo a mesma base de URL da API, sem alterar rotas/endpoints):

```env
VITE_API_URL=http://localhost:3000
# (opcional/compatibilidade) VITE_API_BASE_URL=http://localhost:3000/api
```

> **Atenção:** use como principal `VITE_API_URL` (ex.: `http://localhost:3000`) para preservar chamadas como `/gifts` e `/auth/login`. Se seu ambiente ainda usar `VITE_API_BASE_URL`, mantenha-o alinhado com a mesma API.

-----

## 🎨 Estilização e Design

  * **Tailwind CSS** é usado para um sistema de design "utility-first".
  * A aplicação conta com um design responsivo, adaptando-se a dispositivos móveis e desktops.

-----

## 🔐 Autenticação

  * A gestão de estado de autenticação é feita com o `AuthContext`.
  * Tokens são armazenados de forma segura no `localStorage` pelo serviço `storage.ts`.

-----

## 📡 Integração com a API

  * Todas as chamadas à API são gerenciadas pelo serviço `services/api.ts`.
  * A integração mantém os mesmos caminhos de backend (como `/gifts`, `/gifts/:id`, `/gifts/:id/reserve` e `/auth/login`), sem mudanças de rotas/endpoints.

-----

## 📚 Recursos Úteis

  * [Documentação do React](https://react.dev/)
  * [Documentação do Vite](https://vitejs.dev/)
  * [Guia do Tailwind CSS](https://tailwindcss.com/docs)
  * [Manual do TypeScript](https://www.typescriptlang.org/docs/)

-----

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - consulte o arquivo [LICENSE](https://www.google.com/search?q=LICENSE) para mais detalhes.

-----

## 👤 Autor

**Joaoof** – Desenvolvedor Frontend
[Perfil no GitHub](https://github.com/Joaoof)
📧 Contato: joaodeus400@gmail.com

> ✨ Construído com ❤️ usando React, Vite, e Tailwind CSS.
