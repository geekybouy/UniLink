
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { Sidebar, SidebarContent, SidebarGroup, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ChevronLeft, Users, FileText, BarChart2, Settings, Bell, Shield, FileSearch, UserCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isLoading, hasRole } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (user) {
        const admin = await hasRole('admin');
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }
    };
    
    checkAdminRole();
  }, [user, hasRole]);

  // Show loading state
  if (isLoading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Verifying admin access...</span>
      </div>
    );
  }

  // Redirect non-admin users
  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className={`border-r border-border bg-card transition-all duration-300 h-screen ${sidebarOpen ? 'w-64' : 'w-16'}`}>
          <SidebarHeader className="flex items-center justify-between p-4 border-b">
            <h2 className={`font-bold text-lg ${!sidebarOpen && 'hidden'}`}>Admin Panel</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-full"
            >
              <ChevronLeft className={`h-5 w-5 transition-transform ${!sidebarOpen && 'rotate-180'}`} />
            </Button>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/dashboard" className="flex items-center space-x-2">
                      <BarChart2 className="h-5 w-5" />
                      {sidebarOpen && <span>Dashboard</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/users" className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      {sidebarOpen && <span>Users</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/content" className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      {sidebarOpen && <span>Content</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/roles" className="flex items-center space-x-2">
                      <UserCheck className="h-5 w-5" />
                      {sidebarOpen && <span>Role Management</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/announcements" className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      {sidebarOpen && <span>Announcements</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/fraud-detection" className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5" />
                      {sidebarOpen && <span>Fraud Detection</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/audit-logs" className="flex items-center space-x-2">
                      <FileSearch className="h-5 w-5" />
                      {sidebarOpen && <span>Audit Logs</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/admin/settings" className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      {sidebarOpen && <span>Settings</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <div className={`flex-1 p-8 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          {children || <Outlet />}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
