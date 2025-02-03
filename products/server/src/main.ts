/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

const message = process.env.API_MESSAGE ?? 'Welcome to server!';
app.get('/', (req, res) => {
  res.send({ message });
});

const port = process.env.PORT ?? '80';
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/`);
});
server.on('error', console.error);
