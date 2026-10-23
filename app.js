const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const books = [
    {
        id: 1,
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        total: 3,
        available: 3
    },
    {
        id: 2,
        title: 'Clean Code',
        author: 'Robert C. Martin',
        total: 2,
        available: 2
    },
    {
        id: 3,
        title: 'Java Basics',
        author: 'Herbert Schildt',
        total: 4,
        available: 4
    }
];

const getCommit = () => {
    const commit = process.env.RENDER_GIT_COMMIT || 'local';
    return commit.slice(0, 7);
};

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'index.html');

    const fs = require('fs');
    let html = fs.readFileSync(filePath, 'utf8');

    html = html.replace('__COMMIT__', getCommit());

    res.send(html);
});

app.get('/api/books', (req, res) => {
    res.json(books);
});

app.post('/api/books', (req, res) => {
    const { title, author, total } = req.body;

    if (
        typeof title !== 'string' ||
        typeof author !== 'string' ||
        !title.trim() ||
        !author.trim() ||
        !Number.isInteger(Number(total)) ||
        Number(total) <= 0
    ) {
        return res.status(400).json({
            error: 'Valid title, author and a positive total quantity are required'
        });
    }

    const newBook = {
        id: books.length + 1,
        title: title.trim(),
        author: author.trim(),
        total: Number(total),
        available: Number(total)
    };

    if (!newBook.title || !newBook.author) {
        return res.status(400).json({
            error: 'Title and author cannot be empty'
        });
    }

    books.push(newBook);

    res.status(201).json(newBook);
});

app.post('/api/books/:id/issue', (req, res) => {
    const id = Number(req.params.id);

    const book = books.find((item) => item.id === id);

    if (!book) {
        return res.status(404).json({
            error: 'Book not found'
        });
    }

    if (book.available <= 0) {
        return res.status(400).json({
            error: 'No copies available'
        });
    }

    book.available -= 1;

    res.json(book);
});

app.post('/api/books/:id/return', (req, res) => {
    const id = Number(req.params.id);

    const book = books.find((item) => item.id === id);

    if (!book) {
        return res.status(404).json({
            error: 'Book not found'
        });
    }

    if (book.available >= book.total) {
        return res.status(400).json({
            error: 'All copies are already available'
        });
    }

    book.available += 1;

    res.json(book);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok'
    });
});

module.exports = app;
