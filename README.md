# Library Book Tracker

A web application for managing books and tracking their availability, built for the Cloud Computing & DevOps mini project. Demonstrates a full CI/CD pipeline: automated testing, linting, Docker build, and deployment.

**Author:** Aditya Agashe

## Features

- View, add, and search books (by title or author)
- Issue and return books with availability tracking
- Live statistics (total books, total copies, available copies)
- Health check endpoint
- Automated tests, ESLint, Docker containerization, and GitHub Actions CI/CD

## Tech Stack

Node.js · Express.js · HTML/CSS/JS · Node built-in test runner · ESLint · Docker · GitHub Actions · Render

## Project Structure

```text
library-book-tracker/
├── .github/workflows/ci-cd.yml
├── public/index.html
├── test/app.test.js
├── app.js
├── server.js
├── package.json
├── eslint.config.js
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```

## Run Locally

```bash
git clone https://github.com/<your-username>/library-book-tracker.git
cd library-book-tracker
npm install
npm start
```

Then open http://localhost:3000

## Testing

The tests expect a server on port 3000. In one terminal run `npm start`, then in another:

```bash
npm test
npm run lint
```

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/` | Serves the Library Book Tracker UI |
| GET | `/api/books` | Returns all books |
| POST | `/api/books` | Adds a new book |
| POST | `/api/books/:id/issue` | Issues a book |
| POST | `/api/books/:id/return` | Returns a book |
| GET | `/health` | Application health status |

## CI/CD Pipeline

```text
Git push -> Test + Lint -> Docker Build -> Deploy (Render) -> Live
```

Tests and lint run on every push. Docker builds only after tests pass. Deployment runs only after a successful build, on push to `main`.

## Docker

```bash
docker build -t library-book-tracker .
docker run -p 3000:3000 library-book-tracker
```
