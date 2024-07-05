const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const port = 3001;

const filmesPath = path.join(__dirname, 'filmes.json');
const filmesData = fs.readFileSync(filmesPath, 'utf-8');
const filmes = JSON.parse(filmesData);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function buscarGenero(genero){
    return filmes.find (filme => filme.genero === genero);
}

function criarCard(filme) {
    return `
        <div class="card">
                <img src="${filme.url_cartaz}" class="card-img-top w-200 h-200" alt="${filme.nome}">
            <div class="card-body">
                <h5 class="card-title">${filme.nome}</h5>
                <p class="card-text">${filme.genero}</p>
                <p class="card-text">${filme.descricao}</p>
                <a href="#" class="btn btn-primary">Mais Informações</a>
            </div>
        </div>     
    `;
}

app.get('', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/verificar', (req, res) => {
    const cardsHtml = filmes.map(filme => criarCard(filme)).join('');
    const pagehtmlPath = path.join(__dirname, 'dadosfilme.html');
    let pageHtml = fs.readFileSync(pagehtmlPath, 'utf-8');
    pageHtml = pageHtml.replace('{{cardsHtml}}', cardsHtml);
    res.send(pageHtml);
});

app.get('/filtrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'filtrar.html'));
})

app.get('/filtrar/:genero', (req, res) => {
    const genero = req.query.genero;
    const generoFiltrado = filmes.filter(filme => filme.genero=== genero);
    const generoEncontrado = buscarGenero(genero);

    let card = '';

    if (generoEncontrado){
        generoFiltrado.forEach(filme => {

            card += `
                <div class="card">
                        <img src="${filme.url_cartaz}" class="card-img-top" style="max-width: 360px; justify-content:center;" alt="${filme.nome}">
                    <div class="card-body">
                        <h5 class="card-title">${filme.nome}</h5>
                        <p class="card-text">${filme.genero}</p>
                        <a href="#" class="btn btn-primary">Mais Informações</a>
                    </div>
                </div>   
            `;
        });
        
        const htmlContent = fs.readFileSync('dados.html', 'utf-8');
        const finalHtml = htmlContent.replace('{{card}}', card);

        res.send(finalHtml);

    } else{
        res.send('<h2>Gênero não encontrado</h2>');
    }
});

app.get('/adicionar', (req, res) => {
    res.sendFile(path.join(__dirname, 'adicionar.html'));
})

app.post('/adicionar', (req, res) => {
    const novoFilme = req.body;

    if (filmes.find(filme => filme.nome.toLowerCase() === novoFilme.nome.toLowerCase)) {
        res.send('<h2>Filme já existe. Não é possível adiciona duplicatas.</h2>');
        return;
    }

    filmes.push(novoFilme);

    salvarDados(filmes);

    res.send('<h2>Filme adicionado com sucesso!</h2>');
});

app.get('/editar', (req, res) => {
    res.sendFile(path.join(__dirname, 'editar.html'));
});

app.post('/editar', (req, res) => {
    const { nome, novaDescricao, novoAno, novoGenero } = req.body;

    let filmesData = fs.readFileSync(filmesPath, 'utf-8');
    let filmes = JSON.parse(filmesData);

    const filmeIndex = filmes.findIndex(filme => filme.nome === nome);

    if (filmeIndex === -1){
        res.send('<h2>Filme não encontrado.</h2>');
        return;
    }

    filmes[filmeIndex].descricao = novaDescricao;
    filmes[filmeIndex].ano = novoAno;
    filmes[filmeIndex].genero = novoGenero;

    salvarDados(filmes);

    res.send('<h2>Dados do filme atualizados com sucesso!</h2>');
});

app.get('/excluir', (req, res) => {
    res.sendFile(path.join(__dirname, 'excluir.html'));
});

app.post('/excluir', (req, res) => {
    const { nome } = req.body;

    let filmesData = fs.readFileSync(filmesPath, 'utf-8');
    let filmes = JSON.parse(filmesData);

    const filmeIndex = filmes.findIndex(filme => filme.nome === nome);

    if (filmeIndex === -1) {
        res.send('<h2>Filme não encontrado.</h2>');
        return;
    }

    res.send(`
    <script>
        if (confirm('Tem certeza de que deseja excluir o filme ${nome}?')){
            window.location.href = '/excluir-filme?nome=${nome}';
        } else{
            window.location.href = '/excluir';
        }
    </script>
    `);
});

app.get('/excluir-filme', (req, res) => {
    const nome = req.query.nome;

    let filmesData = fs.readFileSync(filmesPath, 'utf-8');
    let filmes = JSON.parse(filmesData);

    const filmeIndex = filmes.findIndex(filme => filme.nome === nome);

    filmes.splice(filmeIndex, 1);

    salvarDados(filmes);

    res.send(`<h2>O filme ${nome} foi excluído com sucesso!</h2>`);
});

function salvarDados(filmes) {
    fs.writeFileSync(filmesPath, JSON.stringify(filmes, null, 2));
}

app.listen(port, () => {
    console.log(`Servidor iniciado em http://localhost:${port}`);
})