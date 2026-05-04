# Attendance Control - Frontend
![Static Badge](https://img.shields.io/badge/Test-passing-green)
![Static Badge](https://img.shields.io/badge/React-19.2.0-blue?logo=react)
![Static Badge](https://img.shields.io/badge/bun-1.3.9-blue?logo=bun)
![Static Badge](https://img.shields.io/badge/docker-28.3-blue?logo=docker)


[🇺🇸 English](README.md) | [🇧🇷 Português](README.pt-br.md)

O **Attendance Control** é um projeto de controle de presença de pessoas em ambientes organizacionais — também conhecido como sistema de ponto.

O sistema foi projetado incialmente como um projeto de faculdade para funcionar em empresas do **Movimento Empresa Júnior** ([MEJ](https://brasiljunior.org.br/conheca-o-mej)), as quais possuiam necessidades de controle de presença específicas, entretanto o projeto está sendo inteiramente refatorado para abranger quaisquer tipos de organizações.

Este repositório refere-se ao frontend do sistema **Attendance Control**.

🔗 Projeto principal (frontend + backend): [github.com/rafaeldailymartins/attendance-control](https://github.com/rafaeldailymartins/attendance-control)


## 📋 Dependências

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/pt-br)
- [Bun](https://bun.com/)

## 🚀 Como executar localmente (somente o frontend)

Primeiramente clone o repoitório e acesse o diretório:

```console
$ git clone https://github.com/rafaeldailymartins/attendance-control-frontend.git
$ cd attendance-control-frontend
```
Instale as dependências:

```console
$ bun install
```
Execute o projeto:

```console
$ bun run dev
```
O projeto fará chamadas de API para `http://localhost:8000`. Para alterar este endereço, basta modificar a variável de ambiente `VITE_API_URL` presente no arquivo `.env.development`. Para executar a API, basta seguir o README presente no reposítorio [attendance-control-backend](https://github.com/rafaeldailymartins/attendance-control-backend)

## 🎨 Linting & Formatting

Este projeto utiliza [Biome](https://biomejs.dev/) para linting e formatação. Os seguintes scripts estão disponíveis:


```bash
$ bun run lint
$ bun run format
$ bun run check
```

## ⚙️ Geração de código através da especificação OpenAPI

Este projeto utiliza [Orval](https://orval.dev/) para gerar código atráves da especificação OpenAPI. O seguinte script está disponível para geração de código:

```bash
$ bun run generate
```

## ⚙️ Type Check

O projeto utiliza [TypeScript](https://www.typescriptlang.org/) como type checker. Para executa-lo rode:

```console
$ bun run type-check
```

## 📦 Implantação
Para gerar o build da aplicação para produção:

```bash
$ bun run build
```

## 👨‍💻 Autor

Criado e mantido por:

| [<img src="https://avatars.githubusercontent.com/u/162728324?v=4" width="60px;"/><br /><sub><b>Rafael Daily</b></sub>](https://github.com/rafaeldailymartins)
| :---: |
