
import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Download, Filter, Search } from "lucide-react";
import { DesignSystem } from "@/components/DesignSystem";

interface AuditEvent {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  status: "success" | "warning" | "error";
}

const mockData: AuditEvent[] = [
  {
    id: "1",
    user: "admin@example.com",
    action: "User login",
    resource: "auth/login",
    timestamp: "2025-05-04T10:23:45",
    status: "success",
  },
  {
    id: "2",
    user: "john.doe@example.com",
    action: "Updated profile",
    resource: "users/profile",
    timestamp: "2025-05-04T09:15:22",
    status: "success",
  },
  {
    id: "3",
    user: "jane.smith@example.com",
    action: "Failed login attempt",
    resource: "auth/login",
    timestamp: "2025-05-04T08:45:11",
    status: "error",
  },
  {
    id: "4",
    user: "admin@example.com",
    action: "Created new role",
    resource: "admin/roles",
    timestamp: "2025-05-03T16:32:10",
    status: "success",
  },
  {
    id: "5",
    user: "sarah.jones@example.com",
    action: "Deleted post",
    resource: "content/posts",
    timestamp: "2025-05-03T14:18:33",
    status: "warning",
  },
];

const AuditLogs = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showDesignSystem, setShowDesignSystem] = useState(false);

  // Filter logs based on search and active tab
  const filteredLogs = mockData.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" || activeTab === log.status;

    return matchesSearch && matchesTab;
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleExport = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, this would trigger a download
      alert("Logs have been exported successfully!");
    }, 1500);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (showDesignSystem) {
    return (
      <div>
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="text-2xl font-bold">Design System</h1>
          <Button onClick={() => setShowDesignSystem(false)}>
            Back to Audit Logs
          </Button>
        </div>
        <DesignSystem />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            View and analyze all system events and user activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            onClick={() => setShowDesignSystem(true)}
          >
            View Design System
          </Button>
        </div>
      </div>

      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <CardTitle>Filter Logs</CardTitle>
          <CardDescription>Search and filter audit logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, or resource..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-9"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Advanced Filters
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleExport}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export
            </Button>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Logs</TabsTrigger>
              <TabsTrigger value="success">Success</TabsTrigger>
              <TabsTrigger value="warning">Warnings</TabsTrigger>
              <TabsTrigger value="error">Errors</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Log Events</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {mockData.length} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 px-4 py-3 bg-muted/50 text-sm font-medium">
              <div className="col-span-3">User</div>
              <div className="col-span-3">Action</div>
              <div className="col-span-2">Resource</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Timestamp</div>
            </div>
            
            <div className="divide-y">
              {filteredLogs.map((log) => (
                <div key={log.id} className="grid grid-cols-12 px-4 py-3 hover:bg-muted/40 transition-colors">
                  <div className="col-span-3 text-sm">{log.user}</div>
                  <div className="col-span-3 text-sm">{log.action}</div>
                  <div className="col-span-2 text-sm">{log.resource}</div>
                  <div className="col-span-2">
                    <Badge
                      variant={
                        log.status === "success"
                          ? "success"
                          : log.status === "warning"
                          ? "warning"
                          : "destructive"
                      }
                      className="font-normal"
                    >
                      {log.status}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {formatDate(log.timestamp)}
                  </div>
                </div>
              ))}
              
              {filteredLogs.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-muted-foreground">No logs found matching your criteria</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm">Previous</Button>
        <div className="text-sm text-muted-foreground">Page 1 of 1</div>
        <Button variant="outline" size="sm">Next</Button>
      </div>
    </div>
  );
};

export default AuditLogs;
