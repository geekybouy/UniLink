
import { Heart, MessageCircle, Share2, Plus } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PostCard from '@/components/PostCard';
import BottomNav from '@/components/BottomNav';

const mockPosts = [
  {
    id: 1,
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
      batchYear: "2020"
    },
    timestamp: "2h ago",
    content: "Just landed my dream job at Google! Grateful for all the connections and support from my UniLink network. #CareerMilestone",
    likes: 42,
    comments: [
      { author: "Mike Wilson", text: "Congratulations! Well deserved! 🎉" }
    ]
  },
  {
    id: 2,
    author: {
      name: "David Kumar",
      avatar: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1",
      batchYear: "2019"
    },
    timestamp: "5h ago",
    content: "Organizing an alumni meetup next month in San Francisco. Who's in? Drop a comment if you'd like to join! 🌉",
    likes: 28,
    comments: [
      { author: "Lisa Zhang", text: "Count me in! 🙋‍♀️" }
    ]
  }
];

const Feed = () => {
  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center">
          <h1 className="text-2xl font-playfair text-primary font-bold">UniLink</h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-20">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-4">
            {mockPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </ScrollArea>

        {/* New Post FAB */}
        <Button
          size="icon"
          className="fixed bottom-20 right-4 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Feed;
