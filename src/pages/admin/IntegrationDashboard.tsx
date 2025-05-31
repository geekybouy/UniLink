
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ApiApplication, IntegrationConnector } from '@/types/integration';
import { 
  Activity, AlertCircle, ArrowRight, Database, Key, Link, Server, 
  Settings, ShieldAlert, User, Webhook
} from 'lucide-react';

const IntegrationDashboard = () => {
  const [applications, setApplications] = useState<ApiApplication[]>([]);
  const [connectors, setConnectors] = useState<IntegrationConnector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [appsData, connectorsData] = await Promise.all([
        supabase.from('api_applications').select('*'),
        supabase.from('integration_connectors').select('*')
      ]);
      
      if (appsData.error) throw new Error(appsData.error.message);
      if (connectorsData.error) throw new Error(connectorsData.error.message);
      
      setApplications(appsData.data as ApiApplication[]);
      setConnectors(connectorsData.data as IntegrationConnector[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integration Management</h1>
        <p className="text-muted-foreground">
          Monitor and manage all integrations and API connections
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">API Applications</TabsTrigger>
          <TabsTrigger value="connectors">Integration Connectors</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  API Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{applications.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Integration Connectors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{connectors.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Webhooks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  API Requests (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,457</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>API Usage</CardTitle>
                <CardDescription>
                  Request volume over the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 bg-muted rounded-md flex items-center justify-center">
                {/* Placeholder for chart */}
                <Activity className="h-16 w-16 text-muted-foreground opacity-50" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>
                  Recently created API applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applications.length > 0 ? (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((app) => (
                      <div key={app.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{app.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={app.is_active ? "success" : "destructive"}>
                          {app.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No applications found
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("applications")}>
                  View All Applications
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Connectors</CardTitle>
                <CardDescription>
                  Recently created integration connectors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {connectors.length > 0 ? (
                  <div className="space-y-4">
                    {connectors.slice(0, 5).map((connector) => (
                      <div key={connector.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{connector.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Type: {connector.type}
                          </p>
                        </div>
                        <Badge variant={connector.is_active ? "success" : "destructive"}>
                          {connector.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No connectors found
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab("connectors")}>
                  View All Connectors
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="applications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>API Applications</CardTitle>
                <CardDescription>
                  Manage all registered API applications
                </CardDescription>
              </div>
              <Button>Add Application</Button>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <Input 
                  placeholder="Search applications..." 
                  className="max-w-sm" 
                />
                <div className="flex items-center gap-2">
                  <select className="border p-2 rounded-md text-sm">
                    <option value="all">All Types</option>
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="server">Server</option>
                  </select>
                  <select className="border p-2 rounded-md text-sm">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length > 0 ? (
                      applications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-medium">{app.name}</TableCell>
                          <TableCell>{app.owner_id.substring(0, 8)}...</TableCell>
                          <TableCell>{app.application_type}</TableCell>
                          <TableCell>
                            <Badge variant={app.is_active ? "success" : "destructive"}>
                              {app.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No applications found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="connectors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Integration Connectors</CardTitle>
                <CardDescription>
                  Manage connections to external systems
                </CardDescription>
              </div>
              <Button>Create Connector</Button>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <Input 
                  placeholder="Search connectors..." 
                  className="max-w-sm" 
                />
                <div className="flex items-center gap-2">
                  <select className="border p-2 rounded-md text-sm">
                    <option value="all">All Types</option>
                    <option value="university_sis">University SIS</option>
                    <option value="hr_platform">HR Platform</option>
                    <option value="certification_authority">Certification Authority</option>
                    <option value="job_board">Job Board</option>
                  </select>
                  <select className="border p-2 rounded-md text-sm">
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Authentication</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Synced</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connectors.length > 0 ? (
                      connectors.map((connector) => (
                        <TableRow key={connector.id}>
                          <TableCell className="font-medium">{connector.name}</TableCell>
                          <TableCell>{connector.type}</TableCell>
                          <TableCell>{connector.authentication_method}</TableCell>
                          <TableCell>
                            <Badge variant={connector.is_active ? "success" : "destructive"}>
                              {connector.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(connector.updated_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No connectors found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Management</CardTitle>
              <CardDescription>
                Configure real-time event notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Webhook className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Webhook Management</h3>
                <p className="text-muted-foreground mb-4">
                  Configure and monitor webhooks for real-time event notifications
                </p>
                <Button>View Webhooks</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Integration Logs</CardTitle>
              <CardDescription>
                Monitor API usage and integration activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-6">
                <Input 
                  placeholder="Search logs..." 
                  className="max-w-sm" 
                />
                <div className="flex items-center gap-2">
                  <select className="border p-2 rounded-md text-sm">
                    <option value="all">All Types</option>
                    <option value="api">API Requests</option>
                    <option value="sync">Data Syncs</option>
                    <option value="webhook">Webhook Deliveries</option>
                    <option value="error">Errors</option>
                  </select>
                  <Button variant="outline" size="sm">
                    Filter
                  </Button>
                </div>
              </div>
              
              {/* Sample log entries */}
              <div className="space-y-2 mb-4">
                <div className="border p-3 rounded-md flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full">
                    <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">GET /api/v1/credentials</p>
                    <p className="text-xs text-muted-foreground">200 OK - 48ms - app_1234</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Today, 09:43 AM
                  </div>
                </div>
                
                <div className="border p-3 rounded-md flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-1 rounded-full">
                    <Webhook className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Webhook delivered: credential.created</p>
                    <p className="text-xs text-muted-foreground">200 OK - webhook_5678</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Today, 09:42 AM
                  </div>
                </div>
                
                <div className="border p-3 rounded-md flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-900 p-1 rounded-full">
                    <Database className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Data sync completed: university_records</p>
                    <p className="text-xs text-muted-foreground">145 records processed - 2 errors</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Today, 08:15 AM
                  </div>
                </div>
                
                <div className="border p-3 rounded-md flex items-center gap-3">
                  <div className="bg-red-100 dark:bg-red-900 p-1 rounded-full">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Rate limit exceeded: app_2345</p>
                    <p className="text-xs text-muted-foreground">429 Too Many Requests</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Yesterday, 03:24 PM
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-8">
                <Button variant="outline">Load More</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  Global API settings and defaults
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Default Rate Limit</label>
                    <div className="flex">
                      <Input type="number" defaultValue="1000" />
                      <span className="px-3 py-2 bg-muted border-y border-r rounded-r-md">
                        requests/hour
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Token Expiration</label>
                    <div className="flex">
                      <Input type="number" defaultValue="30" />
                      <span className="px-3 py-2 bg-muted border-y border-r rounded-r-md">
                        days
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Default Scope</label>
                    <Input defaultValue="read:profile" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto">Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure API security policies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">IP Whitelisting</p>
                      <p className="text-sm text-muted-foreground">
                        Restrict API access to specific IP addresses
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Request Signing</p>
                      <p className="text-sm text-muted-foreground">
                        Require digital signatures for API requests
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enhanced Monitoring</p>
                      <p className="text-sm text-muted-foreground">
                        Additional logging for security events
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto">Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure advanced integration options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      Endpoint Configuration
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-muted-foreground">
                          API Base URL
                        </label>
                        <Input defaultValue="https://api.unilink.example/v1" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Webhook URL
                        </label>
                        <Input defaultValue="https://webhooks.unilink.example" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4" />
                      OAuth Settings
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Authorization URL
                        </label>
                        <Input defaultValue="https://auth.unilink.example/authorize" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Token URL
                        </label>
                        <Input defaultValue="https://auth.unilink.example/token" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="mr-2">
                  Reset Defaults
                </Button>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationDashboard;
