
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AboutSection from "@/components/profile/AboutSection";
import EducationSection from "@/components/profile/EducationSection";
import WorkSection from "@/components/profile/WorkSection";
import RecentPosts from "@/components/profile/RecentPosts";
import ContactInfo from "@/components/profile/ContactInfo";
import BottomNav from "@/components/BottomNav";

const AlumniProfile = () => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-16">
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-center">
          <h1 className="text-2xl font-playfair text-primary font-bold">UniLink</h1>
        </div>
      </nav>

      <main className="container mx-auto px-4 pt-20">
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="space-y-6">
            <ProfileHeader isEditing={isEditing} setIsEditing={setIsEditing} />
            <AboutSection isEditing={isEditing} />
            <EducationSection isEditing={isEditing} />
            <WorkSection isEditing={isEditing} />
            <RecentPosts />
            <ContactInfo isEditing={isEditing} />
          </div>
        </ScrollArea>
      </main>

      <BottomNav />
    </div>
  );
};

export default AlumniProfile;
