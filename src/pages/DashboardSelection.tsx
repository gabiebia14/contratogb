
import { useNavigate } from "react-router-dom";
import { Building2, Scale, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCallback } from "react";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import type { Container, Engine } from "tsparticles-engine";

export default function DashboardSelection() {
  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log("Particles loaded", container);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4 relative">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          fullScreen: {
            enable: false
          },
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          particles: {
            color: {
              value: "#ffffff",
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.2,
              width: 1,
            },
            move: {
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.2,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
        className="absolute inset-0"
      />
      <div className="max-w-6xl w-full relative z-10">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          Selecione seu Painel de Acesso
        </h1>
        <div className="grid md:grid-cols-3 gap-6">
          {dashboards.map((dashboard) => (
            <Card
              key={dashboard.path}
              className="hover:shadow-lg transition-shadow cursor-pointer bg-white/95 backdrop-blur-sm border-[#0EA5E9]/10"
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
