import {Request, Response} from 'express';
import app from '../app'
import { v4 as uuidv4 } from 'uuid';


export const agent_create = async (req: Request, res: Response): Promise<void> => {
    try {
        const payload = req.body;

        // Validate input
        if (!payload) {
            res.status(400).json({
                message: 'Bad Request',
                error: 'Payload is required'
            });
            return;
        }

        let client_db = app.get_db_client();
        let db = client_db.db('userinfo');
        let collection = db.collection('agents');

        // Check if user already exists
        const existing_agent = await collection.findOne({
            $or: [{ agent_name: payload.agent_name }, { agent_id: payload.agent_id }]
        });

        if (existing_agent) {
            res.status(409).json({
                message: 'Conflict',
                error: 'Agent already exists'
            });
            return;
        }

        const result = await collection.insertOne(payload);

        res.status(201).json({
            message: 'Agent created successfully',
            userId: result.insertedId
        });
    } catch (error: any) {
        console.error('Create agent error:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}