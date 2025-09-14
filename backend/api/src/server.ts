import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import connectDatabase from './utils/database';
import routes from './routes';
import { globalErrorHandler, notFound } from './middleware';

const app: Application = express();

// Connect to database
connectDatabase();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // In development, be more permissive for mobile devices
    if (process.env.NODE_ENV === 'development') {
      // Allow any local network origin for development
      if (origin.includes('localhost') || 
          origin.includes('127.0.0.1') || 
          origin.includes('10.') || 
          origin.includes('192.168.') || 
          origin.includes('172.') ||
          origin.startsWith('exp://')) {
        return callback(null, true);
      }
    }
    
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      'http://localhost:8081', // Expo default
      'http://localhost:19006', // Expo web
      'exp://localhost:19000', // Expo development
      'http://localhost:19002', // Expo DevTools
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`CORS: Blocked origin ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static file serving
const uploadsPath = path.join(__dirname, '..', process.env.UPLOAD_PATH || './uploads');
app.use('/uploads', express.static(uploadsPath));

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Lexipic API!',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      questions: '/api/questions',
      image: '/api/image'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(globalErrorHandler);

const PORT = parseInt(process.env.PORT || '3000', 10);

// Start server - bind to 0.0.0.0 to accept connections from network
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`📱 Mobile access: Make sure to use your computer's IP address (not localhost)`);
  console.log(`💡 Find your IP: 'ipconfig getifaddr en0' (Mac) or 'ipconfig' (Windows)`);
  console.log(`📁 Uploads directory: ${uploadsPath}`);
  console.log(`🌍 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:8081'}`);
  console.log(`🔑 JWT secret configured: ${!!process.env.JWT_SECRET}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

export default app;
