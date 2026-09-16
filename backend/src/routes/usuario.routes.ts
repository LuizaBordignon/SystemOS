import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller';
import { autenticar } from '../middlewares/auth.middleware';
import { autorizar } from '../middlewares/autorizacao.middleware';
import { TipoUsuario } from '../generated/prisma/enums';

const router = Router();

// Lista enxuta liberada pra qualquer usuário autenticado — usada pelo
// formulário de abertura de OS pra escolher o técnico responsável.
router.get('/ativos', autenticar, usuarioController.listarAtivos);

// Gestão de usuários é exclusiva do ADMIN (regra de negócio: técnico não
// pode gerenciar usuários).
router.use(autenticar, autorizar(TipoUsuario.ADMIN));

router.get('/', usuarioController.listar);
router.get('/:id', usuarioController.buscarPorId);
router.post('/', usuarioController.criar);
router.put('/:id', usuarioController.atualizar);
router.delete('/:id', usuarioController.excluir);
router.patch('/:id/reativar', usuarioController.reativar);

export default router;
