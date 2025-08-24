import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import PostsPage from "./pages/Posts";
import ProfilePage from "./pages/Profile";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import AdminPage from "./pages/Admin";
import AdminSetup from "./pages/AdminSetup";
import CreateCampaign from "./pages/CreateCampaign";
import AllCampaigns from "./pages/AllCampaigns";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";
import Test from "./pages/Test";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/campaigns" element={<AllCampaigns />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin-setup" element={<AdminSetup />} />
          <Route path="/create-campaign" element={<CreateCampaign />} />
          <Route path="/payment/:campaignId" element={<Payment />} />
          <Route path="/login-user" element={<Test />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
