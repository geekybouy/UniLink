
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Newspaper } from "lucide-react";

// Expanded demo posts
const mockPosts = [
  {
    id: 1,
    user: "Sarah Chen",
    content: "Just landed my dream job at Google! Grateful for UniLink community 🥳",
    time: "2h ago",
  },
  {
    id: 2,
    user: "Amit Verma",
    content: "Great alumni meetup in London this weekend!",
    time: "1d ago",
  },
  {
    id: 3,
    user: "Li Zhang",
    content: "Excited to announce my MBA admission at Stanford! 🚀",
    time: "5h ago",
  },
  {
    id: 4,
    user: "Anya Patel",
    content: "Launching a new AI startup - looking for collaborators!",
    time: "22m ago",
  },
  {
    id: 5,
    user: "Karan Singh",
    content: "Presented at the Global Research Conference 2025, thanks to everyone who helped along the way.",
    time: "3d ago",
  },
];

const AlumniFeedWidget = () => (
  <Card className="shadow-soft rounded-xl">
    <CardHeader className="flex flex-row items-center gap-2 pb-3">
      <Newspaper className="w-5 h-5 text-primary" />
      <CardTitle className="text-lg font-semibold tracking-tight">Alumni Feed</CardTitle>
    </CardHeader>
    <CardContent>
      {mockPosts.length === 0 ? (
        <div className="text-muted-foreground text-sm py-6 text-center">
          No updates yet. Share something with your network!
        </div>
      ) : (
        <ul className="space-y-4">
          {mockPosts.map(post => (
            <li key={post.id} className="bg-accent/30 p-3 rounded-lg">
              <div className="font-medium">{post.user}</div>
              <div className="text-muted-foreground text-sm mb-1">{post.content}</div>
              <span className="text-xs text-muted-foreground">{post.time}</span>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

export default AlumniFeedWidget;

