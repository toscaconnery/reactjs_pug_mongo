const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

// Check connection
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', err => {
    console.log(err);
})

// Init App
const app = express();

const port = 3000;

/// Bring in Models
let Article = require('./model/article');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Home Route
app.get('/', (req, res) => {
    Article.find({}, function(err, articles) {
        if(err){
            console.log(err);
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    });
});

// Get Single Article
app.get('/article/:id', (req, res) => {
    Article.findById(req.params.id, function(err, article) {
        res.render('article', {
            article: article
        });
    });
});

app.get('/articles/add', (req, res) => {
    res.render('add_article', {
        title: 'Add Article'
    })
});

app.post('/articles/add', (req, res) => {
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    article.save(err => {
        if(err) {
            console.log(err);
            return
        } else {
            res.redirect('/');
        }
    });
});

// Load edit form
app.get('/article/edit/:id', (req, res) => {
    Article.findById(req.params.id, function(err, article) {
        res.render('edit_article', {
            article: article,
            title: 'Edit Article'
        });
    });
});

app.post('/article/edit/:id', (req, res) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}

    Article.update(query, article, err => {
        if(err) {
            console.log(err);
            return;
        } else {
            res.redirect('/');
        }
    });
});

app.delete('/article/:id', function(req, res) {
    let query = {_id:req.params.id}

    Article.remove(query, function(err) {
        console.log(err);
    });
    res.send('Success');
});

// Start Server
app.listen(port, () => {
    console.log(`Server connected at ${port}`);
});