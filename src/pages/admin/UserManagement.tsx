
// Fix TypeScript errors in UserManagement.tsx
// Specifically for role handling and pagination

// Update role assignment function
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

// Update pagination handlers with proper types
const handlePageChange = (page: string) => {
  // Convert string to number for pagination
  setCurrentPage(parseInt(page, 10));
};

const goToPage = (page: string) => {
  // Convert string to number for pagination
  setCurrentPage(parseInt(page, 10));
};
