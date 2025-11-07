import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool from './database.js'; // Importa a pool de conexões do arquivo database.js

// Definindo __filename e __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregando variáveis de ambiente do arquivo .env
dotenv.config({ path: path.resolve(__dirname, 'variaveis.env') });
console.log({
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
});

const app = express();

// Testando a conexão ao banco de dados
(async () => {
    try {
        await pool.query('SELECT NOW()'); // Consulta simples para testar a conexão
        console.log('Conexão bem-sucedida ao banco de dados!');
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    }
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rotas do servidor
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/musculos', async (req, res) => {
  try {

    const sqlQuery = 'SELECT id_musculo, nome_musculo FROM musculos ORDER BY nome_musculo';
    
    const { rows } = await pool.query(sqlQuery);
    

    const respostaFormatada = rows.map(musculo => {
      return {
        id_musculo: musculo.id_musculo, 
        nome: musculo.nome_musculo      
      };
    });

    res.status(200).json(respostaFormatada);

  } catch (err) {
    console.error('Erro ao buscar músculos:', err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});
app.get('/api/exercicios/por-musculo', async (req, res) => {
  
  const { id } = req.query; 

  try {
    let sqlQuery;
    let params = []; 

    if (id) {
      sqlQuery = `
        SELECT id_exercicio, nome, link_gif, repeticoes_recomendadas 
        FROM exercicios 
        WHERE musculo_primario_id = $1
        ORDER BY nome
      `;
      params.push(id); 
    } else {
      sqlQuery = `
        SELECT id_exercicio, nome, link_gif, repeticoes_recomendadas 
        FROM exercicios 
        ORDER BY nome
      `;
    }
    
    const { rows } = await pool.query(sqlQuery, params);

    res.status(200).json(rows);

  } catch (err) {
    console.error('Erro ao buscar exercícios por músculo:', err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});
export default app;