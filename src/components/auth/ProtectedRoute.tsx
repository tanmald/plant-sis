import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OnboardingWizard } from "./OnboardingWizard";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, isOnboarded, completeOnboarding } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-warm">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce-gentle">🌱</div>
          <p className="text-muted-foreground font-handwritten text-xl">Loading your garden...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isOnboarded) {
    return <OnboardingWizard onComplete={completeOnboarding} />;
  }

  return <>{children}</>;
}
