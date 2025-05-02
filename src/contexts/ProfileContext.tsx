
// Update the useEffect that uses userId with user?.id instead

useEffect(() => {
  if (user?.id) {  // Use user?.id instead of userId
    fetchUserProfile();
  }
}, [user]); // Changed from [userId]
