
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import CVMaker from "@/pages/CVMaker";
import CredentialWallet from "@/pages/CredentialWallet";
import AuthCallback from "@/pages/AuthCallback";
import CompleteProfile from "@/pages/CompleteProfile";
import ProfileSetup from "@/pages/ProfileSetup";
import Feed from "@/pages/Feed";
import NewPost from "@/pages/NewPost";
import AlumniProfile from "@/pages/AlumniProfile";
import ShareCredentials from "@/pages/ShareCredentials";
import SharedCredentials from "@/pages/SharedCredentials";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import "@/App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cv-maker" element={<CVMaker />} />
          <Route path="/credentials" element={<CredentialWallet />} />
          <Route path="/share-credentials" element={<ShareCredentials />} />
          <Route path="/shared/:shareId" element={<SharedCredentials />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/new-post" element={<NewPost />} />
          <Route path="/alumni/:id" element={<AlumniProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SonnerToaster position="top-center" richColors />
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
