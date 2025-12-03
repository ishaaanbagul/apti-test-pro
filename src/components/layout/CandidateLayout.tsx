import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, FileText, CheckCircle } from "lucide-react";

const navItems = [
  { title: "Active Tests", url: "/candidate/tests", icon: FileText },
  { title: "Completed", url: "/candidate/completed", icon: CheckCircle },
];

export function CandidateLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/candidate/login" replace />;
  }

  if (user?.role !== 'candidate') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link to="/candidate/tests" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Talentshire</span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.url}
                  to={item.url}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    location.pathname === item.url
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* User section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium">{user?.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
}
