import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConvexProvider, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { convex } from "@/lib/convexClient";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PortfolioPage } from "./pages/portfolio-page";
import { ContactPage } from "./pages/contact-pages";
import { PackagesPage } from "./pages/packages-page";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";

const queryClient = new QueryClient();

const Tracking = () => {
  const track = useMutation(api.analytics.track);
  // Track initial load and hash changes
  // eslint-disable-next-line react-hooks/rules-of-hooks
  React.useEffect(() => {
    const send = () => {
      try {
        track({
          type: "pageview",
          path: window.location.pathname + window.location.hash,
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined,
        });
      } catch {}
    };
    send();
    const onHash = () => send();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [track]);
  return null;
};

const App = () => (
  <ConvexProvider client={convex}>
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
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ConvexProvider>
);

export default App;
