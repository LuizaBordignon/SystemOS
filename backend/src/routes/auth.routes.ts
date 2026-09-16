import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { autenticar } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', authController.login);

// Rota protegida — só acessível com token válido
router.get('/me', autenticar, (req, res) => {
  res.json({ usuario: req.usuario });
});

export default router;