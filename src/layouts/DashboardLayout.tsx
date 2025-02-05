import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar"
import { FileText, Upload, Settings, Bell, ScanLine, BookOpen, ClipboardList, Search, MessageSquare, BarChart2, Newspaper, Menu } from 'lucide-react'
import { Link, Outlet } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function DashboardLayout() {
  const isMobile = useIsMobile()

  const SidebarNavigation = () => (
    <>
      <SidebarHeader className="p-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <span className="text-[#F97316]">▲</span> ContractPro
        </h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-gray-100 hover:text-white hover:bg-[#33C3F0]">
                  <Link to="/">
                    <FileText className="w-4 h-4" />
                    <span>Contratos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-gray-100 hover:text-white hover:bg-[#33C3F0]">
                  <Link to="/novo-contrato">
                    <Upload className="w-4 h-4" />
                    <span>Novo Contrato</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-gray-100 hover:text-white hover:bg-[#33C3F0]">
                  <Link to="/modelos-contratos">
                    <BookOpen className="w-4 h-4" />
                    <span>Modelos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-gray-100 hover:text-white hover:bg-[#33C3F0]">
                  <Link to="/ocr-documentos">
                    <ScanLine className="w-4 h-4" />
                    <span>OCR Docs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-gray-100 hover:text-white hover:bg-[#33C3F0]">
                  <Link to="/gestao-contratos">
                    <ClipboardList className="w-4 h-4" />
                    <span>Gestão</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-gray-100 hover:text-white hover:bg-[#33C3F0]">
                  <Link to="/search">
                    <Search className="w-4 h-4" />
                    <span>Buscar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-gray-100 hover:text-white hover:bg-[#33C3F0]">
                  <Link to="/messages">
                    <MessageSquare className="w-4 h-4" />
                    <span>Mensagens</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-gray-100 hover:text-white hover:bg-[#33C3F0]">
                  <Link to="/statistics">
                    <BarChart2 className="w-4 h-4" />
                    <span>Estatísticas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-gray-100 hover:text-white hover:bg-[#33C3F0]">
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
    </>
  )

  return (
    <div className="flex min-h-screen w-full">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <button className="fixed top-4 left-4 z-50 p-2 bg-[#0EA5E9] rounded-lg text-white">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-[#0EA5E9]">
            <SidebarNavigation />
          </SheetContent>
        </Sheet>
      ) : (
        <SidebarProvider defaultOpen={true}>
          <Sidebar variant="sidebar" className="bg-[#0EA5E9] min-w-[280px]">
            <SidebarNavigation />
          </Sidebar>
        </SidebarProvider>
      )}

      <main className="flex-1 bg-[#F8F9FD]">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="relative w-full md:w-[300px]">
              <input
                type="text"
                placeholder="Buscar algo aqui..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]"
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
  )
}