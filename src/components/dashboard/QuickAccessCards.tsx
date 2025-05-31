
import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Users, Briefcase, Calendar, MessageSquare, Settings } from "lucide-react";
const cardData = [
  {
    label: "Profile",
    icon: <User className="w-7 h-7" />,
    route: "/profile",
    color: "bg-gradient-to-tr from-indigo-500 via-blue-400 to-sky-300 text-white"
  },
  {
    label: "Alumni Network",
    icon: <Users className="w-7 h-7" />,
    route: "/alumni-directory",
    color: "bg-gradient-to-tr from-orange-500 via-pink-500 to-yellow-400 text-white"
  },
  {
    label: "Jobs",
    icon: <Briefcase className="w-7 h-7" />,
    route: "/jobs",
    color: "bg-gradient-to-tr from-green-500 via-lime-400 to-yellow-300 text-white"
  },
  {
    label: "Events",
    icon: <Calendar className="w-7 h-7" />,
    route: "/events",
    color: "bg-gradient-to-tr from-pink-600 via-rose-400 to-yellow-400 text-white"
  },
  {
    label: "Messages",
    icon: <MessageSquare className="w-7 h-7" />,
    route: "/messages",
    color: "bg-gradient-to-tr from-gray-700 via-slate-400 to-cyan-300 text-white"
  },
  {
    label: "Settings",
    icon: <Settings className="w-7 h-7" />,
    route: "/settings",
    color: "bg-gradient-to-tr from-violet-600 via-purple-400 to-rose-300 text-white"
  }
];

export default function QuickAccessCards() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-1 w-full">
      {cardData.map(card => (
        <button
          key={card.label}
          onClick={() => navigate(card.route)}
          className={`
            flex flex-col items-center justify-center rounded-xl aspect-square min-h-[106px]
            shadow-soft-md hover:shadow-lg active:scale-[0.97] transition group
            ${card.color}
          `}
          aria-label={card.label}
        >
          <div className="mb-1">{card.icon}</div>
          <span className="font-semibold text-base drop-shadow-sm group-hover:underline">{card.label}</span>
        </button>
      ))}
    </div>
  );
}
