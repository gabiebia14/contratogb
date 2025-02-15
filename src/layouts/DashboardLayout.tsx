
import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, 
  SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Bell, Menu, MessageSquare, FileText, Plus, Settings, FolderOpen } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userImage, setUserImage] = useState<string | null>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex-1 min-w-0 overflow-auto">
        <Button 
          variant="outline"
          className="fixed top-4 left-4 z-[60] lg:hidden"
          onClick={toggleMobileMenu}
          size="icon"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className={`sidebar-container ${isMobileMenuOpen ? 'open' : ''}`}>
          <Sidebar className="flex border-r bg-background h-full" variant="sidebar">
            <SidebarHeader className="p-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-cyan-400">▲</span> ContractPro
              </h1>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/juridico'}>
                        <Link to="/juridico">
                          <Menu className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/juridico/contracts'}>
                        <Link to="/juridico/contracts">
                          <FileText className="w-4 h-4" />
                          <span>Contratos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/juridico/new-contract'}>
                        <Link to="/juridico/new-contract">
                          <Plus className="w-4 h-4" />
                          <span>Novo Contrato</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/juridico/templates'}>
                        <Link to="/juridico/templates">
                          <FolderOpen className="w-4 h-4" />
                          <span>Modelos de Contratos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/juridico/ai'}>
                        <Link to="/juridico/ai">
                          <MessageSquare className="w-4 h-4" />
                          <span>IA</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/juridico/documentos'}>
                        <Link to="/juridico/documentos">
                          <FileText className="w-4 h-4" />
                          <span>Documentos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/juridico/settings'}>
                        <Link to="/juridico/settings">
                          <Settings className="w-4 h-4" />
                          <span>Configurações</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup className="mt-auto">
                <SidebarGroupContent>
                  <div className="bg-indigo-800 rounded-lg p-4 mx-2 mb-4">
                    <h3 className="font-medium mb-2 text-white">Tutorial</h3>
                    <p className="text-sm text-gray-300 mb-4">Aprenda a gerenciar contratos</p>
                    <Button className="w-full bg-cyan-400 hover:bg-cyan-500" onClick={() => navigate('/juridico/tutorial')}>
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
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-gray-500" />
                </Button>
                <Avatar>
                  <AvatarImage 
                    src={userImage || "/placeholder.svg"}
                    alt="Foto do perfil"
                  />
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
