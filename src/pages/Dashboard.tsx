
import React, { useState } from "react";
import { Home, Users, Search, Bell, Calendar, MessageCircle, Plus } from "lucide-react";

const NAV = [
  { key: "for-you", label: "For You", icon: Home },
  { key: "following", label: "Following", icon: Users },
  { key: "search", label: "Search", icon: Search },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "events", label: "Events", icon: Calendar },
  { key: "messages", label: "Messages", icon: MessageCircle },
];

const getSectionContent = (section: string) => {
  switch (section) {
    case "for-you":
      return (
        <div className="w-full max-w-xl space-y-4">
          <ContentCard
            avatarSrc="https://randomuser.me/api/portraits/men/32.jpg"
            name="John Alumni"
            title="Excited to be part of this alumni network! Looking forward to connecting."
            timestamp="2h ago"
          />
          <ContentCard
            avatarSrc="https://randomuser.me/api/portraits/women/44.jpg"
            name="Jane Grad"
            title="Does anyone have tips for alumni networking in SF?"
            timestamp="1h ago"
          />
        </div>
      );
    case "following":
      return <EmptyState icon={<Users className="w-10 h-10 text-gray-300" />} text="No posts from people you follow—yet!" />;
    case "search":
      return <EmptyState icon={<Search className="w-10 h-10 text-gray-300" />} text="Try searching for alumni, jobs, or events." />;
    case "notifications":
      return <EmptyState icon={<Bell className="w-10 h-10 text-gray-300" />} text="You're all caught up! No new notifications." />;
    case "events":
      return <EmptyState icon={<Calendar className="w-10 h-10 text-gray-300" />} text="No upcoming events. Check back later!" />;
    case "messages":
      return <EmptyState icon={<MessageCircle className="w-10 h-10 text-gray-300" />} text="No messages yet. Start a new conversation!" />;
    default:
      return null;
  }
};

// Main Dashboard Component
const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("for-you");
  const [showFabs, setShowFabs] = useState(true);

  // Detect system theme preference for glass effect
  React.useEffect(() => {
    const darkClass = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.classList.toggle('dark', darkClass);
  }, []);

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-[#121926] dark:to-gray-950 transition-all duration-300">
      {/* Sidebar (Desktop & Tablet) */}
      <aside
        className="hidden md:flex fixed z-40 inset-y-0 left-0 w-[72px] lg:w-64 flex-col border-r border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#181f2e]/80 backdrop-blur-lg transition-all duration-300"
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full py-6 space-y-2">
          <div className="flex items-center justify-center lg:justify-start lg:pl-6 mb-8">
            <span className="font-bold text-xl text-blue-700 tracking-tight">AlumniX</span>
          </div>
          {NAV.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              aria-label={label}
              className={`
                group rounded-xl flex items-center gap-3 px-3 py-3 my-1 w-[48px] lg:w-auto
                ${activeSection === key
                  ? "bg-blue-100 dark:bg-blue-900/70 text-blue-700 dark:text-blue-300 shadow-soft-lg"
                  : "text-gray-500 dark:text-gray-400 hover:bg-blue-50 hover:dark:bg-gray-800/40"}
                hover:shadow-lg transition-all duration-200 ease-in-out font-semibold
              `}
              onClick={() => setActiveSection(key)}
            >
              <Icon className="w-6 h-6 mx-auto" />
              <span className="hidden lg:inline text-base">{label}</span>
            </button>
          ))}
          <div className="flex-1" />
          {/* Floating action button on desktop */}
          <div className="hidden lg:flex justify-center pb-4">
            <button
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center gap-2 px-5 py-3 font-semibold text-base transition-all duration-200"
              style={{ minWidth: 44, minHeight: 44 }}
              aria-label="Create Post"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden lg:inline">Post</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex flex-col min-h-screen mx-auto w-full md:pl-[72px] lg:pl-64 pb-28 md:pb-0 transition-all duration-200">
        {/* Sticky header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#181f2e]/70 shadow-sm backdrop-blur-md px-4 py-3 flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Alumni Dashboard</h1>
        </header>
        {/* Section Tabs (mobile/tablet only) */}
        <nav className="flex md:hidden justify-between py-2 px-1 bg-transparent">
          {NAV.map(({ key, icon: Icon, label }) => (
            <NavTabButton
              key={key}
              active={activeSection === key}
              onClick={() => setActiveSection(key)}
              icon={<Icon />}
              label={label}
            />
          ))}
        </nav>
        {/* Content */}
        <main className="flex flex-col items-center justify-start flex-1 mt-4 px-2">
          {getSectionContent(activeSection)}
        </main>
        {/* Floating Action Button on mobile/tablet */}
        <div className="fixed bottom-20 right-5 z-50 md:hidden">
          <button
            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-2xl flex items-center justify-center w-14 h-14 text-3xl transition-all duration-200 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800"
            aria-label="Create Post"
            style={{ minWidth: 56, minHeight: 56 }}
          >
            <Plus className="h-7 w-7" />
          </button>
        </div>
        {/* Bottom Nav (Mobile only) */}
        <nav className="fixed bottom-0 left-0 w-full h-16 bg-white/80 dark:bg-[#181f2e]/80 border-t border-gray-100 dark:border-gray-800 flex md:hidden justify-around items-center z-50 backdrop-blur-md transition-all duration-200">
          {NAV.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              aria-label={label}
              onClick={() => setActiveSection(key)}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                ${activeSection === key
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 dark:text-gray-500"}
                transition-colors font-semibold
              `}
            >
              <Icon className={`w-6 h-6 mx-auto mb-1 ${activeSection === key ? "scale-110" : ""} transition-transform`} />
              <span className="text-xs">{label.split(" ")[0]}</span>
              {activeSection === key && (
                <span className="w-5 h-1 bg-blue-600 dark:bg-blue-400 mt-1 rounded-t-lg"></span>
              )}
            </button>
          ))}
        </nav>
      </section>
    </div>
  );
};

// Card-based post/content example
function ContentCard({
  avatarSrc,
  name,
  title,
  timestamp
}: { avatarSrc: string; name: string; title: string; timestamp: string }) {
  return (
    <div className="bg-white dark:bg-[#222c3d] rounded-xl shadow-soft p-5 flex gap-4 items-center hover:shadow-md transition-shadow duration-200 border border-gray-100 dark:border-gray-800">
      <img
        src={avatarSrc}
        alt={name}
        className="w-12 h-12 object-cover rounded-full border-2 border-blue-200 dark:border-blue-900 shadow"
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{name}</span>
          <span className="text-xs text-gray-400">{timestamp}</span>
        </div>
        <div className="text-base text-gray-800 dark:text-gray-50 mt-1">{title}</div>
      </div>
    </div>
  );
}

// Empty state helper
function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-72 w-full">
      <div className="mb-2">{icon}</div>
      <div className="font-medium text-gray-500 dark:text-gray-400 text-lg">{text}</div>
    </div>
  );
}

// NavTabButton: for mobile nav tabs (icon+label)
function NavTabButton({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean,
  onClick: () => void,
  icon: React.ReactNode,
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center px-2 py-2 rounded-md flex-1
        ${active ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-gray-900/30 font-bold" : "text-gray-400"}
        transition-all duration-200
      `}
      style={{ minWidth: 44, minHeight: 44 }}
      aria-label={label}
    >
      {icon}
      <span className="text-xs">{label.split(" ")[0]}</span>
    </button>
  );
}

export default Dashboard;
