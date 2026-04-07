import 'express-async-errors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import errorHandler from './middleware/errorHandler.js';
import rateLimiter from './middleware/rateLimiter.js';
import ChatSocket from './socket/chat.socket.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import organizationRoutes from './routes/organization.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import postRoutes from './routes/post.routes.js';
import forumRoutes from './routes/forum.routes.js';
import jobRoutes from './routes/job.routes.js';
import podcastRoutes from './routes/podcast.routes.js';
import bookRoutes from './routes/book.routes.js';
import tutorialRoutes from './routes/tutorial.routes.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  },
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
});

// Initialize chat socket
const chatSocket = new ChatSocket(io);
chatSocket.initialize();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Type', 'X-Device-Id'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting based on client type
app.use((req, res, next) => {
  const clientType = req.headers['x-client-type'];
  if (clientType === 'mobile') {
    return rateLimiter.mobileLimiter(req, res, next);
  }
  return rateLimiter.apiLimiter(req, res, next);
});

// Request logging (disable in production for performance)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    tryItOutEnabled: true,
  },
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/podcasts', podcastRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use(errorHandler);

export { app, server };