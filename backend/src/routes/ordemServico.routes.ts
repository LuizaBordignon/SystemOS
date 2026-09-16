import { Router } from 'express';
import { ordemServicoController } from '../controllers/ordemServico.controller';
import { autenticar } from '../middlewares/auth.middleware';

const router = Router();

router.use(autenticar);

// ADMIN e TECNICO compartilham o fluxo operacional da OS (abrir, diagnosticar,
// registrar serviço/valores e mudar status). Só a gestão de usuários é
// exclusiva do ADMIN, então não há restrição extra por tipo aqui.
router.get('/', ordemServicoController.listar);
router.get('/:id', ordemServicoController.buscarPorId);
router.post('/', ordemServicoController.criar);
router.put('/:id', ordemServicoController.atualizar);
router.patch('/:id/status', ordemServicoController.alterarStatus);

export default router;
