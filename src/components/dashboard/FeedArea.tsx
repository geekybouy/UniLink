
import React, { useState } from "react";
import PostComposer from "@/components/dashboard/PostComposer";
import AlumniFeed from "@/components/dashboard/AlumniFeed";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function FeedArea() {
  const [tab, setTab] = useState("for-you");
  // No need to conditionally render QuickActions or stat cards anymore

  return (
    <section className="w-full max-w-[620px] mx-auto">
      <div className="bg-background/90 sticky top-0 z-10">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="relative bg-accent/30 backdrop-blur rounded-xl flex mb-2 px-2 py-1 h-12 w-[330px] mx-auto">
            <TabsTrigger value="for-you" className="px-7 !rounded-full text-base font-semibold">For You</TabsTrigger>
            <TabsTrigger value="following" className="px-7 !rounded-full text-base font-semibold">Following</TabsTrigger>
            {/* Animated underline indicator */}
            <span
              className={`absolute bottom-0 left-0 w-1/2 h-1 rounded-t-full bg-primary transition-transform duration-300`}
              style={{ transform: tab === "for-you" ? "translateX(0%)" : "translateX(100%)" }}
              aria-hidden
            />
          </TabsList>
          <TabsContent value="for-you">
            <PostComposer />
            <AlumniFeed tab="for-you" />
          </TabsContent>
          <TabsContent value="following">
            <PostComposer />
            <AlumniFeed tab="following" />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
