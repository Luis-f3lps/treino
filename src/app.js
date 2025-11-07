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

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/montar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'montar.html'));
});
app.get('/tmb', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tmb.html'));
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
    const baseQuery = `
      SELECT 
        e.id_exercicio, 
        e.nome, 
        e.link_gif, 
        e.repeticoes_recomendadas,
        m_prim.nome_musculo AS musculo_primario_nome,
        (
          SELECT STRING_AGG(m_sec.nome_musculo, ', ')
          FROM exercicio_musculos_secundarios ems
          JOIN musculos m_sec ON ems.musculo_id = m_sec.id_musculo
          WHERE ems.exercicio_id = e.id_exercicio
        ) AS musculos_secundarios_nomes
      FROM 
        exercicios e
      LEFT JOIN 
        musculos m_prim ON e.musculo_primario_id = m_prim.id_musculo
    `;
    
    let sqlQuery;
    let params = [];

    if (id) {
      sqlQuery = baseQuery + ` WHERE e.musculo_primario_id = $1 ORDER BY e.nome`;
      params.push(id);
    } else {
      sqlQuery = baseQuery + ` ORDER BY e.nome`;
    }
    
    const { rows } = await pool.query(sqlQuery, params);

    res.status(200).json(rows);

  } catch (err) {
    console.error('Erro ao buscar exercícios por músculo:', err);
    res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
});

app.get('/api/exercicios/info', async (req, res) => {
    
    const { ids } = req.query; 

    if (!ids) {
        return res.status(400).json({ erro: 'Parâmetro "ids" é obrigatório.' });
    }

    const idArray = ids.split(',');

    try {
  
        const sqlQuery = `
            SELECT 
                e.id_exercicio, 
                e.nome, 
                e.link_gif, 
                e.repeticoes_recomendadas,
                m_prim.nome_musculo AS musculo_primario_nome,
                (
                    SELECT STRING_AGG(m_sec.nome_musculo, ', ')
                    FROM exercicio_musculos_secundarios ems
                    JOIN musculos m_sec ON ems.musculo_id = m_sec.id_musculo
                    WHERE ems.exercicio_id = e.id_exercicio
                ) AS musculos_secundarios_nomes
            FROM 
                exercicios e
            LEFT JOIN 
                musculos m_prim ON e.musculo_primario_id = m_prim.id_mu-sculo
            WHERE
                e.id_exercicio = ANY($1::varchar[])
        `;
        
        // Passa o array de IDs como parâmetro
        const { rows } = await pool.query(sqlQuery, [idArray]);
        
        res.status(200).json(rows);

    } catch (err) {
        console.error('Erro ao buscar exercícios por IDs:', err);
        res.status(500).json({ erro: 'Erro interno do servidor.' });
    }
});
export default app;