import { Router, Request, Response } from "express";
import login_singup_routing from "./login_routing";
import agents_creation_routing from "./agents_creation_routing";
import save_and_publish_routing from "./save_and_publish_routing";

const router: Router = Router();

router.use('/', login_singup_routing);
router.use('/', agents_creation_routing);
router.use('/', save_and_publish_routing);

router.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not Found',
        path: req.originalUrl
    });
});
export default router;