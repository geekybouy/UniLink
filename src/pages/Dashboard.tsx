
import React, { useState } from "react";

const sections = [
  { key: "for-you", label: "For You" },
  { key: "following", label: "Following" },
  { key: "search", label: "Search" },
  { key: "notifications", label: "Notifications" },
  { key: "events", label: "Events" },
  { key: "messages", label: "Messages" },
];

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("for-you");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-4 bg-white shadow font-bold text-xl text-gray-800">
        Dashboard Working
      </header>
      <nav className="flex gap-2 p-4 bg-white border-b justify-center">
        {sections.map((section) => (
          <button
            key={section.key}
            className={`px-3 py-1 rounded ${activeSection === section.key
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"}`}
            onClick={() => setActiveSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </nav>
      <main className="flex-1 flex justify-center items-center text-lg font-medium">
        {activeSection === "for-you" && <div>Feed Content (For You)</div>}
        {activeSection === "following" && <div>Feed Content (Following)</div>}
        {activeSection === "search" && <div>Search Content</div>}
        {activeSection === "notifications" && <div>Notifications Content</div>}
        {activeSection === "events" && <div>Events Content</div>}
        {activeSection === "messages" && <div>Messages Content</div>}
      </main>
    </div>
  );
};

export default Dashboard;
