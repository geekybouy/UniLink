
import MainLayout from '@/layouts/MainLayout';

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto py-10 animate-fade-in">
        <h1 className="text-2xl font-bold mb-4">Settings & Preferences</h1>
        <p className="text-muted-foreground">
          Coming soon: Customize your notification settings, appearance, and other preferences!
        </p>
      </div>
    </MainLayout>
  );
}
