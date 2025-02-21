import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Play, Check, DollarSign, Mail, Facebook, Twitter, Linkedin, Github } from "lucide-react";
import { useCallback } from "react";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import type { Container, Engine } from "tsparticles-engine";

export default function Landing() {
  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log("Particles loaded", container);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <span className="text-xl font-semibold">DocHero</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Início</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Sobre</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Serviços</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Preços</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Contato</a>
            </nav>
            <Button
              variant="outline"
              className="hidden md:flex"
              onClick={() => navigate("/dashboard-selection")}
            >
              Entrar
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Particles */}
      <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center">
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
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: true,
                  mode: "repulse",
                },
                resize: true,
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
              },
            },
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
                direction: "none",
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
          className="absolute inset-0 z-10"
        />
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Construímos Soluções para<br />
              <span className="text-blue-300">Sua Gestão Imobiliária</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Sua solução completa para administração de imóveis, documentos e contratos em um só lugar. Simplifique sua gestão imobiliária hoje.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="text-lg px-8 bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => navigate("/dashboard-selection")}
              >
                Teste Grátis
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 text-white border-white hover:bg-white/10 group"
              >
                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center mr-3 group-hover:bg-white/10">
                  <Play className="w-5 h-5 text-white" />
                </div>
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recursos Poderosos para sua Gestão
            </h2>
            <p className="text-xl text-gray-600">
              Descubra como nossa plataforma pode transformar sua gestão imobiliária com ferramentas intuitivas e eficientes.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-blue-600/10 rounded-lg flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Planos para Todos os Tamanhos
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para suas necessidades e comece a otimizar sua gestão imobiliária hoje mesmo.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Plano Básico */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:border-blue-500 transition-colors">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2">Básico</h3>
                <div className="flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  <span className="text-4xl font-bold">49</span>
                  <span className="text-gray-600 ml-2">/mês</span>
                </div>
                <p className="text-gray-600">Para pequenos negócios</p>
              </div>
              <ul className="space-y-4 mb-8">
                {['Até 50 contratos', 'Gestão básica de documentos', '1 usuário', 'Suporte por email'].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-blue-600 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant="outline">Começar Agora</Button>
            </div>

            {/* Plano Profissional */}
            <div className="bg-blue-600 rounded-xl shadow-lg p-8 border-2 border-blue-500 transform scale-105">
              <div className="text-center mb-8">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm mb-4 inline-block">Popular</span>
                <h3 className="text-2xl font-semibold mb-2 text-white">Profissional</h3>
                <div className="flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                  <span className="text-4xl font-bold text-white">99</span>
                  <span className="text-blue-100 ml-2">/mês</span>
                </div>
                <p className="text-blue-100">Para empresas em crescimento</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Até 200 contratos',
                  'Gestão avançada de documentos',
                  'Até 5 usuários',
                  'Suporte prioritário',
                  'Automações básicas'
                ].map((feature) => (
                  <li key={feature} className="flex items-center text-white">
                    <Check className="w-5 h-5 text-blue-300 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">Começar Agora</Button>
            </div>

            {/* Plano Empresarial */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:border-blue-500 transition-colors">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2">Empresarial</h3>
                <div className="flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  <span className="text-4xl font-bold">199</span>
                  <span className="text-gray-600 ml-2">/mês</span>
                </div>
                <p className="text-gray-600">Para grandes empresas</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Contratos ilimitados',
                  'Gestão completa de documentos',
                  'Usuários ilimitados',
                  'Suporte 24/7',
                  'Automações avançadas',
                  'API access'
                ].map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="w-5 h-5 text-blue-600 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant="outline">Começar Agora</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Coluna 1 - Sobre */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <span className="text-xl font-semibold">DocHero</span>
              </div>
              <p className="text-gray-400 mb-6">
                Simplificando a gestão imobiliária com tecnologia e inovação.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Coluna 2 - Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Produto</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrações</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            {/* Coluna 3 - Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Empresa</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>

            {/* Coluna 4 - Newsletter */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Fique por dentro</h4>
              <p className="text-gray-400 mb-4">
                Assine nossa newsletter para receber as últimas novidades.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button size="icon" className="bg-blue-600 hover:bg-blue-700">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DocHero. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Gestão Documental",
    description: "Organize e gerencie todos os seus documentos e contratos em um único lugar, com segurança e facilidade de acesso.",
    icon: <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  },
  {
    title: "Automação de Processos",
    description: "Automatize tarefas repetitivas e aumente a eficiência da sua gestão com nossos fluxos de trabalho inteligentes.",
    icon: <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
  },
  {
    title: "Análise e Relatórios",
    description: "Tome decisões baseadas em dados com nossos relatórios detalhados e análises em tempo real da sua carteira.",
    icon: <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
  }
];
