import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import Eligibility from "./pages/Eligibility";
import Category from "./pages/Category";
import ServiceDetail from "./pages/ServiceDetail";
import Applications from "./pages/Applications";
import ApplicationDetail from "./pages/ApplicationDetail";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import { OnboardingProvider } from "@/components/Onboarding/OnboardingProvider";
import LanguageModal from "@/components/Onboarding/LanguageModal";
import WalkthroughOverlay from "@/components/Onboarding/WalkthroughOverlay";
import Chatbot from "@/components/Chatbot/Chatbot";
import IntroLoader from "@/components/IntroLoader";
import { useThemeStore, useAuthStore, useApplicationStore, useNotificationStore, seedAllData } from "@/lib/store";
import { useSchemeStore } from "@/stores/schemeStore";
import { useAuditStore } from "@/stores/auditStore";
import { isAdminRole } from "@/lib/rbac";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSchemes from "./pages/admin/AdminSchemes";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminApplications from "./pages/admin/AdminApplications";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminRoles from "./pages/admin/AdminRoles";

const queryClient = new QueryClient();

// Admin route guard — uses unified auth store
const AdminGuard = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdminRole(user?.role)) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You do not have admin privileges.</p>
      </div>
    </div>
  );
  return children;
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const initTheme = useThemeStore((s) => s.initTheme);
  const loadSchemes = useSchemeStore((s) => s.loadSchemes);
  const loadApplications = useApplicationStore((s) => s.loadApplications);
  const loadNotifications = useNotificationStore((s) => s.loadNotifications);
  const loadAuditLogs = useAuditStore((s) => s.loadLogs);

  useEffect(() => {
    initTheme();
    // Seed all localStorage data + hydrate stores
    seedAllData();
    loadSchemes();
    loadApplications();
    loadNotifications();
    loadAuditLogs();
  }, [initTheme, loadSchemes, loadApplications, loadNotifications, loadAuditLogs]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OnboardingProvider>
          <Toaster />
          <Sonner />
          <LanguageModal />
          <WalkthroughOverlay />

          {isLoading && <IntroLoader onComplete={() => setIsLoading(false)} />}

          <BrowserRouter>
            <div className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
              <Routes>
                {/* Public / User routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/services" element={<Services />} />
                <Route path="/eligibility" element={<Eligibility />} />
                <Route path="/category/:categoryId" element={<Category />} />
                <Route path="/service/:serviceId" element={<ServiceDetail />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/applications/:id" element={<ApplicationDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />

                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                <Route path="/admin/schemes" element={<AdminGuard><AdminSchemes /></AdminGuard>} />
                <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
                <Route path="/admin/applications" element={<AdminGuard><AdminApplications /></AdminGuard>} />
                <Route path="/admin/notifications" element={<AdminGuard><AdminNotifications /></AdminGuard>} />
                <Route path="/admin/analytics" element={<AdminGuard><AdminAnalytics /></AdminGuard>} />
                <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
                <Route path="/admin/roles" element={<AdminGuard><AdminRoles /></AdminGuard>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
              <Chatbot />
            </div>
          </BrowserRouter>
        </OnboardingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
