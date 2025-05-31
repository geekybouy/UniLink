import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Briefcase, CalendarIcon, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MOBILE_BREAKPOINT = 768;

type Alumni = {
  id: string;
  name: string;
  batch: string | number;
  designation?: string;
  avatar_url?: string | null;
};

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  deadline: string;
};

type Event = {
  id: string;
  name: string;
  date: string;
  time?: string;
  location?: string;
  is_virtual?: boolean;
};

export default function MobileCommunityPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if mobile. If not, route away.
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= MOBILE_BREAKPOINT) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // Fetch minimal demo data (replace with real hooks/supabase if available)
  useEffect(() => {
    setLoading(true);
    Promise.all([
      // Alumni
      Promise.resolve([
        {
          id: "1",
          name: "Rachel Gupta",
          batch: 2020,
          designation: "Product Manager",
          avatar_url: "https://randomuser.me/api/portraits/women/44.jpg",
        },
        {
          id: "2",
          name: "Arjun Yadav",
          batch: 2018,
          designation: "Software Engineer",
          avatar_url: "https://randomuser.me/api/portraits/men/31.jpg",
        },
        {
          id: "3",
          name: "Priya Singh",
          batch: 2016,
          designation: "Data Scientist",
          avatar_url: null,
        },
      ]),
      // Jobs
      Promise.resolve([
        {
          id: "101",
          title: "Frontend Developer",
          company: "Tata Consultancy Services",
          location: "Mumbai",
          deadline: "2025-06-15",
        },
        {
          id: "102",
          title: "Business Analyst",
          company: "Flipkart",
          location: "Bangalore",
          deadline: "2025-06-18",
        },
      ]),
      // Events
      Promise.resolve([
        {
          id: "e1",
          name: "Annual Alumni Meetup",
          date: "2025-06-25 18:30",
          location: "Virtual",
          is_virtual: true,
        },
        {
          id: "e2",
          name: "Startup Networking Night",
          date: "2025-07-04 19:00",
          location: "Delhi",
        },
      ])
    ]).then(([alumni, jobs, events]) => {
      setAlumni(alumni.slice(0, 3));
      setJobs(jobs.slice(0, 3));
      setEvents(events.slice(0, 3));
      setLoading(false);
    });
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;

  if (!isMobile) return null;

  return (
    <div className="min-h-screen px-3 pt-4 pb-20 sm:pb-6 bg-background flex flex-col gap-8 font-sans">
      <h1 className="text-2xl font-bold mb-2 text-foreground font-playfair">Community</h1>

      {/* Alumni Section */}
      <section>
        <div className="flex items-center mb-2">
          <User className="mr-2 text-primary" />
          <h2 className="text-lg font-semibold">Alumni</h2>
        </div>
        <div className="flex flex-col gap-3">
          {loading
            ? [1, 2, 3].map(i => (
                <Card key={i} className="p-4 flex items-center">
                  <Skeleton className="rounded-full h-12 w-12" />
                  <div className="ml-3 flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                </Card>
              ))
            : alumni.map(a => (
                <Card key={a.id} className="p-4 flex items-center">
                  <Avatar className="h-12 w-12">
                    {a.avatar_url ? (
                      <AvatarImage src={a.avatar_url} alt={a.name} />
                    ) : (
                      <AvatarFallback>{a.name?.[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="ml-3 flex-1">
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Batch {a.batch} &bull; {a.designation || "Alumnus"}
                    </div>
                  </div>
                </Card>
              ))}
        </div>
        <Button
          className="w-full mt-3"
          variant="outline"
          onClick={() => navigate("/alumni-directory")}
        >
          View All Alumni <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </section>

      {/* Jobs Section */}
      <section>
        <div className="flex items-center mb-2">
          <Briefcase className="mr-2 text-primary" />
          <h2 className="text-lg font-semibold">Latest Jobs</h2>
        </div>
        <div className="flex flex-col gap-3">
          {loading
            ? [1, 2, 3].map(i => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-28 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </Card>
              ))
            : jobs.map(job => (
                <Card key={job.id} className="p-4">
                  <div className="font-medium">{job.title}</div>
                  <div className="text-xs text-muted-foreground">{job.company}</div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">{job.location}</span>{" "}
                    <span className="ml-2 text-destructive">
                      Closes {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              ))}
        </div>
        <Button
          className="w-full mt-3"
          variant="outline"
          onClick={() => navigate("/jobs")}
        >
          View All Jobs <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </section>

      {/* Events Section */}
      <section>
        <div className="flex items-center mb-2">
          <CalendarIcon className="mr-2 text-primary" />
          <h2 className="text-lg font-semibold">Upcoming Events</h2>
        </div>
        <div className="flex flex-col gap-3">
          {loading
            ? [1, 2, 3].map(i => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-3 w-14" />
                </Card>
              ))
            : events.map(ev => {
                const [datePart, timePart] = ev.date.split(" ");
                return (
                  <Card key={ev.id} className="p-4">
                    <div className="font-medium">{ev.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {datePart} {timePart && `at ${timePart}`}
                    </div>
                    <div className="text-xs">
                      {ev.is_virtual
                        ? <span className="text-cyan-700">Online</span>
                        : <span>{ev.location}</span>}
                    </div>
                  </Card>
                );
              })}
        </div>
        <Button
          className="w-full mt-3"
          variant="outline"
          onClick={() => navigate("/events")}
        >
          View All Events <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </section>
    </div>
  );
}
