# Wildlife Sanctuary Database Management Dashboard

Lightweight dashboard to explore and manage a MySQL-backed Wildlife Sanctuary database from a simple web UI and REST API.

## Features

- Browse database tables and columns
- View full table contents, first/last rows and distinct column values
- Add, update and delete records via the UI/API
- Run custom SQL queries from the API

## Tech stack

- Node.js + Express
- MySQL (mysql2)
- Frontend: static HTML/CSS/JS served from the project root

## Prerequisites

- Node.js (v14+)
- MySQL server

## Quick start

1. Install dependencies

```bash
npm install
```

2. Configure the database connection in `db.js` (or modify it to use environment variables). The project expects a database named `wildlife_santuary` by default.

3. Start the server

```bash
npm start
```

4. Open the dashboard in your browser:

```
http://localhost:3000
```

## Database

Create the MySQL database and tables required for your sanctuary data. Example (run in MySQL):

```sql
CREATE DATABASE IF NOT EXISTS `wildlife_santuary`;
-- then create tables and import your data
```

Update the connection credentials in `db.js` before starting the app.

## API (selected endpoints)

- `GET /tables` — list tables
- `GET /columns/:table` — list columns for a table
- `GET /table/:table` — select * from table
- `POST /add/:table` — insert row (JSON body)
- `POST /delete` — delete row (JSON body: `{ table, column, value }`)
- `POST /update` — update values (JSON body: `{ table, column, oldValue, newValue }`)
- `GET /search/:table/:column/:value` — exact-match search
- `POST /query` — run a custom SQL query (JSON body: `{ sql }`)

The server listens on port `3000` by default.

## Project structure

- `server.js` — Express server and API routes
- `db.js` — MySQL connection (update credentials here)
- `index.html`, `script.js`, `style.css` — frontend dashboard
- `package.json` — project manifest

## Contributing

1. Fork the repo
2. Create a branch with a clear name
3. Open a pull request

## License

This project is provided under the MIT License. See LICENSE for details.

## Questions / Contact

If you need help, open an issue or contact the repo owner.

