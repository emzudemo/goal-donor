import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Target } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useRouter } from "wouter";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [location, setLocation] = useLocation();
  const isDashboard = location === "/dashboard";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isDashboard
          ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className={`text-xl font-bold ${scrolled || isDashboard ? "" : "text-white"}`}>
              GoalGuard
            </span>
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="default"
              onClick={() => setLocation("/dashboard")}
              data-testid="button-dashboard"
            >
              {isDashboard ? "Dashboard" : "Get Started"}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
