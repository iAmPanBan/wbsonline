const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const DATA_PATH = path.join(__dirname, 'data', 'courses.json');
const CLIENT_DIR = path.join(__dirname, 'client');

async function readCourses() {
  const file = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(file);
}

async function saveCourses(courses) {
  await fs.writeFile(DATA_PATH, JSON.stringify(courses, null, 2) + '\n');
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function serveStatic(req, res) {
  const safePath = path.normalize(req.url.split('?')[0]).replace(/^\/+/, '');
  const requested = safePath === '' ? 'index.html' : safePath;
  const filePath = path.join(CLIENT_DIR, requested);

  fs.readFile(filePath)
    .then((content) => {
      const ext = path.extname(filePath);
      const type = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
      }[ext] || 'text/plain';

      res.writeHead(200, { 'Content-Type': type });
      res.end(content);
    })
    .catch(() => {
      res.writeHead(404);
      res.end('Not found');
    });
}

function handleApi(req, res) {
  if (req.method === 'OPTIONS') {
    return sendJson(res, 204, {});
  }

  if (req.method === 'GET') {
    return readCourses()
      .then((courses) => sendJson(res, 200, courses))
      .catch((error) => sendJson(res, 500, { message: 'Failed to read courses', error: error.message }));
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { title, description, image } = payload;
        if (!title || !description) {
          return sendJson(res, 400, { message: 'title and description are required' });
        }

        const courses = await readCourses();
        const id = Date.now();
        const newCourse = { id, title, description, image: image || '' };
        courses.push(newCourse);
        await saveCourses(courses);
        sendJson(res, 201, newCourse);
      } catch (error) {
        sendJson(res, 400, { message: 'Invalid JSON', error: error.message });
      }
    });
    return;
  }

  sendJson(res, 405, { message: 'Method not allowed' });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/courses')) {
    return handleApi(req, res);
  }

  serveStatic(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
