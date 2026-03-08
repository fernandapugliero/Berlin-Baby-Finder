import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ActivityDetail from "./pages/ActivityDetail";
import Admin from "./pages/Admin";
import EventEinreichen from "./pages/EventEinreichen";
import KindercafeEinreichen from "./pages/KindercafeEinreichen";
import UeberRausi from "./pages/UeberRausi";
import Kontakt from "./pages/Kontakt";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import LogoPreview from "./pages/LogoPreview";
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
          <Route path="/activity/:id" element={<ActivityDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/event-einreichen" element={<EventEinreichen />} />
          <Route path="/kindercafe-einreichen" element={<KindercafeEinreichen />} />
          <Route path="/ueber" element={<UeberRausi />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
