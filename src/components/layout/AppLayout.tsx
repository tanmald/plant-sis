import { Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function AppLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          {/* Mobile header with notification bell */}
          <div className="md:hidden flex items-center justify-end p-4 pb-0">
            <NotificationBell variant="mobile" />
          </div>

          {/* Page content */}
          <div className="flex-1 p-4 pb-24 md:p-6 md:pb-8 lg:p-8 overflow-auto">
            <div key={location.pathname} className="animate-fade-slide-up">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
