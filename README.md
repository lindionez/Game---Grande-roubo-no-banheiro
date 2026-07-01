# Jogo - Roubo de Calcinhas

Um divertido jogo web desenvolvido em HTML, CSS e JavaScript.

## 🎮 Sobre o Jogo

Este é um projeto simples de jogo para navegador web onde o objetivo é interagir e se divertir com os elementos visuais e sonoros do ambiente criado. 

## 🚀 Como Jogar

O jogo foi desenvolvido focando no navegador web (frontend), e agora possui **duas formas** de ser executado, dependendo da sua preferência.

### Opção 1: Execução Direta (Mais Simples)
Não é necessário instalar nenhum ambiente ou rodar comandos complexos.

1. Clone o repositório ou faça o download dos arquivos em formato ZIP.
2. Abra a pasta contendo os arquivos baixados.
3. Dê um clique duplo sobre o arquivo `index.html` e ele abrirá em seu navegador web (Google Chrome, Firefox, Edge, etc.).
4. Divirta-se!

### Opção 2: Servidor Local (via Express)
Para garantir que todos os áudios e recursos carreguem perfeitamente sem bloqueios de segurança do navegador (CORS), você pode rodar o jogo como um servidor web local.

**Pré-requisitos:**
- É necessária a versão **LTS (Long Term Support)** do **Node.js**.
- No Windows, você pode baixar e instalar a versão LTS mais recente com apenas um comando no PowerShell/Terminal:
  ```bash
  winget install OpenJS.NodeJS.LTS
  ```

**Como rodar:**
1. Abra o terminal na pasta raiz do jogo.
2. Baixe as dependências do servidor com o comando:
   ```bash
   npm install
   ```
3. Inicie o servidor Express com:
   ```bash
   node server.js
   ```
4. O console mostrará a URL do jogo. Basta abrir seu navegador e acessar o endereço `http://localhost:6017` (ou a porta indicada).

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estruturação da página e elementos do jogo.
- **CSS3**: Estilização, layout e animações.
- **JavaScript (Vanilla)**: Lógica do jogo e manipulação de áudios/elementos da tela.

## 📝 Licença

Este projeto é de código aberto e está disponibilizado sob a licença [MIT](LICENSE). Isso significa que você pode utilizá-lo, modificá-lo e distribuí-lo livremente, desde que mantenha os devidos créditos, de acordo com as regras da licença.
