import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PortfolioPage } from "./pages/portfolio-page";
import { ContactPage } from "./pages/contact-pages";
import { PackagesPage } from "./pages/packages-page";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import MobileTabBar from "@/components/ui/mobile-tabbar";
import { apiClient, api } from "@/lib/api";

const queryClient = new QueryClient();

const Tracking = () => {
  // Track initial load and hash changes with local backend
  React.useEffect(() => {
    const send = async () => {
      try {
        await apiClient.post(api.analytics.track, {
          type: "pageview",
          path: window.location.pathname + window.location.hash,
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined,
        });
      } catch (error) {
        // Silently fail if analytics can't be sent
        console.debug('Analytics tracking failed:', error);
      }
    };
    send();
    const onHash = () => send();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Tracking />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/packages" element={<PackagesPage />} /> 
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <MobileTabBar />
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
