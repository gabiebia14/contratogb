
import { useState, useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, 
  SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { 
  Layout, 
  Home, 
  DollarSign, 
  Building2, 
  MapPin, 
  MessageSquare, 
  Menu as MenuIcon,
  FileText,
  Plus,
  FolderOpen,
  MessageCircle,
  Book,
  Settings
} from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  dashboardType: 'juridico' | 'proprietario';
}

const menuItems = {
  juridico: [
    { path: '/juridico', icon: Layout, label: 'Dashboard' },
    { path: '/juridico/contracts', icon: FileText, label: 'Contratos' },
    { path: '/juridico/gerar-contrato', icon: Plus, label: 'Novo Contrato' },
    { path: '/juridico/templates', icon: FolderOpen, label: 'Modelos de Contratos' },
    { path: '/juridico/ai', icon: MessageCircle, label: 'IA' },
    { path: '/juridico/documentos', icon: FileText, label: 'Documentos' },
    { path: '/juridico/library', icon: Book, label: 'Biblioteca' },
    { path: '/juridico/settings', icon: Settings, label: 'Configurações' },
  ],
  proprietario: [
    { path: '/proprietario', icon: Home, label: 'Dashboard' },
    { path: '/proprietario/imoveis', icon: Building2, label: 'Imóveis' },
    { path: '/proprietario/renda', icon: DollarSign, label: 'Renda' },
    { path: '/proprietario/mapa', icon: MapPin, label: 'Mapa' },
    { path: '/proprietario/chat', icon: MessageSquare, label: 'Chat' },
  ],
};

export default function DashboardLayout({ dashboardType }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const currentMenuItems = menuItems[dashboardType];
  const dashboardTitle = dashboardType === 'juridico' ? 'ContractPro' : 'PropertyPro';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop e Mobile para área jurídica */}
      <SidebarProvider defaultOpen={true}>
        <div className={cn(
          "w-[280px] fixed left-0 top-0 bottom-0 bg-background border-r z-30",
          dashboardType === 'juridico' ? 'block' : 'hidden lg:block'
        )}>
          <Sidebar collapsible="none" className="border-none h-full">
            <SidebarHeader className="p-4">
              <Link to={`/${dashboardType}`} className="text-2xl font-bold flex items-center gap-2">
                <span className="text-cyan-400">▲</span> {dashboardTitle}
              </Link>
            </SidebarHeader>
            <SidebarContent className="flex flex-col h-[calc(100vh-80px)]">
              <SidebarGroup className="flex-1">
                <SidebarGroupContent>
                  <SidebarMenu>
                    {currentMenuItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.path}
                        >
                          <Link to={item.path}>
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupContent>
                  <div className="bg-indigo-800 rounded-lg p-4 mx-2 mb-4">
                    <h3 className="font-medium mb-2 text-white">Tutorial</h3>
                    <p className="text-sm text-gray-300 mb-4">
                      {dashboardType === 'juridico' 
                        ? 'Aprenda a gerenciar contratos'
                        : 'Aprenda a gerenciar imóveis'}
                    </p>
                    <Button 
                      className="w-full bg-cyan-400 hover:bg-cyan-500" 
                      onClick={() => navigate(`/${dashboardType}/tutorial`)}
                    >
                      Começar
                    </Button>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </div>

        {/* Conteúdo Principal */}
        <div className={cn(
          "flex-1",
          dashboardType === 'juridico' ? 'ml-[280px]' : 'lg:ml-[280px]'
        )}>
          <main className="min-h-screen pb-20 lg:pb-0">
            <div className="p-4 md:p-8">
              <div className="flex justify-end items-center mb-4 md:mb-8">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg" alt="Foto do perfil" />
                    <AvatarFallback>US</AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    Sair
                  </Button>
                </div>
              </div>
              <div className="w-full max-w-full mx-auto overflow-x-hidden">
                <Outlet />
              </div>
            </div>
          </main>

          {/* Menu inferior mobile - apenas para área do proprietário */}
          {dashboardType === 'proprietario' && (
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden">
              <div className="flex justify-around items-center h-16">
                {currentMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex flex-col items-center justify-center flex-1 py-1 text-xs",
                        isActive 
                          ? "text-cyan-500" 
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          )}
        </div>
      </SidebarProvider>
    </div>
  );
}
