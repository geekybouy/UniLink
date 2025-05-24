
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UserRound } from "lucide-react";

// Richer mentorship mock data
const demoMentors = [
  { name: "Megha Patel", area: "Tech Careers" },
  { name: "Arjun Rao", area: "MBA Prep" },
  { name: "Dr. Nandini Mehra", area: "PhD Guidance" },
  { name: "Lucas Fernandes", area: "Entrepreneurship" },
  { name: "Leila Khanna", area: "Product Management" },
];

const MentorshipCornerWidget = () => (
  <Card className="shadow-soft rounded-xl">
    <CardHeader className="flex flex-row items-center gap-2 pb-3">
      <UserRound className="w-5 h-5 text-primary" />
      <CardTitle className="text-lg font-semibold tracking-tight">
        Mentorship Corner
      </CardTitle>
    </CardHeader>
    <CardContent>
      {demoMentors.length === 0 ? (
        <div className="text-muted-foreground text-sm py-6 text-center">
          Become a mentor or find one for your journey!
        </div>
      ) : (
        <ul className="space-y-3">
          {demoMentors.slice(0, 4).map((mentor, idx) => (
            <li key={idx} className="flex justify-between text-sm bg-accent/30 p-2 rounded">
              <span className="font-medium">{mentor.name}</span>
              <span className="text-xs text-muted-foreground">{mentor.area}</span>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

export default MentorshipCornerWidget;

