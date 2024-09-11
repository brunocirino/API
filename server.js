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


app.get('/ConsultaGrupoExist', (req, res) => {
    let query = "SELECT id, Nome FROM grupo_treino";

    client.query(query, (err, rows) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }

        // Transformar os resultados em um formato JSON simples
        const results = rows.map(row => ({
            id: row.id,
            Nome: row.Nome
        }));

        console.log('Resultados:', results);
        // Enviar os resultados como JSON
        res.json(results); // res.json() define o cabeçalho Content-Type como 'application/json' automaticamente
    });
});

app.get('/ConsultaAcademiaExist', (req, res) => {
    let query = "SELECT DISTINCT id, Nome FROM academias";

    client.query(query, (err, rows) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }

        // Transformar os resultados em um formato JSON simples
        const results = rows.map(row => ({
            id: row.id,
            Nome: row.Nome
        }));

        console.log('Resultados:', results);
        // Enviar os resultados como JSON
        res.json(results); // res.json() define o cabeçalho Content-Type como 'application/json' automaticamente
    });
});


app.post('/CriarGrupo/:nome', (req, res) => {

    let query = "INSERT INTO grupo_treino (Nome) VALUES (?)";

    const params = req.params

    client.query(query, [params.nome], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }

        console.log('Grupo criado com sucesso', result.insertId);

        res.status(201).json({ mensagem: 'Grupo criado com sucesso', id: result.insertId });
    });
});

app.post('/CadastrarTreino/:id_prof/:nm_treino/:exercicio/:series/:repeticoes/:comentarios/:id_identificador', (req, res) => {

    let query = "INSERT INTO treinos_criados (id_prof, nm_treino, exercicios, series, repeticoes, comentarios, id_identificador) VALUES (?,?,?,?,?,?,?)";

    const params = req.params

    const Nm_Treino_tratado = decodeURIComponent(params.nm_treino.replace(/\+/g, " "));
    const Nm_exercicio_tratado = decodeURIComponent(params.exercicio.replace(/\+/g, " "));
    const Nm_comentario_tratado = decodeURIComponent(params.comentarios.replace(/\+/g, " "));
    

    client.query(query, [params.id_prof, Nm_Treino_tratado, Nm_exercicio_tratado, params.series, params.repeticoes, Nm_comentario_tratado, params.id_identificador], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro na consulta ao banco de dados' });
        }

        console.log("Treino cadastrado", Nm_comentario_tratado);

        res.status(201).json({ sucesso: true, mensagem: 'Treino criado com sucesso', id: result.insertId });
    });
});

app.post('/CadastrarAcademia/:id_academia/:nm_academia/', (req, res) => {

    let query = "INSERT INTO academias (id, Nome) VALUES (?,?)";

    const params = req.params

    const Id_academia = decodeURIComponent(params.id_academia.replace(/\+/g, " "));
    const nm_academia = decodeURIComponent(params.nm_academia.replace(/\+/g, " "));

    client.query(query, [Id_academia, nm_academia], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro na consulta ao banco de dados' });
        }

        console.log('Cadastro academia feito');

        res.status(201).json({ sucesso: true, mensagem: 'Academia cadastrada com sucesso', id: result.insertId });
    });
});

app.post('/AtribuirAluno/:id_prof/:id_aluno/:id_treino', (req, res) => {

    let query = "INSERT into treinos_atribuidos (id_prof, id_aluno, id_treino) VALUES (?,?,?)";

    const params = req.params

    const id_prof = decodeURIComponent(params.id_prof.replace(/\+/g, " "));
    const id_aluno = decodeURIComponent(params.id_aluno.replace(/\+/g, " "));
    const id_treino = decodeURIComponent(params.id_treino.replace(/\+/g, " "));

    client.query(query, [id_prof, id_aluno, id_treino], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro na consulta ao banco de dados' });
        }

        console.log('Aluno atribuído com sucesso');

        res.status(201).json({ sucesso: true, mensagem: 'Aluno atribuído com sucesso', id: result.insertId });
    });
});

