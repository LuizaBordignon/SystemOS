import { Request, Response } from 'express';
import { usuarioService } from '../services/usuario.service';
import { ErroAplicacao } from '../utils/erro-aplicacao';

function tratarErro(erro: unknown, res: Response) {
  if (erro instanceof ErroAplicacao) {
    return res.status(erro.statusCode).json({ erro: erro.message });
  }

  console.error(erro);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
}

export const usuarioController = {
  async criar(req: Request, res: Response) {
    try {
      const usuario = await usuarioService.criar(req.body);
      return res.status(201).json(usuario);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async listarAtivos(_req: Request, res: Response) {
    try {
      const usuarios = await usuarioService.listarAtivos();
      return res.status(200).json(usuarios);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async listar(_req: Request, res: Response) {
    try {
      const usuarios = await usuarioService.listar();
      return res.status(200).json(usuarios);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async buscarPorId(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const usuario = await usuarioService.buscarPorId(id);
      return res.status(200).json(usuario);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const usuario = await usuarioService.atualizar(id, req.body);
      return res.status(200).json(usuario);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async excluir(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await usuarioService.excluir(id, req.usuario!.id);
      return res.status(204).send();
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },

  async reativar(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const usuario = await usuarioService.reativar(id);
      return res.status(200).json(usuario);
    } catch (erro) {
      return tratarErro(erro, res);
    }
  },
};
