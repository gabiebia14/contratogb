
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Building2, Scale, Users } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Gestão Imobiliária Simplificada
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Sua solução completa para administração de imóveis, documentos e contratos em um só lugar.
          </p>
          <Button
            size="lg"
            className="text-lg px-8"
            onClick={() => navigate("/auth")}
          >
            Entrar na Plataforma
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestão de Imóveis</h3>
              <p className="text-gray-600">
                Administre sua carteira de imóveis com eficiência e organização.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Suporte Jurídico</h3>
              <p className="text-gray-600">
                Contratos e documentação legal sempre em dia e seguros.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Relacionamento</h3>
              <p className="text-gray-600">
                Gestão eficiente da relação entre proprietários e inquilinos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
