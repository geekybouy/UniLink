
import React, { useState, useEffect } from "react";
import PostCard from "@/components/dashboard/PostCard";
import { Spinner } from "@/components/ui/spinner";

// Demo user profiles
const demoUsers = [
  {
    id: "priya",
    name: "Priya Sharma",
    username: "priya.sharma",
    avatar: "https://randomuser.me/api/portraits/women/62.jpg",
    bio: "CSE, IIT Delhi",
    verified: true,
  },
  {
    id: "arjun",
    name: "Arjun Patel",
    username: "arjun.patel",
    avatar: "https://randomuser.me/api/portraits/men/56.jpg",
    bio: "MBA, IIM Bangalore",
  },
  {
    id: "sneha",
    name: "Sneha Gupta",
    username: "sneha.gupta",
    avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    bio: "BTech ECE, NIT Trichy",
  },
  {
    id: "rohit",
    name: "Rohit Singh",
    username: "rohit.singh",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    bio: "MSc Physics, DU",
  },
  {
    id: "kavya",
    name: "Kavya Nair",
    username: "kavya.nair",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    bio: "BCA, Christ University",
  },
  {
    id: "aditya",
    name: "Aditya Kumar",
    username: "aditya.kumar",
    avatar: "https://randomuser.me/api/portraits/men/29.jpg",
    bio: "BE Mechanical, BITS Pilani",
  },
  // Alumni
  {
    id: "rajesh",
    name: "Dr. Rajesh Mehta",
    username: "rajesh.mehta",
    avatar: "https://randomuser.me/api/portraits/men/64.jpg",
    bio: "Software Engineer at Google",
    verified: true,
  },
  {
    id: "ananya",
    name: "Ananya Joshi",
    username: "ananya.joshi",
    avatar: "https://randomuser.me/api/portraits/women/80.jpg",
    bio: "Product Manager at Flipkart",
  },
  {
    id: "vikram",
    name: "Vikram Reddy",
    username: "vikram.reddy",
    avatar: "https://randomuser.me/api/portraits/men/71.jpg",
    bio: "Founder at EdTech Startup",
  },
  {
    id: "meera",
    name: "Meera Shah",
    username: "meera.shah",
    avatar: "https://randomuser.me/api/portraits/women/99.jpg",
    bio: "Data Scientist at Microsoft",
  },
  {
    id: "sanjay",
    name: "Sanjay Iyer",
    username: "sanjay.iyer",
    avatar: "https://randomuser.me/api/portraits/men/37.jpg",
    bio: "Investment Banker at Goldman Sachs",
  },
];

// Helper to get user by username/id
const getUser = (id) => demoUsers.find(u => u.id === id);

// Demo posts
const forYouDemoPosts = [
  {
    id: "demo1",
    user_id: "priya",
    content: "Just got selected for Google Summer of Code! 🎉 #GSoC2024 #OpenSource",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    image_url: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    likes: 153,
    comments: 19,
    reposts: 10,
    bookmarks: 18,
    views: "2.5K",
  },
  {
    id: "demo2",
    user_id: "ananya",
    content: "Tech Fest 2024 registrations are now open! Don't miss out 🚀 #Techfest #CampusLife",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5h ago
    image_url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    likes: 102,
    comments: 13,
    reposts: 8,
    bookmarks: 8,
    views: "1.6K",
  },
  {
    id: "demo3",
    user_id: "arjun",
    content: "Excited to announce I'm joining Microsoft as SDE-1! Dream come true 💙 #IIMBangalore #IndianStudents",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1d ago
    likes: 882,
    comments: 56,
    reposts: 33,
    bookmarks: 22,
    views: "12.2K",
  },
  {
    id: "demo4",
    user_id: "meera",
    content: "Amazing experience interning at Tata Consultancy Services this summer #TCS #Internship",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3d ago
    image_url: "https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?auto=format&fit=crop&w=400&q=80",
    likes: 489,
    comments: 25,
    reposts: 17,
    bookmarks: 12,
    views: "8.4K",
  },
  {
    id: "demo5",
    user_id: "vikram",
    content: "5 tips that helped me crack my placement interviews 🧵 Thread: \n\n1️⃣ Network early\n2️⃣ Practice mock interviews\n3️⃣ Know your strengths\n4️⃣ Stay updated\n5️⃣ Stay confident",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1w ago
    likes: 2080,
    comments: 156,
    reposts: 89,
    bookmarks: 234,
    views: "45.6K",
  },
  {
    id: "demo6",
    user_id: "sneha",
    content: "Anyone familiar with Machine Learning algorithms? Need help with my project 🙏 #ML #NITTrichy",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2d ago
    likes: 31,
    comments: 6,
    reposts: 2,
    bookmarks: 6,
    views: "1.3K",
  },
];

