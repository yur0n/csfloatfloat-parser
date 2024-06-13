import app from './app.js'
import https from 'https';
import socket from './socket.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import connectToDb from './db/connection.js';

import '../bots/bot_admin.js'
import '../bots/bot_notifier.js'

try {
  await connectToDb();
  console.log('Connected to DB');
} catch (error) {
  console.log('Error connecting to DB', error.message);
}

// import http from 'http';
// const httpServer = http.createServer(app);
// const server = httpServer.listen(3000, () => {
//   console.log('HTTP Server running on port: 3000');
// });

const port = process.env.PORT || 443;

const privateKey = readFileSync(join(import.meta.dirname, '../tls/key.pem'), 'utf8');
const certificate = readFileSync(join(import.meta.dirname, '../tls/cert.pem'), 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate
};

const httpsServer = https.createServer(credentials, app);

const server = httpsServer.listen(port, () => {
  console.log('HTTPS Server running on port: ' + port);
});

socket(server);