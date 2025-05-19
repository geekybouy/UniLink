
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

// Placeholder connections
const suggested = [
  { name: "Emily Wong", role: "2018 · Product Manager" },
  { name: "Sanjay Gupta", role: "2020 · Data Scientist" },
];

const pending = [
  { name: "Priya Singh", role: "2019 · Software Engineer" },
];

const ConnectionsOverviewWidget = () => (
  <Card className="shadow-soft rounded-xl">
    <CardHeader className="flex flex-row items-center gap-2 pb-3">
      <Users className="w-5 h-5 text-primary" />
      <CardTitle className="text-lg font-semibold tracking-tight">Connections Overview</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <div className="font-semibold mb-1 text-sm">Suggested</div>
        {suggested.length === 0 ? (
          <div className="text-xs text-muted-foreground">No new suggestions</div>
        ) : (
          <ul className="space-y-1">
            {suggested.map((c, idx) => (
              <li key={idx} className="flex justify-between text-sm py-1">
                <span>{c.name}</span>
                <span className="text-muted-foreground">{c.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="w-px h-auto bg-border hidden md:block" />
      <div className="flex-1">
        <div className="font-semibold mb-1 text-sm">Pending Invites</div>
        {pending.length === 0 ? (
          <div className="text-xs text-muted-foreground">No pending invites</div>
        ) : (
          <ul className="space-y-1">
            {pending.map((c, idx) => (
              <li key={idx} className="flex justify-between text-sm py-1">
                <span>{c.name}</span>
                <span className="text-muted-foreground">{c.role}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CardContent>
  </Card>
);

export default ConnectionsOverviewWidget;
