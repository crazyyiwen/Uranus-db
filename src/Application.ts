import express, { Express, Request, Response } from 'express';
import { MongoClient } from './database/MongoClient.js';

export class Application {
  private app: Express;
  private mongoClient: MongoClient;
  private readonly port: number;

  constructor(mongoClient: MongoClient, port: number = 3000) {
    this.mongoClient = mongoClient;
    this.port = port;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    // Basic health check route
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Uranus DB API Server',
        status: 'running',
        database: this.mongoClient.isConnected() ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
      });
    });
  }

  async start(): Promise<void> {
    try {
      // Connect to database
      await this.mongoClient.connect();

      // Start server
      this.app.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
      });
    } catch (error) {
      console.error('Failed to start application:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await this.mongoClient.disconnect();
      console.log('Application stopped gracefully');
    } catch (error) {
      console.error('Error stopping application:', error);
      throw error;
    }
  }
}
