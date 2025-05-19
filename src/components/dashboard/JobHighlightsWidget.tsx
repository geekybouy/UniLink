
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

// Placeholder jobs
const demoJobs = [
  { role: "Product Designer", company: "Adobe", posted: "1d ago" },
  { role: "Frontend Engineer", company: "Flipkart", posted: "2d ago" },
];

const JobHighlightsWidget = () => (
  <Card className="shadow-soft rounded-xl">
    <CardHeader className="flex flex-row items-center gap-2 pb-3">
      <Briefcase className="w-5 h-5 text-primary" />
      <CardTitle className="text-lg font-semibold tracking-tight">
        Job & Internship Highlights
      </CardTitle>
    </CardHeader>
    <CardContent>
      {demoJobs.length === 0 ? (
        <div className="text-muted-foreground text-sm py-6 text-center">
          No job postings yet. Opportunities coming soon!
        </div>
      ) : (
        <ul className="space-y-3">
          {demoJobs.map((job, idx) => (
            <li key={idx} className="flex justify-between text-sm bg-accent/30 p-2 rounded">
              <span className="font-medium">{job.role} </span>
              <span className="text-xs text-muted-foreground">{job.company} · {job.posted}</span>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

export default JobHighlightsWidget;
