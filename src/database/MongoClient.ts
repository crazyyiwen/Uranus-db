import { MongoClient as MongoDBClient, Db } from 'mongodb';

export class MongoClient {
  private client: MongoDBClient;
  private db: Db | null = null;
  private readonly uri: string;
  private readonly dbName: string;

  constructor(uri: string, dbName: string = 'uranusdb') {
    this.uri = uri;
    this.dbName = dbName;
    this.client = new MongoDBClient(this.uri);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.close();
      console.log('MongoDB disconnected successfully');
    } catch (error) {
      console.error('MongoDB disconnection error:', error);
      throw error;
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  isConnected(): boolean {
    return this.db !== null;
  }
}
