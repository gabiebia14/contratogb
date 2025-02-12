
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
      path: "/auth",
    },
    {
      title: "Painel do Proprietário",
      description: "Gestão de imóveis e inquilinos",
      icon: Building2,
      path: "/auth",
    },
    {
      title: "Painel de Administração",
      description: "Gestão administrativa e financeira",
      icon: ShieldCheck,
      path: "/auth",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#0EA5E9]">
          Selecione seu Painel de Acesso
        </h1>
        <div className="grid md:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <Card
              key={dashboard.path}
              className="hover:shadow-lg transition-shadow cursor-pointer border-[#0EA5E9]/10"
              onClick={() => navigate(dashboard.path)}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-[#0EA5E9]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <dashboard.icon className="w-8 h-8 text-[#0EA5E9]" />
                </div>
                <CardTitle className="text-[#0EA5E9]">{dashboard.title}</CardTitle>
                <CardDescription>{dashboard.description}</CardDescription>
                <Button 
                  className="mt-4 w-full bg-[#F97316] hover:bg-[#F97316]/90" 
                  onClick={() => navigate(dashboard.path)}
                >
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
