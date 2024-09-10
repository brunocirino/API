// Importar dependências
var mysql = require('mysql');
const express = require('express');
const server = express();
const renderApi = require('@api/render-api');

// Configuração do Render API
renderApi.auth('rnd_kU7oHWJwwHOtPFqdO3owuD8YSmN2');

// Inicializar o servidor express
const app = express();

// Middleware para JSON
app.use(express.json());

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

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'web_tcc'
});

connection.connect(function(err){
    if(err){
        console.log(err.code);
        console.log(err.fatal);
    }
})

server.get('/login/APP/:CPF/:senha', (req, res) => {

    let query = "SELECT COUNT(id_aluno) as count FROM alunos WHERE cpf = ? AND senha = ?";

    const CPF = decodeURIComponent(req.params.CPF.replace(/\+/g, " "));
    const Senha = decodeURIComponent(req.params.senha.replace(/\+/g, " "));

    connection.query(query, [CPF, Senha], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }

        console.log('Resultados:',result);
        if (result[0].count > 0) {
            res.status(200).json({ sucesso: true, mensagem: 'login realizado com sucesso' });
        } else {
            res.status(404).json({ sucesso: false, mensagem: 'Erro ao realizar login no banco de dados' });
        }
    });
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
