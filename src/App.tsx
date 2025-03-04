
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import Landing from "@/pages/Landing";
import DashboardSelection from "@/pages/DashboardSelection";

// Páginas do Proprietário
import Dashboard from "@/features/proprietario/pages/Dashboard";
import Imoveis from "@/features/proprietario/pages/Imoveis";
import Renda from "@/features/proprietario/pages/Renda";
import Mapa from "@/features/proprietario/pages/Mapa";
import Chat from "@/features/proprietario/pages/Chat";

// Páginas do Jurídico
import JuridicoDashboard from "@/features/juridico/pages/Dashboard";
import Contracts from "@/features/juridico/pages/Contracts";
import ContractForm from "@/features/juridico/pages/ContractForm";
import ContractTemplates from "@/features/juridico/pages/ContractTemplates";
import JuridicoImoveis from "@/features/juridico/pages/Imoveis";
import AIChat from "@/features/juridico/pages/AIChat";
import Documents from "@/features/juridico/pages/Documents";
import Library from "@/features/juridico/pages/Library";
import Settings from "@/features/juridico/pages/Settings";
import Tutorial from "@/features/juridico/pages/Tutorial";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/dashboard",
    element: <DashboardSelection />,
  },
  {
    path: "/proprietario",
    element: <DashboardLayout dashboardType="proprietario" />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "imoveis",
        element: <Imoveis />,
      },
      {
        path: "renda",
        element: <Renda />,
      },
      {
        path: "mapa",
        element: <Mapa />,
      },
      {
        path: "chat",
        element: <Chat />,
      },
    ],
  },
  {
    path: "/juridico",
    element: <DashboardLayout dashboardType="juridico" />,
    children: [
      {
        path: "",
        element: <JuridicoDashboard />,
      },
      {
        path: "contracts",
        element: <Contracts />,
      },
      {
        path: "gerar-contrato",
        element: <ContractForm />,
      },
      {
        path: "templates",
        element: <ContractTemplates />,
      },
      {
        path: "imoveis",
        element: <JuridicoImoveis />,
      },
      {
        path: "ai",
        element: <AIChat />,
      },
      {
        path: "documentos",
        element: <Documents />,
      },
      {
        path: "library",
        element: <Library />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "tutorial",
        element: <Tutorial />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
