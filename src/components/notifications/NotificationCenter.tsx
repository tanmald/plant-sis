import { Bell, CheckCheck, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationCard } from "./NotificationCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface NotificationCenterProps {
  trigger: React.ReactNode;
}

export function NotificationCenter({ trigger }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useNotifications();

  // Group notifications by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayNotifications = notifications.filter((n) => {
    const notifDate = new Date(n.timestamp);
    notifDate.setHours(0, 0, 0, 0);
    return notifDate.getTime() === today.getTime();
  });

  const earlierNotifications = notifications.filter((n) => {
    const notifDate = new Date(n.timestamp);
    notifDate.setHours(0, 0, 0, 0);
    return notifDate.getTime() < today.getTime();
  });

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({unreadCount} unread)
                </span>
              )}
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs gap-1.5"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Bell}
                title="All caught up!"
                description="No notifications right now. Your plants are happy!"
              />
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Today's notifications */}
              {todayNotifications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    Today
                  </h3>
                  <div className="space-y-2">
                    {todayNotifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onDismiss={dismissNotification}
                        onMarkAsRead={markAsRead}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Earlier notifications */}
              {earlierNotifications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    Earlier
                  </h3>
                  <div className="space-y-2">
                    {earlierNotifications.map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onDismiss={dismissNotification}
                        onMarkAsRead={markAsRead}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
