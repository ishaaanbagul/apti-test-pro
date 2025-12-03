import { NavLink } from "@/components/NavLink";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Users,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Create Test", url: "/tests/create", icon: PlusCircle },
  { title: "Test Library", url: "/tests", icon: FileText },
  { title: "Assignments", url: "/assignments", icon: Users },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AdminSidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-foreground">Talentshire</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
            )}
            activeClassName="bg-accent text-accent-foreground"
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
