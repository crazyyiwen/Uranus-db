import { MongoClient, Db } from "mongodb";

export class DBConnection {
  private readonly connectionString: string;
  private client: MongoClient;

  constructor(connectionString: string) {
    this.connectionString = connectionString;
    this.client = new MongoClient(this.connectionString);
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      // Only close if partially initialized
      await this.safe_close();
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    await this.safe_close();
  }

  private async safe_close(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }

  public get_client(): MongoClient {
    return this.client;
  }

  public get_db(dbName: string): Db {
    return this.client.db(dbName);
  }
}
