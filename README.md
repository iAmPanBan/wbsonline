# Winfield Strategy React/Node prototype

This repository now includes a lightweight React UI backed by a Node.js JSON database. The Node server exposes `/api/courses` for retrieving and adding courses and serves the React front-end from the `client` directory.

## Running the app
1. Ensure Node.js 18+ is available in your environment.
2. From the repository root, start the server:
   ```sh
   node server.js
   ```
3. Open http://localhost:3000 in your browser. Add a course using the form; data is persisted to `data/courses.json`.

## API
- `GET /api/courses` – Returns the JSON array of courses.
- `POST /api/courses` – Accepts `{ "title": string, "description": string, "image"?: string }` and appends a new course to the JSON database.
