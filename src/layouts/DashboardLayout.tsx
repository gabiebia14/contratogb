import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar"
import { FileText, Upload, Settings, Bell, ScanLine, BookOpen, ClipboardList, Search, Menu } from 'lucide-react'
import { Link, Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-gray-200">
          <SidebarHeader className="p-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-indigo-500">▲</span> ContractPro
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/" className="flex items-center gap-3">
                        <FileText className="w-5 h-5" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/novo-contrato" className="flex items-center gap-3">
                        <Upload className="w-5 h-5" />
                        <span>Novo Contrato</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/modelos-contratos" className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5" />
                        <span>Modelos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/ocr-documentos" className="flex items-center gap-3">
                        <ScanLine className="w-5 h-5" />
                        <span>OCR Documentos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/gestao-contratos" className="flex items-center gap-3">
                        <ClipboardList className="w-5 h-5" />
                        <span>Gestão</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1">
          <header className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4 flex-1">
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    placeholder="Pesquisar..." 
                    className="pl-10 bg-gray-50 border-gray-200 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5 text-gray-600" />
                </Button>
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full ring-2 ring-white"
                />
              </div>
            </div>
          </header>
          
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}