
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Search } from "lucide-react";

const QuickActionsWidget = () => (
  <div className="flex gap-2">
    <Button variant="default" size="sm" className="rounded-full shadow-soft" aria-label="Post an update">
      <Plus className="w-4 h-4" /> <span className="sr-only">Post</span>
    </Button>
    <Button variant="secondary" size="sm" className="rounded-full shadow-soft" aria-label="Message">
      <MessageSquare className="w-4 h-4" /> <span className="sr-only">Message</span>
    </Button>
    <Button variant="outline" size="sm" className="rounded-full shadow-soft" aria-label="Search Alumni">
      <Search className="w-4 h-4" /> <span className="sr-only">Search</span>
    </Button>
  </div>
);

export default QuickActionsWidget;
