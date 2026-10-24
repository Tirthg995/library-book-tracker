const { test, after } = require('node:test');
const assert = require('node:assert/strict');

const app = require('../app');

let server;
let baseUrl;

test.before(() => {
    server = app.listen(0);

    const port = server.address().port;

    baseUrl = `http://127.0.0.1:${port}`;
});

after(() => {
    server.close();
});

test('health route returns ok', async () => {
    const response = await fetch(`${baseUrl}/health`);

    assert.equal(response.status, 200);

    const data = await response.json();

    assert.equal(data.status, 'ok');
});

test('books API returns books', async () => {
    const response = await fetch(`${baseUrl}/api/books`);

    assert.equal(response.status, 200);

    const books = await response.json();

    assert.ok(Array.isArray(books));
    assert.ok(books.length > 0);
});

test('adding a book works', async () => {
    const response = await fetch(`${baseUrl}/api/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: 'Test Book',
            author: 'Test Author',
            total: 2
        })
    });

    assert.equal(response.status, 201);

    const book = await response.json();

    assert.equal(book.title, 'Test Book');
    assert.equal(book.available, 2);
});

test('invalid book input is rejected', async () => {
    const response = await fetch(`${baseUrl}/api/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: '',
            author: '',
            total: 0
        })
    });

    assert.equal(response.status, 400);
});

test('book can be issued and returned', async () => {
    const addResponse = await fetch(`${baseUrl}/api/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: 'Issue Test Book',
            author: 'Test Author',
            total: 1
        })
    });

    const book = await addResponse.json();

    const issueResponse = await fetch(
        `${baseUrl}/api/books/${book.id}/issue`,
        {
            method: 'POST'
        }
    );

    assert.equal(issueResponse.status, 200);

    const issuedBook = await issueResponse.json();

    assert.equal(issuedBook.available, 0);

    const returnResponse = await fetch(
        `${baseUrl}/api/books/${book.id}/return`,
        {
            method: 'POST'
        }
    );

    assert.equal(returnResponse.status, 200);

    const returnedBook = await returnResponse.json();

    assert.equal(returnedBook.available, 1);
});

test('returns 404 when issuing a non-existent book', async () => {
    const response = await fetch(
        `${baseUrl}/api/books/9999/issue`,
        {
            method: 'POST'
        }
    );

    assert.equal(response.status, 404);

    const data = await response.json();

    assert.equal(data.error, 'Book not found');
});

test('returns 404 when returning a non-existent book', async () => {
    const response = await fetch(
        `${baseUrl}/api/books/9999/return`,
        {
            method: 'POST'
        }
    );

    assert.equal(response.status, 404);

    const data = await response.json();

    assert.equal(data.error, 'Book not found');
});

test('rejects a book with zero copies', async () => {
    const response = await fetch(`${baseUrl}/api/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: 'Test Book',
            author: 'Test Author',
            total: 0
        })
    });

    assert.equal(response.status, 400);
});

test('rejects a book with a blank title', async () => {
    const response = await fetch(`${baseUrl}/api/books`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: '   ',
            author: 'Test Author',
            total: 2
        })
    });

    assert.equal(response.status, 400);
});
