
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  DollarSign,
  Home,
  ListCheck,
  Settings,
  User,
  Users,
} from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return null;
  }

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/chores", label: "Chores", icon: ListCheck },
    { href: "/expenses", label: "Expenses", icon: DollarSign },
    { href: "/settlements", label: "Settle Up", icon: Users },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/household", label: "Household", icon: Settings },
  ];

  return (
    <nav className="hidden md:block">
      <div className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
          >
            <div
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                location.pathname === link.href
                  ? "bg-accent text-accent-foreground"
                  : "transparent"
              )}
            >
              <link.icon className="mr-3 h-4 w-4" />
              <span>{link.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