app.post('/CadastrarAparelhos/:id_tipo/:nm_aparelhos/:id_academia', (req, res) => {

    let query = "INSERT INTO tipos_treinos (id_tipo, nome, id_academia) VALUES (?,?,?)";

    const params = req.params

    const id_tipo = decodeURIComponent(params.id_tipo.replace(/\+/g, " "));
    const Id_academia = decodeURIComponent(params.id_academia.replace(/\+/g, " "));
    const nm_aparelhos = decodeURIComponent(params.nm_aparelhos.replace(/\+/g, " "));

    client.query(query, [id_tipo,nm_aparelhos, Id_academia], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro na consulta ao banco de dados' });
        }

        console.log('Cadastro Aparelho feito');

        res.status(201).json({ sucesso: true, mensagem: 'Academia cadastrada com sucesso', id: result.insertId });
    });
});

app.post('/CadastrarUsuario/:email/:senha/:PrimeiroNome/:Sobrenome/:Telefone/:Genero', (req, res) => {

    let query = "INSERT INTO usuários (email, senha, primeiroNome, Sobrenome, Celular, genero) VALUES (?,?,?,?,?,?)";

    const params = req.params

    const email = decodeURIComponent(params.email.replace(/\+/g, " "));
    const senha = decodeURIComponent(params.senha.replace(/\+/g, " "));
    const PrimeiroNome = decodeURIComponent(params.PrimeiroNome.replace(/\+/g, " "));
    const Sobrenome = decodeURIComponent(params.Sobrenome.replace(/\+/g, " "));
    const Telefone = decodeURIComponent(params.Telefone.replace(/\+/g, " "));
    const Genero = decodeURIComponent(params.Genero.replace(/\+/g, " "));

    client.query(query, [email, senha, PrimeiroNome, Sobrenome, Telefone, Genero], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro na consulta ao banco de dados' });
        }

        console.log(result);

        if (result.affectedRows > 0) {
            res.status(201).json({ sucesso: true, mensagem: 'Usuário cadastrado com sucesso', id: result.insertId });
        } else {
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar usuário no banco de dados' });
        }
    });
});

app.post('/CadastrarEndereco/:idUsuario/:cep/:cidade/:estado/:bairro/:numero/:logradouro', (req, res) => {

    let query = "INSERT INTO endereços (id_usuario, cep, cidade, estado, bairro, numero, logradouro) VALUES (?,?,?,?,?,?,?)";

    const params = req.params

    const idUsuario = decodeURIComponent(params.idUsuario.replace(/\+/g, " "));
    const CEP = decodeURIComponent(params.cep.replace(/\+/g, " "));
    const Cidade = decodeURIComponent(params.cidade.replace(/\+/g, " "));
    const Estado = decodeURIComponent(params.estado.replace(/\+/g, " "));
    const Bairro = decodeURIComponent(params.bairro.replace(/\+/g, " "));
    const Numero = decodeURIComponent(params.numero.replace(/\+/g, " "));
    const Logradouro = decodeURIComponent(params.logradouro.replace(/\+/g, " "));

    client.query(query, [idUsuario, CEP, Cidade, Estado, Bairro, Numero, Logradouro], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro na consulta ao banco de dados' });
        }

        console.log(result);

        if (result.affectedRows > 0) {
            res.status(201).json({ sucesso: true, mensagem: 'Endereco cadastrado com sucesso', id: result.insertId });
        } else {
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao cadastrar Endereco no banco de dados' });
        }
    });
});

app.get('/ConsultarIDUsuario/:email', (req, res) => {

    let query = "SELECT ID FROM usuários WHERE email = ?";

    const Email = decodeURIComponent(req.params.email.replace(/\+/g, " "));

    client.query(query, [Email], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }

        id = result[0];

        console.log('Consultei ID login', id);
        res.json(id);
    });
});

app.get('/ConsultarCadastroProf/:email', (req, res) => {

    let query = "SELECT COUNT(email)  AS emailCount FROM `usuários` WHERE email = ?";

    const Email = decodeURIComponent(req.params.email.replace(/\+/g, " "));

    const EmailTradado = `'${Email}'`;

    client.query(query, [EmailTradado], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }
        
        const emailCount = result[0].emailCount;

        if (emailCount == '0') {
            res.status(201).json({ sucesso: true, mensagem: 'Liberado para cadastro' });
        } else {
            res.status(500).json({ sucesso: false, mensagem: 'Já existe um usuário cadastrado com essas informações' });
            console.log(result);
        }
    });
});

