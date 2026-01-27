import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-16 px-4",
      className
    )}>
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="font-display text-2xl mb-2">{title}</h3>
      <p className="text-muted-foreground font-handwritten text-xl mb-6">{description}</p>
      {action}
    </div>
  );
}
