
import { useState, useEffect } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, 
  SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Layout, Menu as MenuIcon, FileText, Plus, Settings, FolderOpen, MessageSquare, Book } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';

export default function DashboardLayout() {
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

  const menuItems = [
    { path: '/juridico', icon: Layout, label: 'Dashboard' },
    { path: '/juridico/contracts', icon: FileText, label: 'Contratos' },
    { path: '/juridico/new-contract', icon: Plus, label: 'Novo Contrato' },
    { path: '/juridico/templates', icon: FolderOpen, label: 'Modelos de Contratos' },
    { path: '/juridico/ai', icon: MessageSquare, label: 'IA' },
    { path: '/juridico/documentos', icon: FileText, label: 'Documentos' },
    { path: '/juridico/library', icon: Book, label: 'Biblioteca' },
    { path: '/juridico/settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex-1 min-w-0 overflow-auto">
        <Button 
          variant="outline"
          className="fixed top-4 left-4 z-[60] lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          size="icon"
        >
          <MenuIcon className="h-4 w-4" />
        </Button>

        <div className={`sidebar-container ${isMobileMenuOpen ? 'open' : ''}`}>
          <Sidebar className="flex border-r bg-background h-full" variant="sidebar">
            <SidebarHeader className="p-4">
              <Link to="/juridico" className="text-2xl font-bold flex items-center gap-2">
                <span className="text-cyan-400">▲</span> ContractPro
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
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
              <SidebarGroup className="mt-auto">
                <SidebarGroupContent>
                  <div className="bg-indigo-800 rounded-lg p-4 mx-2 mb-4">
                    <h3 className="font-medium mb-2 text-white">Tutorial</h3>
                    <p className="text-sm text-gray-300 mb-4">Aprenda a gerenciar contratos</p>
                    <Button 
                      className="w-full bg-cyan-400 hover:bg-cyan-500" 
                      onClick={() => navigate('/juridico/tutorial')}
                    >
                      Começar
                    </Button>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </div>

        <main className="main-content bg-gray-50">
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
            <div className="w-full max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
