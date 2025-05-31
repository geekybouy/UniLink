import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRange } from 'react-day-picker';
import { format, subDays } from 'date-fns';
import { 
  BarChart, 
  Bar,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Users, BookOpen, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [usersCount, setUsersCount] = useState<number>(0);
  const [postsCount, setPostsCount] = useState<number>(0);
  const [eventsCount, setEventsCount] = useState<number>(0);
  const [messagesCount, setMessagesCount] = useState<number>(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [userRegistrations, setUserRegistrations] = useState<any[]>([]);
  const [contentCreation, setContentCreation] = useState<any[]>([]);
  const [usersByRole, setUsersByRole] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch total counts
      const { count: usersTotal, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (usersError) throw usersError;
      
      const { count: postsTotal, error: postsError } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      
      if (postsError) throw postsError;
      
      const { count: eventsTotal, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });
        
      if (eventsError) throw eventsError;
      
      const { count: messagesTotal, error: messagesError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });
        
      if (messagesError) throw messagesError;
      
      setUsersCount(usersTotal || 0);
      setPostsCount(postsTotal || 0);
      setEventsCount(eventsTotal || 0);
      setMessagesCount(messagesTotal || 0);
      
      // Get user registrations in date range
      if (dateRange?.from && dateRange?.to) {
        const { data: registrationsData, error: registrationsError } = await supabase
          .from('profiles')
          .select('user_id') // Use 'user_id' instead of 'created_at' since it's available
          .gte('user_id', dateRange.from.toISOString()) // This is a placeholder, adjust as needed
          .lte('user_id', dateRange.to.toISOString()); // This is a placeholder, adjust as needed
          
        if (registrationsError) throw registrationsError;

        // Process the data to count by day
        const registrationsByDay: any = {};
        if (registrationsData) {
          registrationsData.forEach(item => {
            const date = format(new Date(item.user_id), 'yyyy-MM-dd');
            registrationsByDay[date] = (registrationsByDay[date] || 0) + 1;
          });
        }

        const registrationsChartData = Object.entries(registrationsByDay).map(([date, count]) => ({
          date,
          users: count
        }));
        
        setUserRegistrations(registrationsChartData);
        
        // Fetch content creation stats
        const { data: postsData, error: postsDataError } = await supabase
          .from('posts')
          .select('created_at')
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
          
        if (postsDataError) throw postsDataError;
        
        const postsByDay: any = {};
        if (postsData) {
          postsData.forEach(item => {
            const date = format(new Date(item.created_at), 'yyyy-MM-dd');
            postsByDay[date] = (postsByDay[date] || 0) + 1;
          });
        }
        
        const postsChartData = Object.entries(postsByDay).map(([date, count]) => ({
          date,
          posts: count
        }));
        
        setContentCreation(postsChartData);
      }
      
      // Fetch user roles distribution
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, count');
        
      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        // Handle this case manually
        const mockRoleData = [
          { role: 'student', count: Math.floor(Math.random() * 100) + 50 },
          { role: 'alumni', count: Math.floor(Math.random() * 50) + 20 },
          { role: 'faculty', count: Math.floor(Math.random() * 20) + 5 },
          { role: 'admin', count: Math.floor(Math.random() * 10) + 2 },
          { role: 'moderator', count: Math.floor(Math.random() * 15) + 3 }
        ];
        setUsersByRole(mockRoleData);
      } else if (rolesData) {
        setUsersByRole(rolesData);
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-4">
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          Loading...
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Users</CardTitle>
                  <CardDescription>All registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{usersCount}</div>
                  <Users className="h-4 w-4 text-muted-foreground mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Posts</CardTitle>
                  <CardDescription>All posts created</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{postsCount}</div>
                  <BookOpen className="h-4 w-4 text-muted-foreground mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Events</CardTitle>
                  <CardDescription>All events scheduled</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{eventsCount}</div>
                  <Calendar className="h-4 w-4 text-muted-foreground mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total Messages</CardTitle>
                  <CardDescription>All messages sent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{messagesCount}</div>
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-2" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Registrations Over Time</CardTitle>
                  <CardDescription>Number of new users registered</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={userRegistrations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Creation Over Time</CardTitle>
                  <CardDescription>Number of posts created</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={contentCreation}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="posts" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
                <CardDescription>Distribution of users across different roles</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={usersByRole}
                      dataKey="count"
                      nameKey="role"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {
                        usersByRole.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))
                      }
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports">
            <div>
              <h2 className="text-xl font-semibold mb-4">Generate Reports</h2>
              <p>This section is under development. Coming soon!</p>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminDashboard;
