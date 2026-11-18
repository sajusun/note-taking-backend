import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import postRoutes from './routes/postRoutes.js';
import aggregationRoutes from './routes/aggregationRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

const app = express();

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Permissive CORS Configuration for Local Dev & Production
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Request Logger (Development)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Care Guide BD - Secure Note-Taking REST API is running',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth',
      notes: '/api/notes',
      users: '/api/users',
      posts: '/api/posts',
      aggregations: '/api/aggregations'
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/aggregations', aggregationRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

export default app;
