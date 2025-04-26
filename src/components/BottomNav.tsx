
import { Home, BookOpen, PlusSquare, MessageCircle, User } from 'lucide-react';

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around py-3">
          <button className="flex flex-col items-center text-primary">
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
            <BookOpen className="h-6 w-6" />
            <span className="text-xs mt-1">Feed</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
            <PlusSquare className="h-6 w-6" />
            <span className="text-xs mt-1">New Post</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs mt-1">Chat</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
