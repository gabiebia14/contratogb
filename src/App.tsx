import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { useAuth } from "./hooks/useAuth";
import DashboardLayout from "./layouts/DashboardLayout";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NewContract from "./pages/NewContract";
import NotFound from "./pages/NotFound";
import OCRPage from "./components/OCRPage";
import ContractTemplates from "./pages/ContractTemplates";
import ContractManagement from "./pages/ContractManagement";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FirebaseProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }>
              <Route path="/" element={<Index />} />
              <Route path="/novo-contrato" element={<NewContract />} />
              <Route path="/ocr-documentos" element={<OCRPage />} />
              <Route path="/modelos-contratos" element={<ContractTemplates />} />
              <Route path="/gestao-contratos" element={<ContractManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </FirebaseProvider>
  </QueryClientProvider>
);

export default App;