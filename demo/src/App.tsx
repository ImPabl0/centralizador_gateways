import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PixPayment from "./pages/PixPayment";
import React, { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // Bloqueia o menu de contexto (clique direito) em todo o documento
  useEffect(() => {
    const handleContextmenu = (e: Event) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextmenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextmenu);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {/* Configuração do Sonner: expand=true para mostrar todos os toasts e gap=4 para reduzir o espaçamento */}
        <Sonner expand={true} gap={4} />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/pix-payment" element={<PixPayment />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
