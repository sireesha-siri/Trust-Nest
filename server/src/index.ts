import './config/env.js';
import express, { Request, Response } from 'express';
import cors, { CorsOptions } from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import aiRoutes from './routes/aiRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import cityServiceRoutes from './routes/cityServiceRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import { connectDB, getDatabaseStatus } from './config/db.js';
import { GeminiService } from './services/geminiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configurable CORS Policy with robust localhost & 127.0.0.1 development support
const defaultDevOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

const corsOriginEnv = process.env.CORS_ORIGIN;
const configuredOrigins = corsOriginEnv
  ? corsOriginEnv.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // 1. Allow non-browser requests with no origin (curl, server-to-server, health check)
    if (!origin) {
      return callback(null, true);
    }

    // 2. Permissive wildcard if explicitly set
    if (corsOriginEnv === '*') {
      return callback(null, true);
    }

    // 3. Explicitly configured origins from environment
    if (configuredOrigins.includes(origin)) {
      return callback(null, true);
    }

    // 4. In development or local testing, always permit localhost and 127.0.0.1 loopback
    if (
      defaultDevOrigins.includes(origin) ||
      (NODE_ENV !== 'production' &&
        (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')))
    ) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not permitted by TrustNest CORS policy.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    status: 'online',
    service: 'TrustNest Core API',
    environment: NODE_ENV,
    pilotLocation: 'Hyderabad (HITEC City & Madhapur)',
    framework: 'Human + AI Verification',
    database: {
      configured: !!(process.env.MONGODB_URI && process.env.MONGODB_URI.trim()),
      connected: dbStatus.connected,
      databaseName: dbStatus.databaseName,
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/city-services', cityServiceRoutes);
app.use('/api/community', communityRoutes);

// 404 Handler for Unmatched API Routes (Express 5 compatible without asterisks)
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND',
  });
});

// Optional: Serve built frontend in unified deployment mode (if client/dist exists)
const clientDistPath = path.resolve(__dirname, '../../client/dist');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  // Catch-all SPA route using pathless middleware (Express 5 compatible)
  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Catch-all 404 for non-API requests when client/dist is not present
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `Resource not found: ${req.method} ${req.originalUrl}`,
    });
  });
}

async function startServer() {
  try {
    await connectDB();
  } catch (err: any) {
    console.error(`[Fatal Startup Error] ${err.message}`);
    console.error('[Server Abort] Halting server startup because database connection failed.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    const gemini = GeminiService.getInstance();
    const activeModel = gemini.getModelName() || 'NOT_CONFIGURED';
    console.log(`[TrustNest Server] Running in ${NODE_ENV} mode on port ${PORT}`);
    console.log(`[AI Configuration] Model: ${activeModel} | API Key Configured: ${gemini.isConfigured() ? 'YES' : 'NO'}`);
  });
}

startServer();
