# 🤖 Projeto Bê-à-Bá: Bot de Atendimento Inteligente

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Versão](https://img.shields.io/badge/versão-2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Licença](https://img.shields.io/badge/licença-MIT-green)

Este repositório contém o código-fonte do **Bot de Atendimento Inteligente**, uma aplicação completa desenvolvida como parte do Projeto Bê-à-Bá.

---

## 📜 Índice

* [Resumo do Projeto](#-resumo-do-projeto)
* [✨ Funcionalidades Principais](#-funcionalidades-principais)
* [🛠️ Arquitetura e Tecnologias Utilizadas](#️-arquitetura-e-tecnologias-utilizadas)
* [📂 Estrutura do Monorepo](#-estrutura-do-monorepo)
* [🚀 Como Rodar o Projeto Localmente](#-como-rodar-o-projeto-localmente)
* [👨‍💻 Autor](#-autor)
* [📄 Licença](#-licença)

---

## 🎯 Resumo do Projeto

O sistema "Bot de Atendimento Inteligente" tem como objetivo otimizar o atendimento ao cliente por meio de um chatbot integrado a uma base de conhecimento. A aplicação utiliza Inteligência Artificial (IA) para realizar buscas semânticas na base e para categorizar assuntos não cadastrados, caso nenhuma solução satisfatória seja encontrada. O sistema também conta com dashboards administrativos, painéis de gestão da base de conhecimento e controle de acesso de usuários.

| Versão | Data | Descrição de Alteração | Responsável |
| :--- | :--- | :--- | :--- |
| 2.0 | 10/06/2025 | Estruturação da Arquitetura de Microserviços e Definição de Requisitos | Allan Crasso |

---

## ✨ Funcionalidades Principais

### 👤 Gestão de Usuários e Perfis
- [x] **RF01-03:** Cadastro, edição e exclusão de usuários (operadores, administradores).
- [x] **RF04-06:** Criação, edição, exclusão e atribuição de perfis de acesso.

### 🧠 Módulo de Atendimento com IA
- [x] **RF07:** Captura do assunto digitado pelo usuário através de um chatbot.
- [x] **RF08:** Busca semântica com IA na base de conhecimento para entender a *intenção* da pergunta.
- [x] **RF09:** Exibição de soluções sugeridas com base na consulta.
- [x] **RF10:** Coleta de feedback do usuário sobre a utilidade da resposta.

### 📚 Cadastro de Assuntos Não Listados
- [x] **RF11:** Armazenamento de perguntas que o bot não soube responder.
- [x] **RF13:** Utilização de um segundo agente de IA para analisar e pré-categorizar essas novas perguntas.
- [x] **RF12:** Painel para o administrador aprovar a inclusão do novo assunto na base de conhecimento.

### 🗂️ Gestão da Base de Conhecimento
- [x] **RF14-15:** Inclusão, edição e remoção de documentos e soluções.
- [x] **RF17:** Categorização de cada documento por **Tema** e **Micro-tema** (ex: `Cartão > Bloqueio`).
- [x] **RF16:** Atribuição de palavras-chave para otimizar a busca.

### 📊 Dashboards e Relatórios
- [x] **RF18-19:** Painéis visuais com relatórios dos temas mais pesquisados por período.

### 💻 Interface e Segurança
- [x] **RF20-22:** Interface web responsiva com sistema de busca, painel administrativo e acesso restrito.
- [x] **RF23-25:** Controle de acesso por login/senha, recuperação de senha por e-mail, e mecanismos de segurança de sessão, como timeout por inatividade e restrição a sessões simultâneas.

---
+----------------+      +-------------------------+      +---------------------------+
|                |      |                         |      |                           |
|    Frontend    |----->|   Backend (Node.js)     |----->|  Microserviço IA (Python) |
| (HTML,CSS,JS)  |      |  (API, Lógica, Auth)    |      | (Busca, Classificação)    |
|                |      |                         |      |                           |
+----------------+      +-----------+-------------+      +-------------+-------------+
|                                  |
|                                  |
v                                  v
+------------------------------------------+
|                                          |
|      Banco de Dados (PostgreSQL)         |
|  (Usuários, Base de Conhec., Embeddings) |
|                                          |
+------------------------------------------+

| Camada | Tecnologias | Papel no Projeto |
| :--- | :--- | :--- |
| 🖥️ **Frontend** | HTML, CSS, JavaScript | Constrói a interface visual com a qual o usuário interage: telas, botões, formulários e o chatbot. |
| ⚙️ **Backend** | Node.js, Express, Axios | É o cérebro principal. Gerencia usuários, autenticação, define a API e orquestra a comunicação com o serviço de IA. |
| 🧠 **IA** | Python, FastAPI, `pg_vector` | Microserviço especialista que recebe textos do backend e usa Modelos de IA para realizar a busca semântica e a classificação de temas. |
| 🗄️ **Banco de Dados** | PostgreSQL | Armazena de forma permanente todos os dados: usuários, perfis, documentos, chamados e os vetores (embeddings) para a busca semântica. |
| 🤖 **Modelos de IA** | LLMs e Modelos de Embedding | A inteligência em si. Modelos como `GPT`, `Gemini` ou `Llama 3` para classificar temas, e modelos como `text-embedding-3` para a busca. |

---

## 📂 Estrutura  Monorepo
O projeto é organizado em um monorepo para facilitar o desenvolvimento integrado.
