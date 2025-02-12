
import { useNavigate } from "react-router-dom";
import { Building2, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardSelection() {
  const navigate = useNavigate();

  const dashboards = [
    {
      title: "Painel Jurídico",
      description: "Gestão de contratos e documentos legais",
      icon: Scale,
      path: "/",
    },
    {
      title: "Painel do Proprietário",
      description: "Gestão de imóveis e inquilinos",
      icon: Building2,
      path: "/proprietario",
    },
    {
      title: "Painel de Administração",
      description: "Gestão administrativa e financeira",
      icon: ShieldCheck,
      path: "/admin",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8">
          Selecione seu Painel de Acesso
        </h1>
        <div className="grid md:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <Card
              key={dashboard.path}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(dashboard.path)}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <dashboard.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle>{dashboard.title}</CardTitle>
                <CardDescription>{dashboard.description}</CardDescription>
                <Button className="mt-4 w-full" onClick={() => navigate(dashboard.path)}>
                  Acessar
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
