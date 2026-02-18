import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import candidateRoutes from './modules/candidates/candidates.routes';
import employerRoutes from './modules/employers/employers.routes';
import adminRoutes from './modules/admin/admin.routes';
import jobRoutes from './modules/jobs/jobs.routes';
import jobAlertRoutes from './modules/jobAlerts/jobAlerts.routes';
import subscriptionRoutes from './modules/subscriptions/subscriptions.routes';
import webhookRoutes from './modules/webhooks/stripe.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();

// Stripe webhook route (must be BEFORE express.json() to receive raw body)
app.use('/api/v1/webhooks', webhookRoutes);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'CV Hive API Server',
    version: '1.0.0',
    api: '/api/v1',
    health: '/health',
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'CV Hive API is running',
    timestamp: new Date().toISOString(),
  });
});

// Welcome route
app.get('/api/v1', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to CV Hive API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      candidates: '/api/v1/candidates',
      employers: '/api/v1/employers',
    },
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/employers', employerRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/job-alerts', jobAlertRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
