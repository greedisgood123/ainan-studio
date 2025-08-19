import { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./styled/app-sidebar";
import { AdminDashboard } from "./styled/admin-dashboard";
import { CleanupDashboard } from "./CleanupDashboard";
import { useAuth } from "@/lib/auth";
import { useBookingsAdmin, useUnavailableDates, useAddUnavailableDate, useRemoveUnavailableDate } from "@/hooks/useAdminApi";

const Dashboard = () => {
  const { isAuthenticated, logout } = useAuth();
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useBookingsAdmin();
  const { data: unavailable = [], refetch: refetchUnavailable } = useUnavailableDates();
  
  const { addDate: blockDate, loading: blockingLoading } = useAddUnavailableDate();
  const { removeDate: unblockDate, loading: unblockingLoading } = useRemoveUnavailableDate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.hash = "#/admin/login";
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-px bg-border" />
              <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            </div>
            <div className="ml-auto flex items-center gap-2 px-4">
              <button
                onClick={logout}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Logout
              </button>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Tabs defaultValue="cleanup" className="flex-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cleanup">Migration Status</TabsTrigger>
                <TabsTrigger value="admin">Full Admin</TabsTrigger>
              </TabsList>
              <TabsContent value="cleanup" className="flex-1">
                <CleanupDashboard adminToken="" />
              </TabsContent>
              <TabsContent value="admin" className="flex-1">
                <AdminDashboard
                  bookings={bookings}
                  unavailable={unavailable}
                  bookingsActions={{
                    onBlock: async (dateMs: number, reason?: string) => {
                      try {
                        await blockDate(dateMs, reason);
                        await refetchUnavailable();
                      } catch (error) {
                        console.error('Failed to block date:', error);
                      }
                    },
                    onUnblock: async (dateMs: number) => {
                      try {
                        await unblockDate(dateMs);
                        await refetchUnavailable();
                      } catch (error) {
                        console.error('Failed to unblock date:', error);
                      }
                    },
                    isLoading: bookingsLoading || blockingLoading || unblockingLoading
                  }}
                  onLogout={logout}
                />
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;


