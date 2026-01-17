import {Router} from 'express';
import { agent_create } from '../controller/agents_creation_api';


const router = Router();

router.post('/create_agent', agent_create);

export default router;