app.get('/ConsultarCadastroAluno/:cpf', (req, res) => {

    let query = "SELECT COUNT(cpf) FROM `alunos` WHERE cpf = '?';";

    const CPF = decodeURIComponent(req.params.cpf.replace(/\+/g, " "));

    client.query(query, [CPF], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }

        const CPFCont = result[0].CPFCont;

        if (CPFCont == 0) {
            res.status(201).json({ sucesso: true, mensagem: 'Liberado para cadastro', id: result.insertId });
        } else {
            res.status(500).json({ sucesso: false, mensagem: 'Já existe um usuário cadastrado com essas informações' });
        }
    });
});

app.patch('/Atualizar_ID_usuario/:idUsuario/:email', (req, res) => {

    let query = "UPDATE usuários SET id=? WHERE email=?";

    const ID_usuario = decodeURIComponent(req.params.idUsuario.replace(/\+/g, " "));
    const Email = decodeURIComponent(req.params.email.replace(/\+/g, " "));

    client.query(query, [ID_usuario, Email], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }

        console.log('Resultados:',result);
        if (result.affectedRows > 0) {
            res.status(201).json({ sucesso: true, mensagem: 'ID atualizdo com sucesso', id: result.insertId });
        } else {
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar ID no banco de dados' });
        }
    });
});

app.get('/login/:email/:senha', (req, res) => {

    let query = "SELECT COUNT(id) as count FROM usuários WHERE email = ? AND senha = ?";

    const Email = decodeURIComponent(req.params.email.replace(/\+/g, " "));
    const Senha = decodeURIComponent(req.params.senha.replace(/\+/g, " "));

    client.query(query, [Email, Senha], (err, result) => {
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

app.get('/login/APP/:CPF/:senha', (req, res) => {

    let query = "SELECT COUNT(id_aluno) as count FROM alunos WHERE cpf = ? AND senha = ?";

    const CPF = decodeURIComponent(req.params.CPF.replace(/\+/g, " "));
    const Senha = decodeURIComponent(req.params.senha.replace(/\+/g, " "));

    client.query(query, [CPF, Senha], (err, result) => {
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

app.delete('/excluir_usuario/:idUsuario', (req, res) => {

    let query = "DELETE FROM usuários WHERE id=?";

    const ID_usuario = decodeURIComponent(req.params.idUsuario.replace(/\+/g, " "));

    client.query(query, [ID_usuario], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }

        
        if (result.affectedRows > 0) {
            res.status(201).json({ sucesso: true, mensagem: 'Usuário deletado com sucesso', id: result.insertId });
        } else {
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao deletar usuário no banco de dados' });
        }

        console.log('User excluído');
    });
});

app.delete('/excluir_acesso_aluno/:id', (req, res) => {

    let query = "DELETE FROM treinos_atribuidos WHERE id = ?";

    const id = decodeURIComponent(req.params.id.replace(/\+/g, " "));

    client.query(query, [id], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }

        
        if (result.affectedRows > 0) {
            res.status(201).json({ sucesso: true, mensagem: 'Acesso removido com sucesso', id: result.insertId });
        } else {
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao remover acesso no banco de dados' });
        }

        console.log('Acesso removido');
    });
});

app.delete('/excluir_exercicio/:id_exercicio', (req, res) => {

    let query = "DELETE FROM treinos_criados WHERE id=?";
    
    // Decodifica e substitui os espaços no ID do exercício
    const id_exercicio = decodeURIComponent(req.params.id_exercicio.replace(/\+/g, " "));

    client.query(query, [id_exercicio], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro na consulta ao banco de dados' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ sucesso: true, mensagem: 'Exercício deletado com sucesso' });
        } else {
            res.status(404).json({ sucesso: false, mensagem: 'Exercício não encontrado para exclusão' });
        }
        console.log('Exercicio excluído!');
    });
});


app.get('/ConsultaTreinoExist/:idGrupo/:ValueCamp/:id_Academia', (req, res) => {
    const idGrupo = req.params.idGrupo;
    const valueCamp = req.params.ValueCamp;
    const id_academia = req.params.id_Academia;

    let query = "SELECT nome FROM tipos_treinos WHERE nome LIKE ? AND id_tipo = ? AND id_academia = ?";


    const searchValue = `%${valueCamp}%`;


    client.query(query, [searchValue, idGrupo, id_academia], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }


        const formattedResults = result.map(row => ({
            nome: row.nome
        }));


        console.log('Resultados:',formattedResults);
        res.json(formattedResults);
    });
});

