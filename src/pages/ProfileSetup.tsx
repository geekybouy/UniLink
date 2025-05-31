
import ProfileSetupForm from '@/components/profile/ProfileSetupForm';
import { Card } from "@/components/ui/card";

export default function ProfileSetup() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">Please fill in your details to continue</p>
        </div>
        <ProfileSetupForm />
      </Card>
    </div>
  );
}
