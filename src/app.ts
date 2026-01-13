import { Server } from 'http';
import { MongoClient} from 'mongodb';
import { Application as ExpressApplication } from 'express';
import { DBConnection } from './middlewares/db_connection';
import { loadExpressServer } from './middlewares/load_express_server';

class Application{
    private app: ExpressApplication | null;
    private db: DBConnection | null;
    private server: Server | null;
    constructor(_app: ExpressApplication, _db: DBConnection){
        this.app = _app;
        this.db = _db;
        this.server = null;
    }

    async start(): Promise<Server>{
        try{
            if(!this.db || !this.app){
                throw new Error('Application not properly initialized');
            }
            this.initialize();
            this.server = this.app.listen(process.env.PORT || 3000, () => {
                console.log(`Server is running on port ${process.env.PORT || 3000}`);
            });
            return this.server;
        }
        catch(error){
            throw error;
        }
    }

    async initialize(): Promise<void>{
        try{
            if(!this.db){
                throw new Error('Database connection not initialized');
            }
            await this.db.connect();
            console.log('Database connected successfully');
        }
        catch(error){
            throw error;
        }
    }

    get_db_client(): MongoClient{
        if(!this.db){
            throw new Error('Database connection not initialized');
        }
        return this.db.get_client();
    }

    async shut_down(): Promise<void>{
        try{
            if(this.server){
                this.server.close(() => {
                    console.log('Server closed');
                });
            }
            if(this.db){
                await this.db.disconnect();
                console.log('Database disconnected successfully');
            }
        }
        catch(error){
            throw error;
        }
    }
}

const express_app = loadExpressServer();
const db_connection = new DBConnection(env.mongo_uri);
const app = new Application(express_app,db_connection);
export default app;