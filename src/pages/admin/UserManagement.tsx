
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, UserX, AlertCircle, Search, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// Import UserRole from AuthContext
import { UserRole } from '@/contexts/AuthContext';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  roles: UserRole[];
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery]);

  // Fix role assignment function
  const assignRole = async (role: UserRole) => {
    if (!currentUser) return;
    
    try {
      setIsSubmitting(true);
      
      // First check if the role already exists
      const { data, error: fetchError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('role', role);
      
      if (fetchError) throw fetchError;
      
      // If role doesn't exist, add it
      if (!data || data.length === 0) {
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: currentUser.id,
            role: role as any // Type cast to handle potential mismatch
          });
        
        if (error) throw error;
      }
      
      // Refresh roles
      await fetchUserRoles(currentUser.id);
      toast({
        title: "Role assigned",
        description: `${role} role assigned to user successfully.`,
      });
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: `Failed to assign role: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeRole = async (userId: string, role: UserRole) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) throw error;
      
      // Refresh roles
      await fetchUserRoles(userId);
      toast({
        title: "Role removed",
        description: `${role} role removed successfully.`,
      });
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: `Failed to remove role: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const roles = data?.map(r => r.role as UserRole) || [];
      
      // Update the roles in the users state
      setUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, roles } : user
        )
      );
      
      // Also update currentUser if it's the same user
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, roles } : null);
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Count total users for pagination
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .ilike('full_name', `%${searchQuery}%`);
      
      if (countError) throw countError;
      
      if (count !== null) {
        setTotalPages(Math.ceil(count / usersPerPage));
      }
      
      // Fetch users with pagination
      const from = (currentPage - 1) * usersPerPage;
      const to = from + usersPerPage - 1;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', `%${searchQuery}%`)
        .range(from, to)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Initialize users with empty role arrays
        const usersWithEmptyRoles = data.map(user => ({
          id: user.user_id as string,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          roles: [] as UserRole[],
          created_at: user.created_at || new Date().toISOString()
        }));
        
        setUsers(usersWithEmptyRoles);
        
        // Fetch roles for each user
        for (const user of usersWithEmptyRoles) {
          await fetchUserRoles(user.id);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update pagination handlers with proper types
  const handlePageChange = (page: number) => {
    // Convert string to number for pagination
    setCurrentPage(page);
  };

  const goToPage = (page: number) => {
    // Convert string to number for pagination
    setCurrentPage(page);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage users, assign roles, and review account status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center p-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center p-8 border rounded-md">
                <p className="text-muted-foreground">No users found.</p>
              </div>
            ) : (
              <ScrollArea className="h-[60vh]">
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">User</th>
                        <th className="py-3 px-4 text-left font-medium">Email</th>
                        <th className="py-3 px-4 text-left font-medium">Roles</th>
                        <th className="py-3 px-4 text-left font-medium">Created</th>
                        <th className="py-3 px-4 text-left font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar_url || ''} />
                                <AvatarFallback>{user.full_name?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>{user.full_name || 'Unknown User'}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">{user.email}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {user.roles && user.roles.length > 0 ? (
                                user.roles.map((role) => (
                                  <Badge key={role} variant="outline" className="capitalize">
                                    {role}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="outline">No roles</Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setCurrentUser(user)}
                                  >
                                    <UserPlus className="h-4 w-4 mr-1" />
                                    Manage Roles
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Manage User Roles</DialogTitle>
                                    <DialogDescription>
                                      Assign or remove roles for {currentUser?.full_name || 'this user'}
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="mt-4">
                                    <h4 className="font-medium mb-2">Current Roles</h4>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                      {currentUser?.roles && currentUser.roles.length > 0 ? (
                                        currentUser.roles.map((role) => (
                                          <Badge key={role} className="capitalize flex items-center gap-1">
                                            {role}
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-4 w-4 p-0 ml-1"
                                              onClick={() => removeRole(currentUser.id, role)}
                                              disabled={isSubmitting}
                                            >
                                              <XCircle className="h-3 w-3" />
                                            </Button>
                                          </Badge>
                                        ))
                                      ) : (
                                        <Badge variant="outline">No roles assigned</Badge>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="mt-4">
                                    <h4 className="font-medium mb-2">Assign New Role</h4>
                                    <div className="flex flex-wrap gap-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => assignRole('student')}
                                        disabled={isSubmitting || (currentUser?.roles || []).includes('student')}
                                      >
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Student
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => assignRole('alumni')}
                                        disabled={isSubmitting || (currentUser?.roles || []).includes('alumni')}
                                      >
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Alumni
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => assignRole('faculty')}
                                        disabled={isSubmitting || (currentUser?.roles || []).includes('faculty')}
                                      >
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Faculty
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => assignRole('moderator')}
                                        disabled={isSubmitting || (currentUser?.roles || []).includes('moderator')}
                                      >
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Moderator
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => assignRole('admin')}
                                        disabled={isSubmitting || (currentUser?.roles || []).includes('admin')}
                                      >
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Admin
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <DialogFooter className="mt-4">
                                    <DialogClose asChild>
                                      <Button variant="secondary">Close</Button>
                                    </DialogClose>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600 cursor-pointer">
                                    <AlertCircle className="mr-2 h-4 w-4" /> Disable Account
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600 cursor-pointer">
                                    <AlertCircle className="mr-2 h-4 w-4" /> Delete Account
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            )}
            
            {/* Pagination */}
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1} 
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages).keys()].map((page) => (
                    <PaginationItem key={page + 1}>
                      <PaginationLink
                        onClick={() => goToPage(page + 1)}
                        isActive={currentPage === page + 1}
                      >
                        {page + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages} 
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
