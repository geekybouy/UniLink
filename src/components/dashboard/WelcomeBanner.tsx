
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function WelcomeBanner() {
  const { user } = useAuth();
  return (
    <Card className="bg-gradient-to-l from-primary via-indigo-600 to-blue-500 text-white shadow-soft relative overflow-hidden mb-2 flex items-center min-h-[100px]">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 p-4 md:p-6">
        <CardTitle className="text-xl font-bold">
          Welcome, {user?.user_metadata?.full_name?.split(" ")[0] || "Alumnus"}!
        </CardTitle>
        <div className="mt-1 md:mt-0 md:ml-3 text-base font-medium">
          Ready to grow your network?
        </div>
      </CardHeader>
      <CardContent className="flex-grow"></CardContent>
      <span className="absolute opacity-10 right-5 bottom-0 text-8xl font-black pointer-events-none select-none">🌐</span>
    </Card>
  );
}
