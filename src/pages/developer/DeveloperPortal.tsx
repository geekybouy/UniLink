
import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Code, 
  Book, 
  Key, 
  Webhook, 
  Shield, 
  Zap,
  ExternalLink,
  Copy,
  CheckCircle
} from 'lucide-react';

export default function DeveloperPortal() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const apiEndpoints = [
    {
      method: 'GET',
      path: '/api/v1/users/profile',
      description: 'Get user profile information',
      scopes: ['profile:read'],
      response: {
        id: 'uuid',
        name: 'string',
        email: 'string',
        university: 'string'
      }
    },
    {
      method: 'POST',
      path: '/api/v1/credentials/verify',
      description: 'Verify a credential',
      scopes: ['credentials:verify'],
      request: {
        credential_id: 'uuid',
        verification_method: 'string'
      }
    },
    {
      method: 'GET',
      path: '/api/v1/alumni/directory',
      description: 'Search alumni directory',
      scopes: ['directory:read'],
      parameters: {
        university: 'string',
        graduation_year: 'number',
        field: 'string'
      }
    }
  ];

  const webhookEvents = [
    {
      event: 'user.profile.updated',
      description: 'Fired when a user updates their profile',
      payload: {
        user_id: 'uuid',
        changes: 'object',
        timestamp: 'datetime'
      }
    },
    {
      event: 'credential.verified',
      description: 'Fired when a credential is successfully verified',
      payload: {
        credential_id: 'uuid',
        user_id: 'uuid',
        verification_status: 'string'
      }
    },
    {
      event: 'connection.established',
      description: 'Fired when two users connect',
      payload: {
        sender_id: 'uuid',
        receiver_id: 'uuid',
        connection_type: 'string'
      }
    }
  ];

  const sampleCode = {
    javascript: `// Initialize UniLink SDK
import { UniLinkAPI } from '@unilink/sdk';

const api = new UniLinkAPI({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  environment: 'production' // or 'sandbox'
});

// Get user profile
const profile = await api.users.getProfile(userId);

// Verify credential
const verification = await api.credentials.verify({
  credentialId: 'credential-uuid',
  verificationMethod: 'blockchain'
});

// Search alumni
const alumni = await api.alumni.search({
  university: 'MIT',
  graduationYear: 2020,
  field: 'Computer Science'
});`,
    
    python: `# UniLink Python SDK
from unilink import UniLinkAPI

# Initialize client
api = UniLinkAPI(
    client_id='your-client-id',
    client_secret='your-client-secret',
    environment='production'
)

# Get user profile
profile = api.users.get_profile(user_id)

# Verify credential
verification = api.credentials.verify(
    credential_id='credential-uuid',
    verification_method='blockchain'
)

# Search alumni
alumni = api.alumni.search(
    university='MIT',
    graduation_year=2020,
    field='Computer Science'
)`,

    curl: `# Get user profile
curl -X GET "https://api.unilink.edu/v1/users/profile" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json"

# Verify credential
curl -X POST "https://api.unilink.edu/v1/credentials/verify" \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "credential_id": "credential-uuid",
    "verification_method": "blockchain"
  }'`
  };

  const copyToClipboard = (text: string, codeType: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(codeType);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {method}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">UniLink Developer Portal</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Build powerful integrations with UniLink's comprehensive API platform.
              Connect university systems, verify credentials, and enhance your applications.
            </p>
          </div>

          {/* Quick Start Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Key className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle>Get API Keys</CardTitle>
                <CardDescription>
                  Create your application and get API credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Get Started
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Book className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  Comprehensive guides and references
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  View Docs
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Zap className="w-12 h-12 mx-auto text-primary mb-2" />
                <CardTitle>Sandbox</CardTitle>
                <CardDescription>
                  Test your integration in our sandbox
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Try Sandbox
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="endpoints">API Reference</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="samples">Code Samples</TabsTrigger>
              <TabsTrigger value="sdks">SDKs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      UniLink uses OAuth 2.0 for secure API access. All requests require authentication.
                    </p>
                    <div className="bg-muted p-3 rounded text-sm font-mono">
                      Authorization: Bearer YOUR_ACCESS_TOKEN
                    </div>
                    <Button variant="outline" size="sm">
                      OAuth Guide
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rate Limits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Standard Plan</span>
                        <span className="text-sm font-medium">1,000 requests/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Pro Plan</span>
                        <span className="text-sm font-medium">10,000 requests/hour</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Enterprise</span>
                        <span className="text-sm font-medium">Custom limits</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Upgrade Plan
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Available Scopes</CardTitle>
                  <CardDescription>
                    Request only the permissions your application needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      'profile:read', 'profile:write', 'credentials:read', 
                      'credentials:verify', 'directory:read', 'connections:read',
                      'connections:write', 'events:read', 'jobs:read'
                    ].map((scope) => (
                      <Badge key={scope} variant="secondary" className="justify-center">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints">
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoints</CardTitle>
                  <CardDescription>
                    Complete reference for all available endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {apiEndpoints.map((endpoint, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {getMethodBadge(endpoint.method)}
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {endpoint.description}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-medium">Required scopes:</span>
                          {endpoint.scopes.map((scope) => (
                            <Badge key={scope} variant="outline" className="text-xs">
                              {scope}
                            </Badge>
                          ))}
                        </div>
                        {(endpoint as any).response && (
                          <div>
                            <span className="text-xs font-medium">Response:</span>
                            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify((endpoint as any).response, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="webhooks">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="w-5 h-5" />
                    Webhook Events
                  </CardTitle>
                  <CardDescription>
                    Get real-time notifications about important events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {webhookEvents.map((event, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline">{event.event}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {event.description}
                        </p>
                        <div>
                          <span className="text-xs font-medium">Payload:</span>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(event.payload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="samples">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Code Examples
                  </CardTitle>
                  <CardDescription>
                    Get started quickly with these code samples
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="javascript" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                    </TabsList>
                    
                    {Object.entries(sampleCode).map(([lang, code]) => (
                      <TabsContent key={lang} value={lang}>
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{code}</code>
                          </pre>
                          <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(code, lang)}
                          >
                            {copiedCode === lang ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sdks">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    name: 'JavaScript SDK',
                    description: 'Official SDK for JavaScript and TypeScript',
                    install: 'npm install @unilink/sdk',
                    version: '1.2.3'
                  },
                  {
                    name: 'Python SDK',
                    description: 'Official SDK for Python applications',
                    install: 'pip install unilink-sdk',
                    version: '1.1.0'
                  },
                  {
                    name: 'PHP SDK',
                    description: 'Official SDK for PHP applications',
                    install: 'composer require unilink/sdk',
                    version: '1.0.5'
                  },
                  {
                    name: 'Java SDK',
                    description: 'Official SDK for Java applications',
                    install: 'Coming soon',
                    version: 'Beta'
                  }
                ].map((sdk) => (
                  <Card key={sdk.name}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{sdk.name}</CardTitle>
                        <Badge variant="secondary">v{sdk.version}</Badge>
                      </div>
                      <CardDescription>{sdk.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="bg-muted p-2 rounded text-sm font-mono">
                          {sdk.install}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Documentation
                          </Button>
                          <Button variant="outline" size="sm">
                            GitHub
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
