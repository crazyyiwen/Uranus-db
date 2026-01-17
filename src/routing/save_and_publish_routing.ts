import {Router} from 'express';
import { publish, save } from '../controller/save_and_publish_api_controller';


const router = Router();

router.post('/save', save);

router.post('/publish', publish);

export default router;