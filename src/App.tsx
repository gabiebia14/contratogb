
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
    path: "*",
    element: <NotFound />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
