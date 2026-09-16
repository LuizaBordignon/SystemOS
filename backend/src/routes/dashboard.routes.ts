import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { autenticar } from '../middlewares/auth.middleware';

const router = Router();

router.use(autenticar);

router.get('/', dashboardController.resumo);

export default router;
