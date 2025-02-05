import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import ContractsPage from '@/components/ContractsPage';
import ContractTemplates from '@/pages/ContractTemplates';
import NewContract from '@/pages/NewContract';
import Documents from '@/pages/Documents';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<DashboardLayout />}>
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="templates" element={<ContractTemplates />} />
            <Route path="new-contract" element={<NewContract />} />
            <Route path="documentos" element={<Documents />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;