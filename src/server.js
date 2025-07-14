import 'express-async-errors';
import 'dotenv/config';
import express, { Router, urlencoded } from 'express';
import morgan from 'morgan';
import path from 'path'
import { fileURLToPath } from 'url';;
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import env from './config/env.js';
import baseRoutes from './routes/index.js';
import { ErrorHandler } from './middlewares/errorHandler.js';
import { socketBlock } from './jobs/socketio.js';

import swaggerUi from 'swagger-ui-express';
//import { apiDocumentation } from './docs/apidocs.js';
import { createKeys } from './utils/vault.js';
import { redisLimiter } from './middlewares/redisRateLimiter.js';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const router = Router();
const rootRouter = baseRoutes(router);

const app = express();

const server = http.createServer(app);


let routePath;
if (env.node_env === 'production') {
  routePath = '/prod/sockets';
} else {
  routePath = '/stag/sockets';
}

let io = new Server(server, {
  cors: { origin: 'http://localhost:8080', methods: ['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE', 'PATCH'], credentials: true }
});

io = io.of(routePath);

app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
}));
app.use(express.json());
app.use(urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('combined'));
//app.use(`/api/v1/mmcop/stag/documentation`, swaggerUi.serve, swaggerUi.setup(apiDocumentation));
const port = env.port;
// Track online users
const onlineUsers = new Map(); // { userId: socketId }
socketBlock({ io, onlineUsers });

if (env.node_env === 'production') {
  // routes
  app.use('/api/v1/youth', rootRouter);
} else {
  // routes
  app.use('/api/v1/youth/stag', rootRouter);
}
app.use(redisLimiter); // Use Redis-based limiter instead
app.use('*', (req, res) => {
  res.status(404).send({ message: 'Resource URL not found', success: false, data: null });
});

// Error handlers
app.use(ErrorHandler);

server.listen(port, () => {
  console.log(`🥂server dey function for port ${port}🥂`);
});
