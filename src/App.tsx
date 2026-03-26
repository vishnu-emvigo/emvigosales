import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LeadsProvider } from "@/contexts/LeadsContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import AllLeadsPage from "@/pages/AllLeadsPage";
import MyLeadsPage from "@/pages/MyLeadsPage";
import UnassignedLeadsPage from "@/pages/UnassignedLeadsPage";
import AssignmentPage from "@/pages/AssignmentPage";
import TeamManagementPage from "@/pages/TeamManagementPage";
import RemindersPage from "@/pages/RemindersPage";
import DataUploadPage from "@/pages/DataUploadPage";
import ExportPage from "@/pages/ExportPage";
import ReportsPage from "@/pages/ReportsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout />;
};

const LoginRoute = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <LeadsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route element={<ProtectedRoutes />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/leads" element={<AllLeadsPage />} />
                <Route path="/my-leads" element={<MyLeadsPage />} />
                <Route path="/unassigned" element={<UnassignedLeadsPage />} />
                <Route path="/assignment" element={<AssignmentPage />} />
                <Route path="/team" element={<TeamManagementPage />} />
                <Route path="/reminders" element={<RemindersPage />} />
                <Route path="/upload" element={<DataUploadPage />} />
                <Route path="/export" element={<ExportPage />} />
                <Route path="/reports" element={<ReportsPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LeadsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
