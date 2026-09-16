import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import clienteRoutes from './routes/cliente.routes';
import equipamentoRoutes from './routes/equipamento.routes';
import ordemServicoRoutes from './routes/ordemServico.routes';
import dashboardRoutes from './routes/dashboard.routes';
import usuarioRoutes from './routes/usuario.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'API do Sistema de OS rodando 🚀' });
});

app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/equipamentos', equipamentoRoutes);
app.use('/api/ordens-servico', ordemServicoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/usuarios', usuarioRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});