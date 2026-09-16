import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { autenticar } from '../middlewares/auth.middleware';

const router = Router();

router.p