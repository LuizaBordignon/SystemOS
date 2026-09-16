import { Router } from 'express';
import { equipamentoController } from '../controllers/equipamento.controller';
import { autenticar } from '../middlewares/auth.middleware';
import { autorizar } from '../middlewares/autorizacao.middleware';
import { TipoUsuario } from '../generated/prisma/enums';

const router = Router();

router.use(autenticar);

// Consulta liberada pra ADMIN e TECNICO (técnico precisa consultar o equipamento ao abrir OS)
router.get('/', equipamentoController.listar);
router.get('/:id', equipamentoController.buscarPorId);

// Gestão de equipamentos é exclusiva do ADMIN
router.post('/', autorizar(TipoUsuario.ADMIN), equipamentoController.criar);
router.put('/:id', autorizar(TipoUsuario.ADMIN), equipamentoController.atualizar);
router.delete('/:id', autorizar(TipoUsuario.ADMIN), equipamentoController.excluir);

export default router;
