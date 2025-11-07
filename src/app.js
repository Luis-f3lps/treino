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
        // Query simples: Pega tudo da tabela musculos
        // Adicionei um ORDER BY para vir em ordem alfabética
        const sqlQuery = 'SELECT id_musculo, nome FROM musculos ORDER BY nome';

        const { rows } = await pool.query(sqlQuery);

        // Retorna a lista de músculos como JSON
        res.status(200).json(rows);

    } catch (err) {
        console.error('Erro ao buscar músculos:', err);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
}); app.get('/api/exercicios/buscar', async (req, res) => {

    // 1. Pega o termo de busca da URL (ex: ?termo=supino)
    const { termo } = req.query;

    // 2. Se o cliente não mandar o termo, não tem o que buscar
    if (!termo) {
        return res.status(400).json({ erro: 'Parâmetro "termo" é obrigatório.' });
    }

    try {
        // 3. O Pulo do Gato: Query com ILIKE e $1
        //    - ILIKE: Ignora maiúsculas/minúsculas
        //    - $1: Parâmetro seguro (evita SQL Injection)
        //    - %...%: Significa "que contenha" o termo
        const sqlQuery = `
      SELECT id_exercicio, nome, link_gif, repeticoes_recomendadas 
      FROM exercicios 
      WHERE nome ILIKE $1
    `;

        const valorBusca = `%${termo}%`;

        // 4. Executa a query
        const { rows } = await pool.query(sqlQuery, [valorBusca]);

        // 5. Retorna os resultados (mesmo que seja uma lista vazia)
        res.status(200).json(rows);

    } catch (err) {
        console.error('Erro ao buscar exercícios:', err);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});
export default app;