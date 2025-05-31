import React, { useState, useRef, useEffect } from "react";
import { X, Search, User, MessageSquare, Briefcase, Calendar, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Solid color backgrounds for overlay (light/dark)
// Helper for dark mode check (tailwind dark mode is toggled via 'dark' class on html)
function isDarkMode() {
  return document.documentElement.classList.contains("dark");
}

// Dummy suggestion data (Indian names, posts, etc)
const peopleSuggestions = [
  {
    name: "Priya Sharma",
    username: "priya.sharma",
    avatar: "https://randomuser.me/api/portraits/women/62.jpg",
    bio: "CSE, IIT Delhi"
  },
  {
    name: "Arjun Patel",
    username: "arjun.patel",
    avatar: "https://randomuser.me/api/portraits/men/56.jpg",
    bio: "MBA, IIM Bangalore"
  },
  {
    name: "Sneha Gupta",
    username: "sneha.gupta",
    avatar: "https://randomuser.me/api/portraits/women/43.jpg",
    bio: "BTech ECE, NIT Trichy"
  },
];

const postSuggestions = [
  {
    author: "Meera Shah",
    avatar: "https://randomuser.me/api/portraits/women/99.jpg",
    content: "Excited to start at Microsoft! #DreamJob #IITAlumni",
    image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
  },
  {
    author: "Rohit Singh",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    content: "Late night coding sessions at DU campus #HackathonPrep",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80",
  }
];

const trending = [
  "#CampusPlacements", "#IITDelhi", "#GSoC2024", "#Techfest", "#IndianStudents"
];

const filters = [
  { label: "People", icon: User },
  { label: "Posts", icon: MessageSquare },
  { label: "Jobs", icon: Briefcase },
  { label: "Events", icon: Calendar },
  { label: "Alumni", icon: Users }
];

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void; }) {
  const [query, setQuery] = useState("");
  const [filterIndex, setFilterIndex] = useState(0);
  const [recent, setRecent] = useState(["IIT Bombay", "#GSoC2024", "Priya Sharma"]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Background classes
  const overlayBg = isDarkMode()
    ? "bg-[#1A1A1A]"
    : "bg-[#FFFFFF]";
  const overlayText = isDarkMode()
    ? "text-[#F7FAFC]"
    : "text-[#2D3748]";
  const sectionTitleText = isDarkMode()
    ? "text-[#CBD5E1]"
    : "text-[#4A5568]";
  const badgeBg = isDarkMode()
    ? "bg-[#2D3748]"
    : "bg-[#F7FAFC]";
  const filterActive = "bg-primary text-white shadow font-semibold";
  const filterInactive = isDarkMode()
    ? "text-[#CBD5E1] hover:bg-[#2D3748]"
    : "text-[#6B7280] hover:bg-[#F8F9FA]";

  // Search logic, dummy for now
  const filteredPeople = peopleSuggestions.filter(p =>
    (!query || p.name.toLowerCase().includes(query.toLowerCase()) || p.username.toLowerCase().includes(query.toLowerCase()))
  );
  const filteredPosts = postSuggestions.filter(p =>
    (!query || p.content.toLowerCase().includes(query.toLowerCase()))
  );

  function handleSearch(term?: string) {
    if (term) setQuery(term);
    if (term && !recent.includes(term)) setRecent(r => [term, ...r.slice(0, 4)]);
  }

  function handleDeleteRecent(idx: number) {
    setRecent(r => r.filter((_, i) => i !== idx));
  }

  // Keyboard nav support (basic)
  // ... keep this feature minimal for now

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] transition-all duration-200 flex items-center justify-center`}
      style={{
        background: isDarkMode()
          ? "rgba(26,26,26,0.99)"
          : "rgba(255,255,255,0.97)",
        // High z-index + subtle shadow
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <div
        className={`relative w-full max-w-2xl mx-auto rounded-2xl border border-border shadow-lg ${overlayBg} ${overlayText}`}
        style={{
          minHeight: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          outline: "none",
        }}
        tabIndex={-1}
      >
        {/* Top bar */}
        <div className="flex items-center border-b border-border px-4 py-3 bg-transparent">
          <Search className="h-5 w-5 mr-3 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className={`text-lg bg-[${isDarkMode() ? "#2D3748" : "#F8F9FA"}] border border-border rounded-md px-4 py-2 focus:ring-2 focus:ring-primary w-full ${overlayText}`}
            placeholder="Search UniLink..."
            aria-label="Search"
            style={{ background: isDarkMode() ? "#2D3748" : "#F8F9FA" }}
          />
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close search">
            <X className="h-6 w-6" />
          </Button>
        </div>
        {/* Filters */}
        <div className="flex gap-2 px-4 py-2 border-b border-border">
          {filters.map((f, idx) =>
            <button
              key={f.label}
              className={`flex gap-2 items-center px-4 py-1.5 rounded-full text-base transition focus:outline-none ${
                filterIndex === idx ? filterActive : filterInactive
              }`}
              onClick={() => setFilterIndex(idx)}
              tabIndex={0}
            >
              <f.icon className="h-5 w-5" />
              {f.label}
            </button>
          )}
        </div>
        <div className="overflow-y-auto max-h-[58vh] px-4 pt-4 pb-6">
          {/* Recent Searches */}
          {(!query && recent.length > 0) && (
            <div className="mb-5">
              <div className={`text-xs font-semibold uppercase mb-3 ${sectionTitleText}`}>Recent Searches</div>
              <div className="flex flex-wrap gap-2">
                {recent.map((term, idx) => (
                  <div key={idx} className={`flex items-center gap-1 px-2 py-1 rounded-full ${badgeBg} border shadow text-sm`}>
                    <span className="cursor-pointer" onClick={() => handleSearch(term)}>{term}</span>
                    <button
                      className="ml-1 text-muted-foreground hover:text-destructive/90 p-0.5 rounded-full"
                      aria-label="Remove from history"
                      onClick={() => handleDeleteRecent(idx)}
                      tabIndex={0}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Trending */}
          {(!query && trending.length > 0) && (
            <div className="mb-5">
              <div className={`text-xs font-semibold uppercase mb-3 ${sectionTitleText}`}>Trending</div>
              <div className="flex flex-wrap gap-2">
                {trending.map((t, idx) => (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:scale-[1.05] transition"
                    key={idx}
                    onClick={() => handleSearch(t)}
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {/* Suggestions */}
          {filterIndex === 0 && (
            <div>
              <div className={`mb-2 text-xs font-semibold uppercase ${sectionTitleText}`}>{query ? "People Results" : "Suggested People"}</div>
              {filteredPeople.length === 0 && <div className="text-sm py-8 text-center text-muted-foreground">No people found</div>}
              {filteredPeople.map((p, idx) => (
                <div key={p.username} className="flex items-center gap-3 py-2 px-2 rounded-lg cursor-pointer hover:bg-primary/10 transition focus:bg-accent outline-none group">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={p.avatar} alt={p.name} />
                    <AvatarFallback>{p.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <span className="font-medium">{p.name}</span>
                    <div className="text-xs text-muted-foreground">@{p.username} · {p.bio}</div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-full">View</Button>
                </div>
              ))}
            </div>
          )}
          {/* Posts */}
          {filterIndex === 1 && (
            <div>
              <div className={`mb-2 text-xs font-semibold uppercase ${sectionTitleText}`}>{query ? "Post Results" : "Popular Posts"}</div>
              {filteredPosts.length === 0 && <div className="text-sm py-8 text-center text-muted-foreground">No posts found</div>}
              {filteredPosts.map((p, idx) => (
                <div key={idx} className="flex gap-3 items-start py-3 border-b border-border last:border-0 group cursor-pointer hover:bg-primary/10 rounded-xl px-3 transition">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={p.avatar} alt={p.author} />
                    <AvatarFallback>{p.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex gap-1 items-center font-medium">{p.author}</div>
                    <div className="text-base">{p.content}</div>
                    {p.image && (
                      <img src={p.image} alt="post" className="mt-2 max-h-44 rounded-md object-cover w-full shadow" />
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition" tabIndex={0}>
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {/* Other filters */}
          {filterIndex > 1 && (
            <div className="py-8 text-muted-foreground text-center text-base">No results yet — try searching for people or posts!</div>
          )}
        </div>
      </div>
    </div>
  );
}
