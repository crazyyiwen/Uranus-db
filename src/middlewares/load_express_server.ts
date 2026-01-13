import express, {Application} from 'express';

export function loadExpressServer(): Application {
    const app: Application = express();
    return app;
}