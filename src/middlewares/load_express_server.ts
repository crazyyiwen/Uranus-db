import express, {Application} from 'express';
import enableCORS from './enable_cors';
import routes from '../routing/index';

export function loadExpressServer(): Application {
    const app: Application = express();

    // Body parser middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // CORS middleware
    app.use(enableCORS());

    // Routes
    app.use('/', routes);

    return app;
}