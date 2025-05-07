
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useHousehold } from "@/contexts/HouseholdContext";
import { Calendar, Home, ListCheck, DollarSign, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { authState, logout } = useAuth();
  const { household } = useHousehold();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { path: "/chores", label: "Chores", icon: <ListCheck className="h-5 w-5" /> },
    { path: "/expenses", label: "Expenses", icon: <DollarSign className="h-5 w-5" /> },
    { path: "/calendar", label: "Calendar", icon: <Calendar className="h-5 w-5" /> },
    { path: "/household", label: "Household", icon: <Users className="h-5 w-5" /> },
  ];

  // If not authenticated, don't show the navigation
  if (!authState.isAuthenticated) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-rentmate-primary text-white p-4 flex flex-col">
        <div className="mb-6 flex items-center">
          <h1 className="font-bold text-2xl">RentMate</h1>
        </div>
        
        {household && (
          <div className="mb-6">
            <h2 className="text-sm uppercase tracking-wider opacity-75">Household</h2>
            <p className="font-medium text-lg">{household.name}</p>
          </div>
        )}
        
        <nav className="space-y-2 flex-1">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center p-2 rounded-md ${
                isActive(item.path) 
                  ? "bg-white bg-opacity-20" 
                  : "hover:bg-white hover:bg-opacity-10"
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto pt-4 border-t border-white border-opacity-20">
          <div className="flex items-center mb-4">
            <div className="flex-1">
              <p className="font-medium">{authState.user?.name}</p>
              <p className="text-sm opacity-75">{authState.user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-white hover:bg-opacity-10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default Layout;
