
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CarbonPath from "./pages/CarbonPath";
import CarbonTax from "./pages/CarbonTax";
import CarbonCredits from "./pages/CarbonCredits";
import TCFDSimulator from "./pages/TCFDSimulator";
import Chatbot from "./pages/Chatbot";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/carbon-path" element={<CarbonPath />} />
          <Route path="/carbon-tax" element={<CarbonTax />} />
          <Route path="/carbon-credits" element={<CarbonCredits />} />
          <Route path="/tcfd-simulator" element={<TCFDSimulator />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
