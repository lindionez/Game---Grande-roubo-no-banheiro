const express = require('express');
const path = require('path');

const app = express();
const PORT = 6017;

// Serve os arquivos estáticos da pasta atual
app.use(express.static(path.join(__dirname)));
app.set("trust proxy", true);

// Rota principal para o jogo
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
