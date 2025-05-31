import { cn } from "@/lib/utils";
import { useLocation } from "react-router";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className }: PageWrapperProps) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className={cn(
      isHomePage ? "" : "mt-[4.5rem] min-h-[calc(100vh-4.5rem-12rem)]",
      className
    )}>
      {children}
    </div>
  );
} 