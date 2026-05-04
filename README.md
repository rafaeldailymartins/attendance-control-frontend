# Attendance Control - Frontend
![Static Badge](https://img.shields.io/badge/Test-passing-green)
![Static Badge](https://img.shields.io/badge/React-19.2.0-blue?logo=react)
![Static Badge](https://img.shields.io/badge/bun-1.3.9-blue?logo=bun)
![Static Badge](https://img.shields.io/badge/docker-28.3-blue?logo=docker)


[🇺🇸 English](README.md) | [🇧🇷 Português](README.pt-br.md)

**Attendance Control** is a clock in and out system for organizational environments.

The system was initially designed as a college project to serve companies from [**Junior Enterprises Movement**](https://www.juniorenterprises.org/), which had specific attendance control needs. However, it is now being completely refactored to support any type of organization.

This repository refers to the frontend of the **Attendance Control** system.

🔗 Main project (frontend + backend): [github.com/rafaeldailymartins/attendance-control](https://github.com/rafaeldailymartins/attendance-control)

## 📸 Screenshots
![Time Tracking Screen](https://github.com/rafaeldailymartins/attendance-control/raw/main/images/Clock.png)
![Absence Report Screen](https://github.com/rafaeldailymartins/attendance-control/raw/main/images/Abscences.png)
![Time Entry Screen](https://github.com/rafaeldailymartins/attendance-control/raw/main/images/ClockDialog.png)
![User Edit Screen](https://github.com/rafaeldailymartins/attendance-control/raw/main/images/UserEdit.png)

## 📋 Dependencies

- [Docker](https://www.docker.com/)
- [Node.js](https://nodejs.org/pt-br)
- [Bun](https://bun.com/)

## 🚀 Running locally (frontend only)

First, clone the repository and navigate to the project directory:

```console
$ git clone https://github.com/rafaeldailymartins/attendance-control-frontend.git
$ cd attendance-control-frontend
```
Install the dependencies:

```console
$ bun install
```
Run the project locally:

```console
$ bun run dev
```
O projeto fará chamadas de API para `http://localhost:8000`. Para alterar este endereço, basta modificar a variável de ambiente `VITE_API_URL` presente no arquivo `.env.development`. Para executar a API, basta seguir o README presente no reposítorio [attendance-control-backend](https://github.com/rafaeldailymartins/attendance-control-backend)

The project will make API calls to `http://localhost:8000`. To change this address, simply modify the `VITE_API_URL` environment variable in the `.env.development` file. To run the API, follow the README available in the [attendance-control-backend](https://github.com/rafaeldailymartins/attendance-control-backend) repository.

## 🎨 Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The following scripts are available:

```bash
$ bun run lint
$ bun run format
$ bun run check
```

## ⚙️ Code generation from the OpenAPI specification

This project uses [Orval](https://orval.dev/) to generate code from the OpenAPI specification. The following script is available for code generation:

```bash
$ bun run generate
```

## ⚙️ Type Check

The project uses [TypeScript](https://www.typescriptlang.org/) as a type checker. To run it, execute:

```console
$ bun run type-check
```

## 📦 Building For Production

To build this application for production:

```bash
$ bun run build
```

## 👨‍💻 Author

Created and maintained by:

| [<img src="https://avatars.githubusercontent.com/u/162728324?v=4" width="60px;"/><br /><sub><b>Rafael Daily</b></sub>](https://github.com/rafaeldailymartins)
| :---: |
