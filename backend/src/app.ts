import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './presentation/middleware/error.middleware';
import authRoutes from './presentation/routes/auth.routes';
import serviceRoutes from './presentation/routes/service.routes';
import applicationRoutes from './presentation/routes/application.routes';
import miscRoutes from './presentation/routes/misc.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Government Citizen Services Portal API is running' });
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.NODE_ENV === 'production' ? 500 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api', miscRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
