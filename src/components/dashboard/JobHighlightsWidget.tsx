
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

// Expanded demo jobs
const demoJobs = [
  { role: "Product Designer", company: "Adobe", posted: "1d ago" },
  { role: "Frontend Engineer", company: "Flipkart", posted: "2d ago" },
  { role: "Research Analyst", company: "McKinsey", posted: "5h ago" },
  { role: "Data Engineer", company: "Microsoft", posted: "3d ago" },
  { role: "Marketing Intern", company: "PepsiCo", posted: "7h ago" },
  { role: "Software Developer", company: "Amazon", posted: "12h ago" },
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
          {demoJobs.slice(0, 5).map((job, idx) => (
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

