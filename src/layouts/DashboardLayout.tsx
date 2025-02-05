
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar"
import { FileText, Upload, Settings, Bell, ScanLine, BookOpen, ClipboardList, Search, MessageSquare, BarChart2, Newspaper } from 'lucide-react'
import { Link, Outlet } from "react-router-dom"

export default function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="sidebar" collapsible="icon" className="bg-[#4B1EB1]">
          <SidebarHeader className="p-4">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
              <span className="text-cyan-400">▲</span> ContractPro
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-gray-300 hover:text-white hover:bg-[#5d30c7]">
                      <Link to="/">
                        <FileText className="w-4 h-4" />
                        <span>Contratos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-gray-300 hover:text-white hover:bg-[#5d30c7]">
                      <Link to="/novo-contrato">
                        <Upload className="w-4 h-4" />
                        <span>Novo Contrato</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-gray-300 hover:text-white hover:bg-[#5d30c7]">
                      <Link to="/modelos-contratos">
                        <BookOpen className="w-4 h-4" />
                        <span>Modelos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-gray-300 hover:text-white hover:bg-[#5d30c7]">
                      <Link to="/ocr-documentos">
                        <ScanLine className="w-4 h-4" />
                        <span>OCR Docs</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-gray-300 hover:text-white hover:bg-[#5d30c7]">
                      <Link to="/gestao-contratos">
                        <ClipboardList className="w-4 h-4" />
                        <span>Gestão</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-gray-300 hover:text-white hover:bg-[#5d30c7]">
                      <Link to="/search">
                        <Search className="w-4 h-4" />
                        <span>Buscar</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-gray-300 hover:text-white hover:bg-[#5d30c7]">
                      <Link to="/messages">
                        <MessageSquare className="w-4 h-4" />
                        <span>Mensagens</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-gray-300 hover:text-white hover:bg-[#5d30c7]">
                      <Link to="/statistics">
                        <BarChart2 className="w-4 h-4" />
                        <span>Estatísticas</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-gray-300 hover:text-white hover:bg-[#5d30c7]">
                      <Link to="/news">
                        <Newspaper className="w-4 h-4" />
                        <span>Notícias</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 bg-[#F8F9FD]">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar algo aqui..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 w-[300px] focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              <div className="flex items-center gap-4">
                <Bell className="text-gray-400 cursor-pointer hover:text-gray-600" />
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
