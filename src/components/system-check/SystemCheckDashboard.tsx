import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, ListChecks } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // for API test

interface TestResult {
  name: string;
  status: 'idle' | 'running' | 'success' | 'failure';
  message?: string;
  details?: any;
}

const TestStatusIndicator: React.FC<{ status: TestResult['status']; message?: string }> = ({ status, message }) => {
  if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
  if (status === 'failure') return <XCircle className="h-5 w-5 text-red-500" />;
  if (status === 'running') return <ListChecks className="h-5 w-5 text-blue-500 animate-pulse" />;
  return <AlertCircle className="h-5 w-5 text-gray-400" />;
};

const SystemCheckDashboard: React.FC = () => {
  const { user, isLoading: authLoading, session } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [apiTestResult, setApiTestResult] = useState<TestResult>({ name: 'Verify Credential API', status: 'idle' });

  const runVerifyCredentialApiTest = async () => {
    setApiTestResult(prev => ({ ...prev, status: 'running', message: 'Testing...' }));
    try {
      // Test with a non-existent ID to check 404 or specific error handling
      const { data, error } = await supabase.functions.invoke('verify-credential', {
        body: { credentialId: 'non-existent-test-id' },
      });

      if (error) {
        // Deno functions often return errors in data for HTTP errors
        if (data && data.status === 'not_found') {
           setApiTestResult({ status: 'success', name: 'Verify Credential API (Not Found)', message: `Successfully handled non-existent ID. Status: ${data.status}` });
        } else {
          throw new Error(error.message || (data ? JSON.stringify(data) : 'Unknown API error'));
        }
      } else if (data && data.status === 'not_found') {
         setApiTestResult({ status: 'success', name: 'Verify Credential API (Not Found)', message: `Successfully handled non-existent ID. Status: ${data.status}` });
      }
       else if (data) {
        // This case might indicate an unexpected success if we expected not_found
        setApiTestResult({ status: 'failure', name: 'Verify Credential API', message: 'API responded unexpectedly for non-existent ID.', details: data });
      } else {
        setApiTestResult({ status: 'success', name: 'Verify Credential API', message: 'API call successful (empty response for non-existent ID likely).', details: data });
      }
    } catch (err: any) {
      setApiTestResult({ status: 'failure', name: 'Verify Credential API', message: err.message || 'Failed to call API.', details: err });
    }
  };

  const renderTestResult = (result: TestResult) => (
    <div className="flex items-center space-x-2 p-2 border rounded-md">
      <TestStatusIndicator status={result.status} />
      <div>
        <p className="font-medium">{result.name}</p>
        {result.message && <p className="text-sm text-muted-foreground">{result.message}</p>}
        {result.status === 'failure' && result.details && (
          <pre className="mt-1 text-xs bg-destructive/10 p-1 rounded-sm overflow-auto">
            {typeof result.details === 'string' ? result.details : JSON.stringify(result.details, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
  
  const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
    <Link to={to} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
      {children} <ExternalLink className="ml-1 h-3 w-3" />
    </Link>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Status & Contexts</CardTitle>
          <CardDescription>Basic checks for core system components.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span>Auth Context:</span>
            {authLoading ? <span className="text-yellow-600">Loading...</span> : session ? <span className="text-green-600">Loaded (User: {user?.email || 'Authenticated'})</span> : <span className="text-red-600">Not Loaded/No Session</span>}
          </div>
          <div className="flex items-center justify-between">
            <span>Profile Context:</span>
            {profileLoading ? <span className="text-yellow-600">Loading...</span> : profile ? <span className="text-green-600">Loaded (Profile: {profile.name})</span> : <span className="text-red-600">Not Loaded/No Profile</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Tests</CardTitle>
          <CardDescription>Simple checks for backend API endpoints.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <Button onClick={runVerifyCredentialApiTest} disabled={apiTestResult.status === 'running'}>
              Test 'verify-credential' API
            </Button>
            {apiTestResult.status !== 'idle' && renderTestResult(apiTestResult)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Feature Verification (Manual)</CardTitle>
          <CardDescription>Links to key areas for manual testing. Open links in a new tab.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <section>
            <h3 className="font-semibold text-lg mb-2">Authentication</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><NavLink to="/login">Login Page</NavLink></li>
              <li><NavLink to="/register">Signup Page</NavLink></li>
              <li><NavLink to="/forgot-password">Password Reset Page</NavLink></li>
              <li>Verify session persistence (login, close tab, reopen, check if still logged in).</li>
              <li>Verify role-based views (requires test accounts with different roles).</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">Profile & Networking</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><NavLink to="/profile">User Profile</NavLink> (view & edit options)</li>
              <li><NavLink to="/alumni-directory">Alumni Directory</NavLink> (search & filters)</li>
              <li>Connection requests (manual test if UI exists)</li>
              <li>Messaging (manual test if UI exists)</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">Content Features</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><NavLink to="/events">Events List</NavLink> (RSVP option)</li>
              <li><NavLink to="/jobs">Job Board</NavLink> (application function)</li>
              <li><NavLink to="/knowledge">Knowledge Hub</NavLink> (posting & viewing)</li>
              <li>Notification system (check for notifications after relevant actions)</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-lg mb-2">Advanced Features</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><NavLink to="/credentials">Credential Wallet</NavLink></li>
              <li>Mentorship Matching (if implemented)</li>
              <li><NavLink to="/admin/dashboard">Admin Dashboard</NavLink> (access for admin roles)</li>
            </ul>
          </section>
        </CardContent>
      </Card>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This page provides a basic sanity check. For comprehensive testing, detailed manual test cases or an automated testing suite would be required. Many features listed require manual interaction and observation.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SystemCheckDashboard;