const followingDemoPosts = [
  {
    id: "demo71",
    user_id: "kavya",
    content: "Defending my thesis on AI in Healthcare next week. Nervous but excited! 📚 #ChristUniversity",
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
    likes: 58,
    comments: 5,
    reposts: 4,
    bookmarks: 11,
    views: "1.2K",
  },
  {
    id: "demo72",
    user_id: "rajesh",
    content: "10 years since graduation – here’s what I wish I knew as a student #AlumniWisdom #TechCommunityIndia",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8d ago
    likes: 1289,
    comments: 138,
    reposts: 45,
    bookmarks: 136,
    views: "42.8K",
  },
  {
    id: "demo73",
    user_id: "rohit",
    content: "Late night coding sessions at the library with my team ☕️ #HackathonPrep #DULife",
    created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(), // 7h ago
    image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80",
    likes: 54,
    comments: 3,
    reposts: 5,
    bookmarks: 5,
    views: "2.3K",
  },
  {
    id: "demo74",
    user_id: "sanjay",
    content: "Career advice for juniors: find mentors early, set clear goals, and never stop learning! #Placements #GoldmanSachs #IIT",
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20h ago
    likes: 295,
    comments: 10,
    reposts: 13,
    bookmarks: 23,
    views: "7.1K",
  },
  {
    id: "demo75",
    user_id: "aditya",
    content: "Group project photo after our robotics demo! Proud moment for the entire BITS Pilani team 🤖🤝",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5d ago
    image_url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    likes: 175,
    comments: 8,
    reposts: 12,
    bookmarks: 17,
    views: "3.9K",
  },
];

// Map demo posts into AlumniPost shape used by PostCard
function mapDemoPost(post) {
  const user = getUser(post.user_id);
  return {
    id: post.id,
    user_id: post.user_id,
    content: post.content,
    image_url: post.image_url,
    created_at: post.created_at,
    // Fake per-post username, avatar, etc
    user: {
      full_name: user?.name,
      username: user?.username,
      graduation_year: undefined,
      avatar_url: user?.avatar,
      verified: !!user?.verified,
    },
    // Metrics for future features
    likes: post.likes,
    comments: post.comments,
    reposts: post.reposts,
    bookmarks: post.bookmarks,
    views: post.views,
  };
}

interface AlumniFeedProps {
  tab: "for-you" | "following";
}

const AlumniFeed: React.FC<AlumniFeedProps> = ({ tab }) => {
  const [loading, setLoading] = useState(true);
  const [demoPosts, setDemoPosts] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    // Simulate async load
    setTimeout(() => {
      setDemoPosts(
        tab === "for-you"
          ? forYouDemoPosts.map(mapDemoPost)
          : followingDemoPosts.map(mapDemoPost)
      );
      setLoading(false);
    }, 800);
  }, [tab]);

  if (loading) {
    return <div className="flex justify-center py-14"><Spinner /></div>;
  }
  if (!demoPosts.length) {
    return <div className="py-12 text-center text-muted-foreground">No posts yet. Start the conversation!</div>;
  }
  return (
    <div className="flex flex-col gap-4">
      {demoPosts.map((post) => (
        <PostCard post={post} key={post.id} />
      ))}
    </div>
  );
};

export default AlumniFeed;

