import { AlertTriangle, Bell, Sparkles, Info, X } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Notification, NotificationType } from "@/contexts/NotificationContext";

interface NotificationCardProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}

const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; className: string }
> = {
  health_alert: {
    icon: AlertTriangle,
    className: "bg-destructive/10 text-destructive",
  },
  check_in_reminder: {
    icon: Bell,
    className: "bg-primary/10 text-primary",
  },
  system_alert: {
    icon: Info,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  },
  milestone: {
    icon: Sparkles,
    className: "bg-secondary/10 text-secondary-foreground",
  },
};

export function NotificationCard({
  notification,
  onDismiss,
  onMarkAsRead,
}: NotificationCardProps) {
  const config = typeConfig[notification.type] || typeConfig.system_alert;
  const Icon = config.icon;

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={cn(
        "relative flex gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
        notification.isRead
          ? "bg-muted/30 border-border"
          : "bg-card border-border shadow-sm hover:shadow-md"
      )}
      onClick={handleClick}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
          config.className
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "font-medium text-sm",
              notification.isRead ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {notification.title}
          </h4>
          {!notification.isRead && (
            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>

        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
          {notification.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
          </span>

          <div className="flex items-center gap-2">
            {notification.action && (
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="h-7 text-xs rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <Link to={notification.action.route}>
                  {notification.action.label}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
        className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-muted transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}
