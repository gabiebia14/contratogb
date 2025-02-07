
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar"
import { FileText, Upload, Settings, Bell, BookOpen, FileStack, Home } from 'lucide-react'
import { Link, Outlet, useLocation } from "react-router-dom"

export default function DashboardLayout() {
  const location = useLocation();
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar className="flex border-r bg-background" variant="sidebar">
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
                    <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                      <Link to="/">
                        <Home className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/contracts'}>
                      <Link to="/contracts">
                        <FileText className="w-4 h-4" />
                        <span>Contratos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/new-contract'}>
                      <Link to="/new-contract">
                        <Upload className="w-4 h-4" />
                        <span>Novo Contrato</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/templates'}>
                      <Link to="/templates">
                        <BookOpen className="w-4 h-4" />
                        <span>Modelos de Contratos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/documentos'}>
                      <Link to="/documentos">
                        <FileStack className="w-4 h-4" />
                        <span>Documentos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === '/settings'}>
                      <Link to="/settings">
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
                  <button className="bg-cyan-400 text-white px-4 py-2 rounded-lg text-sm w-full hover:bg-cyan-500 transition-colors">
                    Começar
                  </button>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-8">
            <div className="flex justify-end items-center mb-4 md:mb-8">
              <div className="flex items-center gap-4">
                <Bell className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </div>
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
