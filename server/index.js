import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { initDatabase } from './db/database.js';
import { authRouter } from './routes/auth.js';
import { apiRouter } from './routes/api.js';
import { adminRouter } from './routes/admin.js';
import { attendanceRouter } from './routes/attendance.js';
import { assignmentsRouter } from './routes/assignments.js';
import { parentRouter } from './routes/parent.js';
import { diagnosticsRouter } from './routes/diagnostics.js';
import { cbseLibraryRouter } from './routes/cbseLibrary.js';
import { admissionsRouter } from './routes/admissions.js';

// Initialize SQLite database and seed records
initDatabase();

export const app = express();
const PORT = process.env.PORT || 5001;

// Security & Parsing Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key']
}));
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[Vayentra API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    platform: 'Vayentra Gurukula Unified Learning Platform',
    status: 'ONLINE',
    version: '1.0.0-production',
    database: 'SQLite (Persistent Storage Engine)',
    endpoints: {
      health: '/api/v1/health',
      authGoogle: '/api/v1/auth/google',
      authOtp: '/api/v1/auth/otp/send',
      schoolCatalogue: '/api/v1/school/catalogue',
      chapters: '/api/v1/school/chapters',
      flashcards: '/api/v1/school/practice/flashcards',
      timedTests: '/api/v1/school/tests/:chapterId',
      technicalAcademy: '/api/v1/tech/courses',
      aiTutorDoubts: '/api/v1/doubts',
      safeguardingDesk: '/api/v1/safeguarding/cases',
      plans: '/api/v1/plans'
    },
    documentation: 'Refer to VAYENTRA_MASTER_BLUEPRINT_AND_PLAN.md & Vayentra_Backend_Schema_SRS_V1.docx'
  });
});

// Mount Authentication & Main API Routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/attendance', attendanceRouter);
app.use('/api/v1/assignments', assignmentsRouter);
app.use('/api/v1/parent', parentRouter);
app.use('/api/v1/diagnostics', diagnosticsRouter);
app.use('/api/v1/cbse', cbseLibraryRouter);
app.use('/api/v1/admissions', admissionsRouter);
app.use('/api/v1', apiRouter);

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found on Vayentra API gateway.`
  });
});

// Safe Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Vayentra API Error]:', err);
  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected server error occurred. Our engineering operations team has been notified.'
  });
});

// Start Server if run directly and not in test mode
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
const isTest = process.env.NODE_ENV === 'test' || process.env.TEST_RUNNER || process.execArgv.includes('--test');
if (isDirectRun && !isTest) {
  app.listen(PORT, () => {
    console.log('================================================================');
    console.log(`🚀 VAYENTRA GURUKULA BACKEND SERVER IS RUNNING`);
    console.log(`📍 Local Gateway: http://localhost:${PORT}`);
    console.log(`🩺 Health check:  http://localhost:${PORT}/api/v1/health`);
    console.log(`🔐 Google Auth:   http://localhost:${PORT}/api/v1/auth/google`);
    console.log(`📚 Catalogue:     http://localhost:${PORT}/api/v1/school/catalogue`);
    console.log(`💻 Tech Academy:  http://localhost:${PORT}/api/v1/tech/courses`);
    console.log(`🛡️ Safeguarding:  http://localhost:${PORT}/api/v1/safeguarding/cases`);
    console.log('================================================================');
  });
}
