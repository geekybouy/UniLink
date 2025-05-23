
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { getApiApplications, createApiApplication, generateApiToken } from '@/services/integrationService';
import { ApiApplication } from '@/types/integration';
import { v4 as uuidv4 } from 'uuid';
import { Code, Copy, Key, RefreshCcw } from 'lucide-react';

const DeveloperPortal = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApiApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<ApiApplication | null>(null);
  const [newAppName, setNewAppName] = useState('');
  const [newAppDescription, setNewAppDescription] = useState('');
  const [newAppType, setNewAppType] = useState<'web' | 'mobile' | 'server'>('web');
  const [newToken, setNewToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('apps');

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    if (user) {
      try {
        const apps = await getApiApplications(user.id);
        setApplications(apps);
      } catch (error) {
        console.error("Failed to load applications:", error);
      }
    }
  };

  const handleCreateApplication = async () => {
    if (!user || !newAppName) return;
    
    setIsSubmitting(true);
    try {
      const clientId = uuidv4();
      const clientSecret = uuidv4();
      
      const newApp = await createApiApplication({
        name: newAppName,
        description: newAppDescription,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uris: [],
        scopes: ['read:profile'],
        application_type: newAppType,
        owner_id: user.id,
        is_active: true,
        rate_limit_per_hour: 1000
      });
      
      setApplications([...applications, newApp]);
      setNewAppName('');
      setNewAppDescription('');
    } catch (error) {
      console.error("Failed to create application:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateToken = async (appId: string) => {
    if (!user) return;
    
    try {
      const token = await generateApiToken(appId, user.id, ['read:profile']);
      setNewToken(token);
    } catch (error) {
      console.error("Failed to generate token:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Developer Portal</h1>
        <p className="text-muted-foreground">
          Build and integrate applications with the UniLink platform
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="apps">My Applications</TabsTrigger>
          <TabsTrigger value="docs">API Documentation</TabsTrigger>
          <TabsTrigger value="guides">Integration Guides</TabsTrigger>
          <TabsTrigger value="sandbox">Sandbox</TabsTrigger>
        </TabsList>
        
        <TabsContent value="apps" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your API Applications</h2>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create New Application</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Application</DialogTitle>
                  <DialogDescription>
                    Register a new application to integrate with UniLink
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="name" className="text-right">
                      Name
                    </label>
                    <Input 
                      id="name" 
                      value={newAppName}
                      onChange={(e) => setNewAppName(e.target.value)}
                      className="col-span-3" 
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="description" className="text-right">
                      Description
                    </label>
                    <Input 
                      id="description" 
                      value={newAppDescription}
                      onChange={(e) => setNewAppDescription(e.target.value)}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="type" className="text-right">
                      Type
                    </label>
                    <select 
                      id="type" 
                      value={newAppType}
                      onChange={(e) => setNewAppType(e.target.value as 'web' | 'mobile' | 'server')}
                      className="col-span-3 p-2 border rounded-md"
                    >
                      <option value="web">Web Application</option>
                      <option value="mobile">Mobile Application</option>
                      <option value="server">Server Application</option>
                    </select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    onClick={handleCreateApplication}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Application'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {applications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center h-48">
                <p className="text-center text-muted-foreground">
                  You don't have any applications yet.
                </p>
                <p className="text-center text-muted-foreground mb-4">
                  Create your first application to start integrating with UniLink.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Create New Application</Button>
                  </DialogTrigger>
                  {/* Dialog content is the same as above */}
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="truncate">{app.name}</CardTitle>
                      <Badge variant={app.is_active ? "success" : "destructive"}>
                        {app.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {app.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{app.application_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <Accordion type="single" collapsible className="mt-4">
                      <AccordionItem value="credentials">
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            <span>Credentials</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">
                                Client ID
                              </label>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted p-1 rounded flex-1 overflow-hidden overflow-ellipsis">
                                  {app.client_id}
                                </code>
                                <Button 
                                  variant="ghost" 
                                  size="icon-sm" 
                                  onClick={() => copyToClipboard(app.client_id)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">
                                Client Secret
                              </label>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted p-1 rounded flex-1 overflow-hidden overflow-ellipsis">
                                  {app.client_secret.substring(0, 8)}...
                                </code>
                                <Button 
                                  variant="ghost" 
                                  size="icon-sm"
                                  onClick={() => copyToClipboard(app.client_secret)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => handleGenerateToken(app.id)}
                            >
                              <RefreshCcw className="h-3 w-3 mr-1" />
                              Generate Access Token
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {/* Dialog for displaying a new token */}
          {newToken && (
            <Dialog open={!!newToken} onOpenChange={() => setNewToken(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Access Token Generated</DialogTitle>
                  <DialogDescription>
                    This token will only be shown once. Make sure to copy it now.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="p-4 bg-muted rounded-md">
                  <code className="whitespace-pre-wrap text-sm break-all">{newToken}</code>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(newToken)}
                    className="mr-2"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={() => setNewToken(null)}>Done</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>
        
        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Comprehensive references for UniLink's integration APIs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Authentication APIs
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono">/api/v1/auth/token</TableCell>
                      <TableCell><Badge>POST</Badge></TableCell>
                      <TableCell>Generate OAuth access tokens</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/api/v1/auth/revoke</TableCell>
                      <TableCell><Badge>POST</Badge></TableCell>
                      <TableCell>Revoke an access token</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/api/v1/auth/userinfo</TableCell>
                      <TableCell><Badge>GET</Badge></TableCell>
                      <TableCell>Get current authenticated user info</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Credential APIs
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-mono">/api/v1/credentials</TableCell>
                      <TableCell><Badge>GET</Badge></TableCell>
                      <TableCell>List user credentials</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/api/v1/credentials/:id</TableCell>
                      <TableCell><Badge>GET</Badge></TableCell>
                      <TableCell>Get credential details</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-mono">/api/v1/credentials/verify</TableCell>
                      <TableCell><Badge>POST</Badge></TableCell>
                      <TableCell>Verify a credential</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <Button variant="outline" className="w-full">
                View Full API Reference
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="guides">
          <Card>
            <CardHeader>
              <CardTitle>Integration Guides</CardTitle>
              <CardDescription>
                Step-by-step tutorials to help you integrate with UniLink
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Getting Started</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Learn the basics of UniLink API integration, authentication flows, and key concepts
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Read Guide
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Webhook Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Implement real-time updates by configuring and securing webhook endpoints
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Read Guide
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">OAuth Implementation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Secure user authorization using UniLink's OAuth 2.0 implementation
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Read Guide
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Credential Verification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Learn how to verify and validate educational and professional credentials
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full">
                      Read Guide
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sandbox">
          <Card>
            <CardHeader>
              <CardTitle>API Sandbox</CardTitle>
              <CardDescription>
                Test your integrations in a safe environment
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96 bg-muted rounded-md flex items-center justify-center">
              <p className="text-center text-muted-foreground">
                Interactive API testing console coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperPortal;
