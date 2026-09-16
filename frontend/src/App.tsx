import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import { TemaProvider } from '@/lib/tema';
import { RotaProtegida } from '@/components/layout/RotaProtegida';
import { AppLayout } from '@/components/layout/AppLayout';
import { TipoUsuario } from '@/types/api';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { ClientesPage } from '@/pages/clientes/ClientesPage';
import { ClienteDetalhe } from '@/pages/clientes/ClienteDetalhe';
import { EquipamentosPage } from '@/pages/equipamentos/EquipamentosPage';
import { OrdensServicoPage } from '@/pages/ordensServico/OrdensServicoPage';
import { OrdemServicoNova } from '@/pages/ordensServico/OrdemServicoNova';
import { OrdemServicoDetalhe } from '@/pages/ordensServico/OrdemServicoDetalhe';
import { UsuariosPage } from '@/pages/usuarios/UsuariosPage';

function App() {
  return (
    <BrowserRouter>
      <TemaProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <RotaProtegida>
                  <AppLayout />
                </RotaProtegida>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/clientes/:id" element={<ClienteDetalhe />} />
              <Route path="/equipamentos" element={<EquipamentosPage />} />
              <Route path="/ordens-servico" element={<OrdensServicoPage />} />
              <Route path="/ordens-servico/nova" element={<OrdemServicoNova />} />
              <Route path="/ordens-servico/:id" element={<OrdemServicoDetalhe />} />
              <Route
                path="/usuarios"
                element={
                  <RotaProtegida tiposPermitidos={[TipoUsuario.ADMIN]}>
                    <UsuariosPage />
                  </RotaProtegida>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </TemaProvider>
    </BrowserRouter>
  );
}

export default App;
