import {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import app from '../app'

export const login = async (req: Request, res: Response): Promise<void> => {
    // Placeholder for login logic
    try{
        let client_db = app.get_db_client();
        let db = client_db.db('userinfo');
        let collection = db.collection('login');

        const { user_login_details } = req.body;

        const user = await collection.findOne({ username: user_login_details.username, password: user_login_details.password });
        if(user){
            res.status(200).json({
                message: 'Login successful',
                user: user
            });
        }
        else{
            res.status(401).json({
                message: 'Invalid credentials'
            });
        }
    }
    catch(error: any){
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            res.status(400).json({
                message: 'Bad Request',
                error: 'Username, email, and password are required'
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                message: 'Bad Request',
                error: 'Invalid email format'
            });
            return;
        }

        // Validate password strength (minimum 6 characters)
        if (password.length < 6) {
            res.status(400).json({
                message: 'Bad Request',
                error: 'Password must be at least 6 characters long'
            });
            return;
        }

        let client_db = app.get_db_client();
        let db = client_db.db('userinfo');
        let collection = db.collection('login');

        // Check if user already exists
        const existingUser = await collection.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            res.status(409).json({
                message: 'Conflict',
                error: 'User with this email or username already exists'
            });
            return;
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = {
            username,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await collection.insertOne(newUser);

        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertedId
        });
    } catch (error: any) {
        console.error('Signup error:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message
        });
    }
}