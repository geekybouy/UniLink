import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, Bell, Check, Info, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DesignSystem() {
  const { theme } = useTheme();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">UniLink Design System</h1>
        <p className="text-muted-foreground">
          A comprehensive component library with consistent styling for the UniLink platform.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Theme</h2>
        <ThemeToggle />
      </div>
      
      <Separator className="my-4" />
      
      {/* Colors */}
      <section id="colors" className="space-y-6">
        <h2 className="text-xl font-semibold">Colors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <ColorCard name="Primary" bgClass="bg-primary" textClass="text-primary-foreground" />
          <ColorCard name="Secondary" bgClass="bg-secondary" textClass="text-secondary-foreground" />
          <ColorCard name="Accent" bgClass="bg-accent" textClass="text-accent-foreground" />
          <ColorCard name="Muted" bgClass="bg-muted" textClass="text-muted-foreground" />
          <ColorCard name="Destructive" bgClass="bg-destructive" textClass="text-destructive-foreground" />
          <ColorCard name="Success" bgClass="bg-success" textClass="text-success-foreground" />
          <ColorCard name="Warning" bgClass="bg-warning" textClass="text-warning-foreground" />
          <ColorCard name="Info" bgClass="bg-info" textClass="text-info-foreground" />
        </div>
      </section>
      
      <Separator className="my-4" />
      
      {/* Typography */}
      <section id="typography" className="space-y-6">
        <h2 className="text-xl font-semibold">Typography</h2>
        <div className="space-y-4">
          <div>
            <h1>Heading 1</h1>
            <p className="text-sm text-muted-foreground">font-size: 2rem (32px)</p>
          </div>
          <div>
            <h2>Heading 2</h2>
            <p className="text-sm text-muted-foreground">font-size: 1.5rem (24px)</p>
          </div>
          <div>
            <h3>Heading 3</h3>
            <p className="text-sm text-muted-foreground">font-size: 1.25rem (20px)</p>
          </div>
          <div>
            <h4>Heading 4</h4>
            <p className="text-sm text-muted-foreground">font-size: 1.125rem (18px)</p>
          </div>
          <div>
            <p className="text-lg">Large Paragraph</p>
            <p className="text-sm text-muted-foreground">font-size: 1.125rem (18px)</p>
          </div>
          <div>
            <p>Regular Paragraph</p>
            <p className="text-sm text-muted-foreground">font-size: 1rem (16px)</p>
          </div>
          <div>
            <p className="text-sm">Small Text</p>
            <p className="text-sm text-muted-foreground">font-size: 0.875rem (14px)</p>
          </div>
          <div>
            <p className="text-xs">Extra Small Text</p>
            <p className="text-sm text-muted-foreground">font-size: 0.75rem (12px)</p>
          </div>
        </div>
      </section>
      
      <Separator className="my-4" />
      
      {/* Buttons */}
      <section id="buttons" className="space-y-6">
        <h2 className="text-xl font-semibold">Buttons</h2>
        
        <Tabs defaultValue="variants">
          <TabsList>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="sizes">Sizes</TabsTrigger>
            <TabsTrigger value="states">States</TabsTrigger>
            <TabsTrigger value="animations">Animations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="variants" className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="info">Info</Button>
              <Button variant="subtle">Subtle</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="sizes" className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
              <Button size="icon"><Bell /></Button>
              <Button size="icon-sm"><Bell /></Button>
              <Button size="icon-lg"><Bell /></Button>
            </div>
          </TabsContent>
          
          <TabsContent value="states" className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button disabled>Disabled</Button>
              <Button variant="outline" className="border-dashed">Dashed</Button>
              <Button className="shadow-lg">Elevated</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="animations" className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button animation="pulse">Pulse</Button>
              <Button animation="bounce">Bounce</Button>
              <Button className="animate-fade-in">Fade In</Button>
              <Button className="hover-lift">Lift on Hover</Button>
              <Button className="hover-scale">Scale on Hover</Button>
            </div>
          </TabsContent>
        </Tabs>
      </section>
      
      <Separator className="my-4" />
      
      {/* Cards */}
      <section id="cards" className="space-y-6">
        <h2 className="text-xl font-semibold">Cards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Basic card component with header, content and footer</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is the default card design with content inside.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>
          
          <Card variant="bordered" className="border-primary">
            <CardHeader>
              <CardTitle>Bordered Card</CardTitle>
              <CardDescription>Card with custom border styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card has a custom border color applied to it.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="outline">Action</Button>
            </CardFooter>
          </Card>
          
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Card with more pronounced shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card has a more prominent shadow applied.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="ghost">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="interactive" hoverEffect="lift">
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>Card that responds to interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card lifts on hover to indicate it's interactive.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="subtle">Learn More</Button>
            </CardFooter>
          </Card>

          <Card hoverEffect="scale" className="bg-gradient-brand text-white">
            <CardHeader>
              <CardTitle>Gradient Card</CardTitle>
              <CardDescription className="text-white/80">Card with gradient background</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card has a gradient background and scales on hover.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="default" className="bg-white text-primary hover:bg-white/90">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="ghost">
            <CardHeader>
              <CardTitle>Ghost Card</CardTitle>
              <CardDescription>Card without background</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This card has no background color or border.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="link">Learn More</Button>
            </CardFooter>
          </Card>
        </div>
      </section>
      
      <Separator className="my-4" />

      {/* Forms */}
      <section id="forms" className="space-y-6">
        <h2 className="text-xl font-semibold">Form Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Input Components</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default-input">Default Input</Label>
                <Input id="default-input" placeholder="Enter text here" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="disabled-input">Disabled Input</Label>
                <Input id="disabled-input" placeholder="Cannot edit this" disabled />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="invalid-input">Invalid Input</Label>
                <Input id="invalid-input" placeholder="Invalid input" className="border-destructive" />
                <p className="text-sm text-destructive">This field is required</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Interactive Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => {
                  toast({
                    title: "Action completed",
                    description: "Your action has been completed successfully.",
                  });
                }}
              >
                Show Default Toast
              </Button>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="success"
                  onClick={() => {
                    toast.success("Your changes have been saved successfully.");
                  }}
                >
                  <Check className="w-4 h-4" /> Success Toast
                </Button>
                
                <Button 
                  variant="destructive"
                  onClick={() => {
                    toast.error("An error occurred while saving your changes.");
                  }}
                >
                  <X className="w-4 h-4" /> Error Toast
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Dialog Example</Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmation</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to perform this action?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                      <Button variant="outline">Cancel</Button>
                      <Button>Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-4" />

      {/* Alerts & Badges */}
      <section id="alerts-badges" className="space-y-6">
        <h2 className="text-xl font-semibold">Alerts & Badges</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Alerts</h3>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                This action will be recorded for future reference.
              </AlertDescription>
            </Alert>
            
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Your session has expired. Please log in again.
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-success/20 text-success border-success">
              <Check className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Your profile has been updated successfully.
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-warning/20 text-warning border-warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Your account will expire in 3 days.
              </AlertDescription>
            </Alert>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Badges</h3>
            
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            
            <h4 className="text-base font-medium mt-4">Badge Sizes</h4>
            <div className="flex flex-wrap gap-2 items-center">
              <Badge size="sm">Small</Badge>
              <Badge size="default">Default</Badge>
              <Badge size="lg">Large</Badge>
            </div>
            
            <h4 className="text-base font-medium mt-4">Badge Rounding</h4>
            <div className="flex flex-wrap gap-2">
              <Badge rounded="sm">Square</Badge>
              <Badge rounded="default">Default</Badge>
              <Badge rounded="lg">Rounded</Badge>
            </div>
            
            <h4 className="text-base font-medium mt-4">Animated Badges</h4>
            <div className="flex flex-wrap gap-2">
              <Badge animation="pulse" variant="destructive">Pulse</Badge>
              <Badge animation="bounce" variant="success">Bounce</Badge>
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-4" />

      {/* Loading States */}
      <section id="loading-states" className="space-y-6">
        <h2 className="text-xl font-semibold">Loading States</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Loading Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-8">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Button Loading States</p>
                  <div className="flex gap-4">
                    <Button disabled className="flex gap-2">
                      <span className="animate-spin">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                      Loading...
                    </Button>
                    <Button disabled className="flex gap-2" variant="outline">
                      <span className="animate-spin">
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                      Processing...
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Custom Loaders</p>
                  <div className="flex items-center gap-6">
                    <div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div>
                    <div className="animate-pulse h-8 w-8 bg-primary rounded-full"></div>
                    <div className="animate-bounce h-8 w-8 bg-primary rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Skeleton Loading</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton variant="text" className="w-[250px]" />
                <Skeleton variant="text" className="w-full" />
                <Skeleton variant="text" className="w-[275px]" />
              </div>
              
              <div className="flex items-center space-x-4">
                <Skeleton variant="avatar" />
                <div className="space-y-2">
                  <Skeleton variant="text" className="h-4 w-[150px]" />
                  <Skeleton variant="text" className="h-4 w-[100px]" />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Skeleton variant="button" className="w-[80px]" />
                <Skeleton variant="button" className="w-[80px]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

// Helper component for the color swatches
function ColorCard({ name, bgClass, textClass }: { name: string, bgClass: string, textClass: string }) {
  return (
    <div className="space-y-2">
      <div className={`h-20 rounded-md ${bgClass} flex items-center justify-center ${textClass}`}>
        <span className="font-medium">{name}</span>
      </div>
      <p className="text-sm text-center">{name}</p>
    </div>
  );
}
