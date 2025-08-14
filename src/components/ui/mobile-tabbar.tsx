import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Images, Package, Phone, MessageCircle } from "lucide-react";
import { useState } from "react";
import { AssistantChat } from "./assistant-chat";

type TabItem = {
  to: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  isActive: (path: string) => boolean;
};

export const MobileTabBar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname + location.hash;
  const [chatOpen, setChatOpen] = useState(false);

  // Hide on admin pages
  if (path.startsWith("/admin")) return null;

  const tabs: TabItem[] = [
    { to: "/", label: "Home", Icon: Home, isActive: (p) => p === "/" || p.startsWith("/#") },
    { to: "/portfolio", label: "Portfolio", Icon: Images, isActive: (p) => p.startsWith("/portfolio") },
    { to: "/packages", label: "Packages", Icon: Package, isActive: (p) => p.startsWith("/packages") },
    { to: "/contact", label: "Contact", Icon: Phone, isActive: (p) => p.startsWith("/contact") },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="pointer-events-none h-[68px]" />
      <div
        className="pointer-events-auto mx-auto max-w-7xl"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="mx-3 mb-3 rounded-2xl border border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg">
          <ul className="grid grid-cols-5">
            {tabs.map(({ to, label, Icon, isActive }) => {
              const active = isActive(location.pathname);
              return (
                <li key={to} className="">
                  <Link
                    to={to}
                    className={`flex flex-col items-center justify-center py-2 gap-1 text-xs ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className={`h-5 w-5 ${active ? "" : "opacity-80"}`} />
                    <span className="leading-none">{label}</span>
                  </Link>
                </li>
              );
            })}
            {/* Chat tab (button) */}
            <li>
              <button
                type="button"
                className={`w-full flex flex-col items-center justify-center py-2 gap-1 text-xs ${chatOpen ? "text-foreground" : "text-muted-foreground"}`}
                onClick={() => setChatOpen((v) => !v)}
                aria-pressed={chatOpen}
                aria-label="Open assistant chat"
              >
                <MessageCircle className={`h-5 w-5 ${chatOpen ? "" : "opacity-80"}`} />
                <span className="leading-none">Chat</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
      {/* Embedded assistant panel for mobile */}
      <AssistantChat floating={false} open={chatOpen} onOpenChange={setChatOpen} />
    </nav>
  );
};

export default MobileTabBar;


