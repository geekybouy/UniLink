
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Google } from "lucide-react";

const AuthForms = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Card className="w-full max-w-md p-6 space-y-6 bg-white shadow-lg">
      <h2 className="text-3xl font-playfair text-center text-primary">
        {isLogin ? "Welcome Back" : "Join UniLink"}
      </h2>
      
      {isLogin ? (
        <form className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              className="w-full"
            />
          </div>
          <div className="text-right">
            <a href="#" className="text-sm text-primary hover:underline">
              Forgot Password?
            </a>
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90">
            Sign In
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full border-gray-300 hover:bg-gray-50"
          >
            <Google className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Full Name"
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Email"
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Confirm Password"
                className="w-full"
              />
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Sign Up
            </Button>
          </form>
        </div>
      )}
      
      <div className="text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-primary hover:underline"
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </Card>
  );
};

export default AuthForms;
