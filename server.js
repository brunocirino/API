// Importar dependências
const express = require('express');
const { Client } = require('pg');
const renderApi = require('@api/render-api');

// Configuração do Render API
renderApi.auth('rnd_kU7oHWJwwHOtPFqdO3owuD8YSmN2');

// Inicializar o servidor express
const app = express();

// Middleware para JSON
app.use(express.json());

// Configuração do cliente PostgreSQL
const client = new Client({
    host: 'dpg-crgs4jo8fa8c738oieh0-a.oregon-postgres.render.com',
    user: 'root',
    password: 'uTokQjh58sa3iDyB11V8CX1XzQdp5hUK',
    database: 'dbtcc',
    port: 5432, // Verifique a porta do PostgreSQL (geralmente é 5432)
    ssl: true   // Render geralmente usa SSL nas conexões com o banco
});

client.connect(err => {
    if (err) {
        console.error('Connection error', err.stack);
    } else {
        console.log('Connected to PostgreSQL');
    }
});

// Exemplo de rota para listar serviços
app.get('/services', (req, res) => {
    renderApi.listServices({ name: '', limit: '20' })
        .then(({ data }) => {
            res.json(data); // Retorna os dados da API como resposta
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Erro ao buscar serviços');
        });
});

// Rota para login
app.get('/login/APP/:CPF/:senha', (req, res) => {
    const query = "SELECT COUNT(id_aluno) as count FROM alunos WHERE cpf = $1 AND senha = $2";
    const CPF = decodeURIComponent(req.params.CPF.replace(/\+/g, " "));
    const Senha = decodeURIComponent(req.params.senha.replace(/\+/g, " "));

    client.query(query, [CPF, Senha], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }

        console.log('Resultados:', result.rows);
        if (result.rows[0].count > 0) {
            res.status(200).json({ sucesso: true, mensagem: 'Login realizado com sucesso' });
        } else {
            res.status(404).json({ sucesso: false, mensagem: 'Erro ao realizar login no banco de dados' });
        }
    });
});

// Rota para academias
app.get('/Academias', (req, res) => {
    const query = "SELECT * FROM public.academias";

    client.query(query, (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }

        console.log('Resultados:', result.rows);
        if (result.rows.length > 0) {
            res.status(200).json({ sucesso: true, dados: result.rows });
        } else {
            res.status(404).json({ sucesso: false, mensagem: 'Nenhum registro encontrado' });
        }
    });
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