app.get('/ConsultaTreinoExist/:id', (req, res) => {
    const idTreino = req.params.id;

    let query = "SELECT * FROM treinos_criados WHERE id = ? ";

    client.query(query, [idTreino], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }


        const formattedResults = result.map(row => ({
            Titulo: row.nm_treino,
            Exercicio: row.exercicios,
            Serie: row.series,
            Repetição: row.repeticoes,
            Comentario: row.comentarios
        }));


        console.log('Resultados:',formattedResults);
        res.json(formattedResults);
    });
});

app.put('/AlterarTreinoExist/:id', (req, res) => {
    const idTreino = req.params.id;
    const { nm_treino, exercicios, series, repeticoes, comentarios, id_identificador } = req.body;

    // Consulta para verificar o treino atual
    let querySelect = "SELECT * FROM treinos_criados WHERE id = ?";


    client.query(querySelect, [idTreino], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }

        if (result.length === 0) {
            return res.status(404).json({ mensagem: 'Treino não encontrado' });
        }

        // Dados atuais do treino
        const treinoAtual = result[0];

        // Verifica se há alterações
        const alteracoes = {
            nm_treino: treinoAtual.nm_treino !== nm_treino ? nm_treino : null,
            exercicios: treinoAtual.exercicios !== exercicios ? exercicios : null,
            series: treinoAtual.series !== series ? series : null,
            repeticoes: treinoAtual.repeticoes !== repeticoes ? repeticoes : null,
            comentarios: treinoAtual.comentarios !== comentarios ? comentarios : null
        };

        // Atualiza todos os treinos com o mesmo id_identificador, se houver alteração no título
        let queryUpdate = "UPDATE treinos_criados SET ";
        let values = [];

        if (alteracoes.nm_treino) {
            queryUpdate += "nm_treino = ?, ";
            values.push(alteracoes.nm_treino);
            console.log(queryUpdate);
        }
        if (alteracoes.exercicios) {
            queryUpdate += "exercicios = ?, ";
            values.push(alteracoes.exercicios);
        }
        if (alteracoes.series) {
            queryUpdate += "series = ?, ";
            values.push(alteracoes.series);
        }
        if (alteracoes.repeticoes) {
            queryUpdate += "repeticoes = ?, ";
            values.push(alteracoes.repeticoes);
        }
        if (alteracoes.comentarios) {
            queryUpdate += "comentarios = ?, ";
            values.push(alteracoes.comentarios);
        }

        // Remove a vírgula e o espaço extras no final da query
        queryUpdate = queryUpdate.slice(0, -2);
        queryUpdate += " WHERE id = ?";

        // Adiciona o id_identificador no final dos valores
        values.push(idTreino);

        //console.log(queryUpdate);
        client.query(queryUpdate, values, (err, result) => {
            console.log(queryUpdate);
            if (err) {
                console.error('Erro na atualização:', err);
                return res.status(500).json({ mensagem: 'Erro na atualização do banco de dados' });
            }

            res.status(200).json({
                mensagem: `Treino com ID ${idTreino} atualizado com sucesso`,
                alteracoes: alteracoes
            });
        });
    });
});


