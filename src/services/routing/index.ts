import { Router, Request, Response } from "express";
import login_singup_routing from "./login_routing";

const router: Router = Router();

router.use('/', login_singup_routing);

router.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: 'Endpoinb not Found',
        path: req.originalUrl
    });
});

export default router;