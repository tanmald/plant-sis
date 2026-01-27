import { Outlet, useLocation, Link } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Leaf, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          {/* Mobile header */}
          <header className="h-14 flex items-center gap-3 px-4 border-b border-border bg-card md:hidden">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Leaf className="w-4 h-4 text-secondary-foreground" />
              </div>
              <span className="font-display font-semibold text-lg">PlantSis</span>
            </div>
          </header>

          {/* Page content */}
          <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            <div key={location.pathname} className="animate-fade-slide-up">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Floating Add Button - Only on Dashboard */}
        {location.pathname === "/" && (
          <Link to="/add-plant" className="fab">
            <Button
              size="lg"
              className="w-14 h-14 rounded-full shadow-warm-lg animate-bounce-gentle"
            >
              <Plus className="w-6 h-6" />
              <span className="sr-only">Add Plant</span>
            </Button>
          </Link>
        )}
      </div>
    </SidebarProvider>
  );
}
