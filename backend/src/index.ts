import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDatabase } from './infrastructure/database/prisma';

async function bootstrap() {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`, { env: env.NODE_ENV });
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
}

bootstrap();
