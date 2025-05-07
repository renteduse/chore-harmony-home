
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Calendar,
  DollarSign,
  Home,
  ListCheck,
  Menu,
  Settings,
  User,
  Users,
} from "lucide-react";

const MobileNavigation = () => {
  const location = useLocation();
  const { authState } = useAuth();
  const [open, setOpen] = useState(false);

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] sm:w-[300px]">
        <SheetHeader>
          <SheetTitle>RentMate</SheetTitle>
        </SheetHeader>
        <div className="mt-8 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
