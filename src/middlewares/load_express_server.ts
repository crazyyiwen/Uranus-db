import express, {Application} from 'express';
import enableCORS from './enable_cors';

export function loadExpressServer(): Application {
    const app: Application = express();
    app.use(enableCORS());
    return app;
}