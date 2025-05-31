import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  User, 
  UserPlus, 
  Users, 
  BookOpen, 
  Shield, 
  UserCog, 
  MessageCircle, 
  Briefcase,
  Bell,
  Calendar,
  Home,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useMessaging } from '@/contexts/MessagingContext';
import { MessagingBadge } from '@/components/messaging/MessagingBadge';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import ProfileDropdown from "@/components/profile/ProfileDropdown";

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { totalUnreadMessages } = useMessaging();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Listen to scroll events to modify header appearance
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 w-full bg-background/95 backdrop-blur-sm border-b z-50 transition-all duration-200",
        scrolled ? "shadow-md border-border" : "border-transparent"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and desktop navigation */}
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="text-2xl font-playfair text-primary font-bold">
              UniLink
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <Link to="/dashboard" className={cn(
                      navigationMenuTriggerStyle(),
                      location.pathname === '/dashboard' && "bg-primary/10 text-primary"
                    )}>
                      Home
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={
                      location.pathname === '/alumni-directory' && "bg-primary/10 text-primary"
                    }>
                      Community
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        <li className="row-span-3">
                          <NavigationMenuLink asChild>
                            <Link
                              to="/alumni-directory"
                              className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/20 to-primary/50 p-6 no-underline outline-none focus:shadow-md"
                            >
                              <Users className="h-6 w-6 text-primary" />
                              <div className="mb-2 mt-4 text-lg font-medium text-primary">
                                Alumni Directory
                              </div>
                              <p className="text-sm leading-tight text-primary/90">
                                Browse and connect with graduates from your university
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                        <NavigationLink 
                          to="/network" 
                          title="My Network" 
                          description="View and manage your connections"
                          icon={UserPlus}
                        />
                        <NavigationLink 
                          to="/events" 
                          title="Events" 
                          description="Discover upcoming alumni gatherings"
                          icon={Calendar}
                        />
                        <NavigationLink 
                          to="/knowledge" 
                          title="Knowledge Hub" 
                          description="Shared resources and discussions"
                          icon={BookOpen}
                        />
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={
                      location.pathname.includes('/jobs') && "bg-primary/10 text-primary"
                    }>
                      Careers
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                        <NavigationLink 
                          to="/jobs" 
                          title="Job Listings" 
                          description="Browse opportunities posted by alumni"
                          icon={Briefcase}
                        />
                        <NavigationLink 
                          to="/my-applications" 
                          title="My Applications" 
                          description="Track your job applications"
                          icon={Briefcase}
                        />
                        <NavigationLink 
                          to="/cv-maker" 
                          title="CV Builder" 
                          description="Create and manage your resume"
                          icon={BookOpen}
                        />
                        <NavigationLink 
                          to="/jobs/post" 
                          title="Post a Job" 
                          description="Share opportunities with the network"
                          icon={Briefcase}
                        />
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link to="/credential-wallet" className={cn(
                      navigationMenuTriggerStyle(),
                      location.pathname === '/credential-wallet' && "bg-primary/10 text-primary"
                    )}>
                      Credentials
                    </Link>
                  </NavigationMenuItem>

                  <NavigationMenuItem>
                    <Link to="/messages" className={cn(
                      navigationMenuTriggerStyle(),
                      location.pathname === '/messages' && "bg-primary/10 text-primary"
                    )}>
                      Messages
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden md:inline-flex"
              onClick={() => setShowSearchDialog(true)}
            >
              <Search className="h-5 w-5 text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground hidden sm:inline-block">
                Search...
              </span>
              <kbd className="ml-2 hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden" 
              onClick={() => setShowSearchDialog(true)}
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>

            <CommandDialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
              <CommandInput placeholder="Search people, jobs, events..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="People">
                  <CommandItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>John Smith</span>
                  </CommandItem>
                  <CommandItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Sarah Johnson</span>
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Jobs">
                  <CommandItem>
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Software Engineer at TechCorp</span>
                  </CommandItem>
                  <CommandItem>
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>Marketing Manager at BrandCo</span>
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Events">
                  <CommandItem>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Annual Alumni Meetup</span>
                  </CommandItem>
                  <CommandItem>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Career Fair 2023</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </CommandDialog>
            
            <Link to="/messages" className="relative hidden md:block">
              <Button variant="ghost" size="sm" className="relative">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
                <MessagingBadge />
              </Button>
            </Link>
            
            <div className="hidden md:block">
              <NotificationsDropdown />
            </div>
            
            {/* Replace old avatar/dropdown with new ProfileDropdown */}
            <div className="hidden md:block">
              <ProfileDropdown />
            </div>

            {/* Mobile menu trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden px-2">
                  <Menu className="h-5 w-5 text-muted-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 bg-background text-foreground">
                <div className="flex flex-col h-full">
                  {/* Mobile menu header */}
                  <div className="flex items-center justify-between border-b border-border p-4">
                    <span className="text-lg font-medium text-foreground">Menu</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </div>

                  {/* Mobile menu content */}
                  <div className="flex-1 overflow-auto py-2">
                    <div className="flex items-center px-4 py-2 mb-4">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={profile?.profile_image_url || ''} />
                        <AvatarFallback>
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{profile?.name || user?.email}</div>
                        <Link 
                          to="/profile" 
                          className="text-xs text-muted-foreground hover:underline"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          View profile
                        </Link>
                      </div>
                    </div>
                    
                    <MobileNavLink 
                      to="/dashboard" 
                      icon={Home}
                      current={location.pathname === '/dashboard'}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Home
                    </MobileNavLink>
                    
                    <div className="pt-2 pb-1 px-3 text-xs font-medium text-muted-foreground">
                      Community
                    </div>
                    <MobileNavLink 
                      to="/alumni-directory" 
                      icon={Users}
                      current={location.pathname === '/alumni-directory'}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Alumni Directory
                    </MobileNavLink>
                    <MobileNavLink 
                      to="/network" 
                      icon={UserPlus}
                      current={location.pathname === '/network'}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Network
                    </MobileNavLink>
                    <MobileNavLink 
                      to="/events" 
                      icon={Calendar}
                      current={location.pathname.includes('/events')}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Events
                    </MobileNavLink>
                    <MobileNavLink 
                      to="/knowledge" 
                      icon={BookOpen}
                      current={location.pathname.includes('/knowledge')}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Knowledge Hub
                    </MobileNavLink>

                    <div className="pt-2 pb-1 px-3 text-xs font-medium text-muted-foreground">
                      Careers
                    </div>
                    <MobileNavLink 
                      to="/jobs" 
                      icon={Briefcase}
                      current={location.pathname.includes('/jobs')}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Job Listings
                    </MobileNavLink>
                    <MobileNavLink 
                      to="/my-applications" 
                      icon={Briefcase}
                      current={location.pathname === '/my-applications'}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Applications
                    </MobileNavLink>
                    <MobileNavLink 
                      to="/cv-maker" 
                      icon={BookOpen}
                      current={location.pathname === '/cv-maker'}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      CV Builder
                    </MobileNavLink>
                    
                    <div className="pt-2 pb-1 px-3 text-xs font-medium text-muted-foreground">
                      Quick Access
                    </div>
                    <MobileNavLink 
                      to="/credential-wallet" 
                      icon={Shield}
                      current={location.pathname === '/credential-wallet'}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Credentials Wallet
                    </MobileNavLink>
                    <MobileNavLink 
                      to="/messages" 
                      icon={MessageCircle}
                      current={location.pathname === '/messages'}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Messages
                      {totalUnreadMessages > 0 && (
                        <span className="ml-auto bg-primary text-white px-1.5 rounded-full text-xs">
                          {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                        </span>
                      )}
                    </MobileNavLink>
                    <MobileNavLink 
                      to="/privacy-settings" 
                      icon={UserCog}
                      current={location.pathname === '/privacy-settings'}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Privacy Settings
                    </MobileNavLink>
                  </div>
                  
                  {/* Mobile menu footer */}
                  <div className="border-t p-4">
                    <Button 
                      className="w-full" 
                      variant="destructive" 
                      onClick={handleSignOut}
                    >
                      Log out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

type NavigationLinkProps = {
  to: string;
  title: string;
  description: string;
  icon: React.ElementType;
};

const NavigationLink = ({ to, title, description, icon: Icon }: NavigationLinkProps) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={to}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <div className="text-sm font-medium leading-none">{title}</div>
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {description}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};

type MobileNavLinkProps = {
  to: string;
  children: React.ReactNode;
  icon: React.ElementType;
  current: boolean;
  onClick: () => void;
};

const MobileNavLink = ({ to, children, icon: Icon, current, onClick }: MobileNavLinkProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm rounded-md my-1 mx-2",
        current 
          ? "bg-primary/10 text-primary font-medium" 
          : "hover:bg-secondary transition-colors"
      )}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" />
      <span>{children}</span>
    </Link>
  );
};

export default Header;