app.get('/ConsultarAlunosAtribuidos/:idProfessor/:idTreino', (req, res) => {
    const Id_Professor = req.params.idProfessor;
    const id_treino = req.params.idTreino;
    

    let query = "SELECT t.id, alunos.nome FROM treinos_atribuidos as t JOIN alunos on t.id_aluno = alunos.id_aluno where t.id_prof = ? and t.id_treino = ?";


    const searchValue = `${Id_Professor}`;


    client.query(query, [searchValue,id_treino], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }


        const formattedResults = result.map(row => ({
            id: row.id,
            nm_aluno: row.nome
        }));


        console.log('Resultados:',formattedResults);
        res.json(formattedResults);
    });
});



app.get('/ConsultaTreinoExist_idProf/:idProfessor', (req, res) => {
    const Id_Professor = req.params.idProfessor;
    

    let query = "SELECT DISTINCT nm_treino, id_identificador FROM treinos_criados WHERE id_prof = ?";


    const searchValue = `${Id_Professor}`;


    client.query(query, [searchValue], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ mensagem: 'Erro na consulta ao banco de dados' });
        }


        const formattedResults = result.map(row => ({
            nm_treino: row.nm_treino,
            id_treino: row.id_identificador
        }));


        console.log('Resultados:',formattedResults);
        res.json(formattedResults);
    });
});

app.get('/TrazerTreinos/:nm_treino/:id_prof', (req, res) => {
    const Id_Professor = req.params.id_prof;
    const nm_treino = req.params.nm_treino;

    let query = "SELECT id, nm_treino, exercicios, series, repeticoes, comentarios  as count FROM treinos_criados WHERE nm_treino = ? AND id_prof = ?";

    client.query(query, [nm_treino, Id_Professor], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro na consulta ao banco de dados' });
        }

        console.log('Resultados TrazerTreinos:' ,result);

        res.status(201).json(result);
    });
});

app.get('/ConsultarNomeProf/:nm_treino/:id_prof', (req, res) => {
    const Id_Professor = req.params.id_prof;
    const nm_treino = req.params.nm_treino;

    const nm_treino_tratado = decodeURIComponent(nm_treino.replace(/\+/g, " "));

    let query = "SELECT COUNT(nm_treino) as count FROM treinos_criados WHERE nm_treino = ? AND id_prof = ?";

    const formattedQuery = query.replace('?', connection.escape(nm_treino)).replace('?', connection.escape(Id_Professor))


    client.query(query, [nm_treino_tratado, Id_Professor], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro na consulta ao banco de dados' });
        }

        
        console.log('Resultados ConsultarNomeProf:' ,result);
        console.log('Consulta SQL Gerada:', formattedQuery);
        console.log(nm_treino_tratado); // Deve mostrar 'Teste Peito'


        const count = result[0].count;

         // Criar a resposta JSON
         res.json({ nomeValido: count === 0 });
    });
});

app.get('/ConsultarIdTreino/', (req, res) => {


    let query = "SELECT MAX(id_identificador) FROM treinos_criados";

    client.query(query, (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro na consulta ao banco de dados' });
        }


       const id_treino = result[0]['MAX(id_identificador)'];

        console.log('Resultados ConsultarIdTreino:' ,id_treino);

        res.status(201).json(id_treino);
    });
});

app.get('/ConsultarIdAcademia/', (req, res) => {


    let query = "SELECT MAX(id) FROM academias";

    client.query(query, (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro na consulta ao banco de dados' });
        }


       const id_academia = result[0]['MAX(id)'];

        console.log('Resultados ConsultarIdTreino:' ,id_academia);

        res.status(201).json(id_academia);
    });
});

app.get('/ConsultarAlunoExistente/:idAluno', (req, res) => {

    const ID_Aluno = req.params.idAluno;

    let query = "SELECT nome,id_aluno FROM alunos WHERE id_aluno = ?";

    client.query(query, [ID_Aluno], (err, result) => {
        if (err) {
            console.error('Erro na consulta:', err);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro na consulta ao banco de dados' });
        }


        const formattedResults = result.map(row => ({
            nm_aluno: row.nome,
            id_aluno: row.id_aluno
        }));

        console.log('Resultados Consultar Aluno existente:' ,formattedResults);

        res.status(201).json(formattedResults);
    });
});

// Inicializar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
