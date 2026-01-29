import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationCenter } from "./NotificationCenter";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  className?: string;
  variant?: "default" | "sidebar" | "mobile";
}

export function NotificationBell({
  className,
  variant = "default",
}: NotificationBellProps) {
  const { unreadCount } = useNotifications();

  const bellButton = (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative",
        variant === "sidebar" && "w-10 h-10",
        variant === "mobile" && "w-12 h-12",
        className
      )}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
    >
      <Bell
        className={cn(
          "transition-colors",
          variant === "sidebar" && "w-5 h-5",
          variant === "mobile" && "w-6 h-6",
          variant === "default" && "w-5 h-5"
        )}
      />
      {unreadCount > 0 && (
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold",
            unreadCount > 9 ? "text-[10px] px-1" : "text-xs",
            variant === "mobile"
              ? "-top-0.5 -right-0.5 min-w-[20px] h-5"
              : "-top-1 -right-1 min-w-[18px] h-[18px]"
          )}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Button>
  );

  return <NotificationCenter trigger={bellButton} />;
}
