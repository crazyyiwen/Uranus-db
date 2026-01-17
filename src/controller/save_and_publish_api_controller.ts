import {Request, Response} from 'express';
import app from '../app'
import { v4 as uuidv4 } from 'uuid';


export const save = async (req: Request, res: Response): Promise<void> => {
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
        let collection = db.collection('draft');

        // Check if agent already exists
        const existing_agent = await collection.findOne({
            $or: [{ agent_id: payload.agent_id }, { save_id: payload.save_id }]
        });

        if (existing_agent) {
            const result = await collection.updateOne({ agent_id: payload.agent_id, save_id: payload.save_id }, { $set: payload });
            res.status(200).json({
                message: 'Draft created successfully',
                acknowledged: result.acknowledged
            });
        }
        else{
            const result = await collection.insertOne(payload);
            res.status(200).json({
                message: 'Draft created successfully',
                saveId: result.insertedId
            });
        }
    } catch (error: any) {
        console.error('Create agent error:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

export const publish = async (req: Request, res: Response): Promise<void> => {
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
        let collection = db.collection('publish');

        
        // Check if user already exists
        const existing_agent = await collection.findOne({
            $or: [{ agent_id: payload.agent_id, publish_id: payload.publish_id }]
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
            message: 'Draft publish successfully',
            userId: result.insertedId
        });
    } catch (error: any) {
        console.error('Draft publish error:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}