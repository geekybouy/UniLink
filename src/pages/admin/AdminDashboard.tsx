
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';

interface AnalyticsData {
  userStats: {
    total: number;
    newThisWeek: number;
    activeUsers: number;
    usersByRole: { role: string; count: number }[];
  };
  contentStats: {
    totalPosts: number;
    postsThisWeek: number;
    pendingApproval: number;
  };
  eventStats: {
    totalEvents: number;
    upcomingEvents: number;
    participationRate: number;
  };
  registrationData: { date: string; count: number }[];
  engagementData: { category: string; value: number }[];
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userStats: { total: 0, newThisWeek: 0, activeUsers: 0, usersByRole: [] },
    contentStats: { totalPosts: 0, postsThisWeek: 0, pendingApproval: 0 },
    eventStats: { totalEvents: 0, upcomingEvents: 0, participationRate: 0 },
    registrationData: [],
    engagementData: []
  });
  
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Fetch user statistics
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('count');
        
        if (usersError) throw usersError;
        
        // Fetch new users this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const { data: newUsers, error: newUsersError } = await supabase
          .from('profiles')
          .select('count')
          .gt('created_at', oneWeekAgo.toISOString());
        
        if (newUsersError) throw newUsersError;
        
        // Fetch users by role
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role, count')
          .group('role');
        
        if (roleError) throw roleError;
        
        // Fetch posts statistics
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('count');
        
        if (postsError) throw postsError;
        
        // Mock data for now - would normally come from the database
        const mockRegistrationData = generateRegistrationData(timeRange);
        const mockEngagementData = [
          { category: 'Posts', value: postsData?.[0]?.count || 0 },
          { category: 'Comments', value: 124 },
          { category: 'Votes', value: 358 },
          { category: 'Events', value: 28 },
          { category: 'Connections', value: 187 }
        ];
        
        setAnalyticsData({
          userStats: {
            total: usersData?.[0]?.count || 0,
            newThisWeek: newUsers?.[0]?.count || 0,
            activeUsers: Math.floor((usersData?.[0]?.count || 0) * 0.7), // Mocked active user count (70% of total)
            usersByRole: roleData?.map(r => ({ role: r.role, count: r.count })) || []
          },
          contentStats: {
            totalPosts: postsData?.[0]?.count || 0,
            postsThisWeek: Math.floor((postsData?.[0]?.count || 0) * 0.3), // Mocked recent posts (30% of total)
            pendingApproval: Math.floor((postsData?.[0]?.count || 0) * 0.15) // Mocked pending approval (15% of total)
          },
          eventStats: {
            totalEvents: 28, // Mocked
            upcomingEvents: 8, // Mocked
            participationRate: 65 // Mocked percentage
          },
          registrationData: mockRegistrationData,
          engagementData: mockEngagementData
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeRange]);
  
  // Helper function to generate mock registration data based on time range
  const generateRegistrationData = (range: 'week' | 'month' | 'year') => {
    const data: { date: string; count: number }[] = [];
    const today = new Date();
    let days = 7;
    
    switch (range) {
      case 'month':
        days = 30;
        break;
      case 'year':
        days = 12; // 12 months for year view
        break;
      default:
        days = 7;
    }
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      let label = '';
      
      if (range === 'year') {
        date.setMonth(today.getMonth() - i);
        label = date.toLocaleString('default', { month: 'short' });
      } else {
        date.setDate(today.getDate() - i);
        label = date.toLocaleString('default', { month: 'short', day: 'numeric' });
      }
      
      data.push({
        date: label,
        count: Math.floor(Math.random() * 50) + 10 // Random number between 10-60
      });
    }
    
    return data;
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Loading analytics data...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Users</CardTitle>
            <CardDescription>Platform user statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{analyticsData.userStats.total}</div>
            <div className="flex justify-between mt-2 text-sm">
              <div>
                <p className="text-muted-foreground">New this week</p>
                <p className="font-medium">+{analyticsData.userStats.newThisWeek}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Active users</p>
                <p className="font-medium">{analyticsData.userStats.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Content</CardTitle>
            <CardDescription>Posts and content stats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{analyticsData.contentStats.totalPosts}</div>
            <div className="flex justify-between mt-2 text-sm">
              <div>
                <p className="text-muted-foreground">New this week</p>
                <p className="font-medium">+{analyticsData.contentStats.postsThisWeek}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pending approval</p>
                <p className="font-medium">{analyticsData.contentStats.pendingApproval}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Events</CardTitle>
            <CardDescription>Events and participation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{analyticsData.eventStats.totalEvents}</div>
            <div className="flex justify-between mt-2 text-sm">
              <div>
                <p className="text-muted-foreground">Upcoming</p>
                <p className="font-medium">{analyticsData.eventStats.upcomingEvents}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Participation rate</p>
                <p className="font-medium">{analyticsData.eventStats.participationRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <Tabs defaultValue="registrations" className="mb-6">
        <TabsList>
          <TabsTrigger value="registrations">User Registrations</TabsTrigger>
          <TabsTrigger value="engagement">Platform Engagement</TabsTrigger>
        </TabsList>
        <Card className="mt-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Analytics</CardTitle>
              <div className="flex gap-2">
                <TabsTrigger 
                  value="week" 
                  onClick={() => setTimeRange('week')}
                  className={timeRange === 'week' ? 'bg-primary text-white' : ''}
                >
                  Week
                </TabsTrigger>
                <TabsTrigger 
                  value="month" 
                  onClick={() => setTimeRange('month')}
                  className={timeRange === 'month' ? 'bg-primary text-white' : ''}
                >
                  Month
                </TabsTrigger>
                <TabsTrigger 
                  value="year" 
                  onClick={() => setTimeRange('year')}
                  className={timeRange === 'year' ? 'bg-primary text-white' : ''}
                >
                  Year
                </TabsTrigger>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="registrations" className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.registrationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="New Users" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            <TabsContent value="engagement" className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
      
      {/* Advanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.userStats.usersByRole.map((role, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="capitalize">{role.role}</span>
                  <span className="font-semibold">{role.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <a 
                href="/admin/users" 
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-center"
              >
                Manage Users
              </a>
              <a 
                href="/admin/content" 
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-center"
              >
                Review Content
              </a>
              <a 
                href="/admin/announcements" 
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-center"
              >
                Create Announcement
              </a>
              <a 
                href="/admin/settings" 
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-center"
              >
                Platform Settings
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
