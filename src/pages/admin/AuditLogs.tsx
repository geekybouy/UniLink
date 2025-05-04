
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Download, Search, Filter } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  details: any;
  created_at: string;
  user_name: string;
}

const actionTypes = [
  'user.created',
  'user.updated',
  'user.deleted',
  'role.assigned',
  'role.removed',
  'content.created',
  'content.updated',
  'content.deleted',
  'content.approved',
  'content.rejected',
  'login.success',
  'login.failed',
  'settings.updated'
];

const entityTypes = [
  'user',
  'post',
  'comment',
  'event',
  'role',
  'system'
];

const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  // Mock data since we don't have an actual audit logs table
  useEffect(() => {
    const generateMockLogs = () => {
      const mockLogs: AuditLog[] = [];
      const users = [
        { id: '1', name: 'Admin User' },
        { id: '2', name: 'Moderator User' },
        { id: '3', name: 'Regular User' }
      ];
      
      const now = new Date();
      
      // Generate 50 mock logs
      for (let i = 0; i < 50; i++) {
        const daysAgo = Math.floor(Math.random() * 30); // Random day within last month
        const logDate = new Date();
        logDate.setDate(now.getDate() - daysAgo);
        
        const randomUserIndex = Math.floor(Math.random() * users.length);
        const randomUser = users[randomUserIndex];
        
        const randomActionIndex = Math.floor(Math.random() * actionTypes.length);
        const action = actionTypes[randomActionIndex];
        
        const randomEntityIndex = Math.floor(Math.random() * entityTypes.length);
        const entityType = entityTypes[randomEntityIndex];
        
        mockLogs.push({
          id: `log-${i}`,
          action,
          entity_type: entityType,
          entity_id: `entity-${Math.floor(Math.random() * 100)}`,
          user_id: randomUser.id,
          user_name: randomUser.name,
          details: { ip: '192.168.1.' + Math.floor(Math.random() * 255) },
          created_at: logDate.toISOString()
        });
      }
      
      return mockLogs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    };
    
    setTimeout(() => {
      const mockData = generateMockLogs();
      setLogs(mockData);
      setFilteredLogs(mockData);
      setLoading(false);
    }, 1000); // Simulate API call delay
  }, []);
  
  // Apply filters whenever filter criteria change
  useEffect(() => {
    let result = [...logs];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log => 
        log.user_name.toLowerCase().includes(query) || 
        log.action.toLowerCase().includes(query) ||
        log.entity_type.toLowerCase().includes(query) ||
        log.entity_id.toLowerCase().includes(query)
      );
    }
    
    // Apply action filter
    if (actionFilter !== 'all') {
      result = result.filter(log => log.action === actionFilter);
    }
    
    // Apply entity filter
    if (entityFilter !== 'all') {
      result = result.filter(log => log.entity_type === entityFilter);
    }
    
    // Apply date range filter
    if (dateRange?.from) {
      const from = new Date(dateRange.from);
      from.setHours(0, 0, 0, 0);
      
      result = result.filter(log => {
        const logDate = new Date(log.created_at);
        return logDate >= from;
      });
      
      if (dateRange.to) {
        const to = new Date(dateRange.to);
        to.setHours(23, 59, 59, 999);
        
        result = result.filter(log => {
          const logDate = new Date(log.created_at);
          return logDate <= to;
        });
      }
    }
    
    setFilteredLogs(result);
  }, [logs, searchQuery, actionFilter, entityFilter, dateRange]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleActionFilterChange = (value: string) => {
    setActionFilter(value);
  };
  
  const handleEntityFilterChange = (value: string) => {
    setEntityFilter(value);
  };
  
  const handleResetFilters = () => {
    setSearchQuery('');
    setActionFilter('all');
    setEntityFilter('all');
    setDateRange(undefined);
  };
  
  const handleExportLogs = () => {
    // Convert the filtered logs to CSV format
    const headers = ['Date', 'User', 'Action', 'Entity Type', 'Entity ID', 'Details'];
    
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.user_name,
        log.action,
        log.entity_type,
        log.entity_id,
        JSON.stringify(log.details).replace(/,/g, ';') // Replace commas in JSON to avoid CSV issues
      ].join(','))
    ].join('\n');
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `audit_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success(`Exported ${filteredLogs.length} logs to CSV`);
  };
  
  const getActionBadgeVariant = (action: string) => {
    if (action.includes('created') || action.includes('approved') || action.includes('success')) {
      return 'success';
    }
    if (action.includes('updated')) {
      return 'default';
    }
    if (action.includes('deleted') || action.includes('rejected') || action.includes('failed')) {
      return 'destructive';
    }
    return 'secondary';
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Loading audit logs...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        
        <Button variant="outline" onClick={handleExportLogs}>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 items-end mb-6">
        <div className="space-y-2">
          <span className="text-sm">Search</span>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search logs..." 
              value={searchQuery} 
              onChange={handleSearch} 
              className="pl-8 min-w-[250px]"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <span className="text-sm">Action</span>
          <Select value={actionFilter} onValueChange={handleActionFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {actionTypes.map(action => (
                <SelectItem key={action} value={action}>{action}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <span className="text-sm">Entity Type</span>
          <Select value={entityFilter} onValueChange={handleEntityFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entityTypes.map(entity => (
                <SelectItem key={entity} value={entity}>{entity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <span className="text-sm">Date Range</span>
          <DateRangePicker 
            value={dateRange} 
            onChange={setDateRange}
          />
        </div>
        
        <Button variant="ghost" onClick={handleResetFilters}>
          Reset Filters
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length > 0 ? filteredLogs.map(log => (
              <TableRow key={log.id}>
                <TableCell>
                  {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                </TableCell>
                <TableCell>{log.user_name}</TableCell>
                <TableCell>
                  <Badge variant={getActionBadgeVariant(log.action) as any}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell>{log.entity_type}</TableCell>
                <TableCell className="font-mono text-xs">
                  {log.entity_id}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {log.details.ip}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  No audit logs found matching the specified criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredLogs.length} of {logs.length} total logs
      </div>
    </div>
  );
};

export default AuditLogs;
