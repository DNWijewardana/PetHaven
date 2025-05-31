import { useAuth0 } from "@auth0/auth0-react";
import { ReactNode } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle, ShieldCheck, LogIn } from "lucide-react";

interface AuthWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  showFallback?: boolean;
  message?: string;
  title?: string;
  description?: string;
  requireAuth?: boolean;
}

/**
 * AuthWrapper component that handles authentication state
 * 
 * @param children - The content to render when authenticated (or when not requiring auth)
 * @param fallback - Optional custom fallback content when not authenticated
 * @param showFallback - Force showing the fallback even in guest mode
 * @param message - Custom message for the auth prompt
 * @param title - Custom title for the auth prompt
 * @param description - Custom description for the auth prompt
 * @param requireAuth - Whether authentication is required (defaults to true)
 */
const AuthWrapper = ({
  children,
  fallback,
  showFallback = false,
  message = "Please log in to access this feature.",
  title = "Authentication Required",
  description = "This feature is only available to registered users.",
  requireAuth = true
}: AuthWrapperProps) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  // If authentication is not required, or user is authenticated, show children
  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  // If loading, we don't show anything yet
  if (isLoading) {
    return null;
  }

  // If a custom fallback is provided and showFallback is true, show it
  if (fallback && showFallback) {
    return <>{fallback}</>;
  }

  // Otherwise, show the default authentication prompt
  return (
    <Card className="max-w-md mx-auto shadow-md border-blue-100">
      <CardHeader>
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <ShieldCheck className="h-5 w-5" />
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3 text-blue-700 bg-blue-50 p-4 rounded-md">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>{message}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={() => loginWithRedirect()} className="bg-blue-600 hover:bg-blue-700">
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthWrapper; 