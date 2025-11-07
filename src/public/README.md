# Treino Black | Montador de Fichas de Treino

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Tech](https://img.shields.io/badge/stack-full--stack-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

Este repositório contém o código-fonte do **Treino Black**, uma aplicação web full-stack pensada para simplificar a criação, visualização e compartilhamento de fichas de treino de academia.

Nosso principal objetivo é ser a ponte entre um catálogo complexo de exercícios e a necessidade de um treino estruturado (A, B, C, D), permitindo que qualquer pessoa monte uma rotina visual e funcional em minutos.

## 🎯 Objetivo da Aplicação

* **Facilitar** a criação de rotinas de treino através de uma interface visual interativa (70/30).
* **Apresentar** de forma clara a execução de cada exercício através de GIFs.
* **Centralizar** informações como nome, músculo primário, secundários e repetições recomendadas.
* **Gerar** um "link" ou string de treino compartilhável, permitindo que o treino seja visualizado em qualquer lugar.

## 🏋️ Funcionalidades Principais

As funcionalidades da aplicação focam na simplicidade e eficiência do fluxo de montagem de treino:

* **Catálogo de Exercícios:** Busca dinâmica no banco de dados com filtro por grupo muscular.
* **Montador Interativo:** Painel duplo onde você explora os exercícios (esquerda) e monta sua ficha (direita).
* **Visualizador de Treino:** Uma página dedicada que lê uma string (`exercicio/a01,a+g03,b...`) e renderiza o treino completo, com todos os detalhes e GIFs.

## 📂 Tecnologias Utilizadas

Este projeto foi construído "na unha" (Vanilla JS) para ser leve e performático, consumindo uma API RESTful.

* **Front-End:** HTML5, CSS3, JavaScript (ES6+)
* **Back-End (API):** Node.js, Express.js
* **Banco de Dados:** PostgreSQL
* **Deploy (Padrão):** Vercel

## 🤝 Como Contribuir

Este projeto é um portfólio vivo. Se você quiser contribuir, sinta-se à vontade:

* **Reportar Bugs:** Achou um problema (tipo, o "biceps corno" aparecendo onde não devia)? Abra uma "Issue".
* **Sugerir Novas Features:** Tem uma ideia para melhorar o app? Estamos ouvindo.
* **Pull Requests:** Se você é dev e quer adicionar algo, seu PR é bem-vindo.

## ✉️ Contato

Para mais informações ou sugestões, entre em contato.

* **Desenvolvedor:** Luis Gustavo Barbosa Santiago
* **E-mail:** `[seu-email-aqui@dominio.com]`
* **LinkedIn:** `[link-do-seu-linkedin-aqui]`

---
Este projeto está licenciado sob a [Licença MIT](LICENSE).