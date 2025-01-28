import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import NewContract from "./pages/NewContract";
import NotFound from "./pages/NotFound";
import { ResizablePanelGroup, ResizablePanel } from "./components/ui/resizable";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={50} minSize={30}>
                <Index />
              </ResizablePanel>
              <ResizablePanel defaultSize={50} minSize={30}>
                <Routes>
                  <Route path="/" element={null} />
                  <Route path="/novo-contrato" element={<NewContract />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;