import { useMemo } from "react";
import { Home, Plus, User, Leaf, Sparkles } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { getRandomTip } from "@/lib/plant-tips";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const navItems = [
  { title: "My Plants", url: "/", icon: Home },
  { title: "Add Plant", url: "/add-plant", icon: Plus },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const location = useLocation();
  const plantTip = useMemo(() => getRandomTip(), []);
  
  return (
    <Sidebar className="hidden md:flex border-r border-sidebar-border">
      {/* Logo Header */}
      <SidebarHeader className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shadow-sage">
              <Leaf className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-sidebar-foreground">PlantBestie</h1>
              <p className="text-xs text-muted-foreground font-handwritten">your sassy plant companion ✨</p>
            </div>
          </div>
          <NotificationBell variant="sidebar" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                          isActive && "bg-primary text-primary-foreground shadow-warm hover:bg-primary hover:text-primary-foreground"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                        {item.url === "/add-plant" && (
                          <Sparkles className="w-3 h-3 ml-auto opacity-60" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with plant tip */}
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="gradient-sage rounded-xl p-4">
          <p className="font-handwritten text-lg text-secondary">💡 Plant Tip</p>
          <p className="text-xs text-muted-foreground mt-1">
            {plantTip}
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
