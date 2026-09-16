import { Router } from 'express';
import { clienteController } from '../controllers/cliente.controller';
import { autenticar } from '../middlewares/auth.middleware';
import { autorizar } from '../middlewares/autorizacao.middleware';
import { TipoUsuario } from '../generated/prisma/enums';

const router = Router();

router.use(autenticar);

// Consulta liberada pra ADMIN e TECNICO (técnico precisa consultar cliente ao abrir OS)
router.get('/', clienteController.listar);
router.get('/:id', clienteController.buscarPorId);

// Gestão de clientes é exclusiva do ADMIN
router.post('/', autorizar(TipoUsuario.ADMIN), clienteController.criar);
router.put('/:id', autorizar(TipoUsuario.ADMIN), clienteController.atualizar);
router.delete('/:id', autorizar(TipoUsuario.ADMIN), clienteController.excluir);

export default router;
