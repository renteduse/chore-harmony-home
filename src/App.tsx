
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { HouseholdProvider } from "./contexts/HouseholdContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import HouseholdSetup from "./pages/HouseholdSetup";
import Dashboard from "./pages/Dashboard";
import Household from "./pages/Household";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Chores from "./pages/Chores";
import ChoreForm from "./pages/ChoreForm";
import Expenses from "./pages/Expenses";
import ExpenseForm from "./pages/ExpenseForm";
import CalendarView from "./pages/CalendarView";
import Settlements from "./pages/Settlements";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = () => {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Auth routes (redirect to dashboard if already authenticated)
const AuthRoute = () => {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (authState.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <HouseholdProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Auth routes */}
              <Route element={<AuthRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/household-setup" element={<HouseholdSetup />} />
                
                {/* Routes with Layout */}
                <Route element={<Layout><Outlet /></Layout>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/household" element={<Household />} />
                  <Route path="/chores" element={<Chores />} />
                  <Route path="/chores/new" element={<ChoreForm />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/expenses/new" element={<ExpenseForm />} />
                  <Route path="/calendar" element={<CalendarView />} />
                  <Route path="/settlements" element={<Settlements />} />
                </Route>
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </HouseholdProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
