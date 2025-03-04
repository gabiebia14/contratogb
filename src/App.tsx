
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import ContractsPage from '@/components/ContractsPage';
import ContractViewer from '@/pages/ContractViewer';
import ContractTemplates from '@/pages/ContractTemplates';
import Dashboard from '@/pages/Index';
import Landing from '@/pages/Landing';
import DashboardSelection from '@/pages/DashboardSelection';
import Library from '@/pages/Library';

// Import Juridico pages
import AI from '@/features/juridico/pages/AI';
import AIChat from '@/features/juridico/pages/AIChat';
import Documents from '@/features/juridico/pages/Documents';
import GenerateContract from '@/features/juridico/pages/GenerateContract';
import AnalisarContrato from '@/features/juridico/pages/AnalisarContrato';
import CompararContratos from '@/features/juridico/pages/CompararContratos';
import YouTubeConverter from '@/features/juridico/pages/YouTubeConverter';
import Protestos from '@/features/juridico/pages/Protestos';
import JuridicoImoveis from '@/features/juridico/pages/Imoveis';

// Import Proprietário pages
import PropDashboard from '@/features/proprietario/pages/Dashboard';
import Imoveis from '@/features/proprietario/pages/Imoveis';
import Renda from '@/features/proprietario/pages/Renda';
import Mapa from '@/features/proprietario/pages/Mapa';
import Chat from '@/features/proprietario/pages/Chat';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard-selection" element={<DashboardSelection />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Juridical Dashboard */}
          <Route path="/juridico" element={<DashboardLayout dashboardType="juridico" />}>
            <Route index element={<Dashboard />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="contracts/:id" element={<ContractViewer />} />
            <Route path="templates" element={<ContractTemplates />} />
            <Route path="gerar-contrato" element={<GenerateContract />} />
            <Route path="documentos" element={<Documents />} />
            <Route path="imoveis" element={<JuridicoImoveis />} />
            <Route path="ai" element={<AI />} />
            <Route path="ai/chat" element={<AIChat />} />
            <Route path="ai/analisar" element={<AnalisarContrato />} />
            <Route path="ai/comparar" element={<CompararContratos />} />
            <Route path="ai/youtube" element={<YouTubeConverter />} />
            <Route path="ai/protestos" element={<Protestos />} />
            <Route path="library" element={<Library />} />
          </Route>

          {/* Proprietário Dashboard */}
          <Route path="/proprietario" element={<DashboardLayout dashboardType="proprietario" />}>
            <Route index element={<PropDashboard />} />
            <Route path="imoveis" element={<Imoveis />} />
            <Route path="renda" element={<Renda />} />
            <Route path="mapa" element={<Mapa />} />
            <Route path="chat" element={<Chat />} />
          </Route>
          
          {/* Admin Dashboard */}
          <Route path="/admin" element={<Navigate to="/em-construcao" />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
