import 'dotenv/config';
import app from './app';

async function startServer() {
  try {
    // Get configuration from environment
    const port = parseInt(process.env.PORT || '3000', 10);

    // Start the application
    await app.start();

    // Graceful shutdown handlers
    process.on('SIGINT', async () => {
      console.log('SIGINT signal received: closing application');
      await app.shut_down();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing application');
      await app.shut_down();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
