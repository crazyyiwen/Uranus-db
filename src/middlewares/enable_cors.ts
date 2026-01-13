import cors, {CorsOptions} from 'cors';
import { RequestHandler } from 'express';

const corsOptions: CorsOptions = {
    origin:  function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
        if(!origin){
            return callback(null, true);
        }
        const allowed_origins = env.cors_origin.split(',');
        if(allowed_origins.includes('*') || allowed_origins.includes(origin)){
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-with']
};

export default function enableCORS(): RequestHandler {
    return cors(corsOptions);
}