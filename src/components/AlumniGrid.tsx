
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AlumniGrid = () => {
  const alumni = [
    {
      id: 1,
      name: "Sarah Johnson",
      image: "https://source.unsplash.com/photo-1494790108377-be9c29b29330",
      batch: "2023",
      course: "Computer Science",
    },
    {
      id: 2,
      name: "Michael Chen",
      image: "https://source.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      batch: "2022",
      course: "Business Administration",
    },
    {
      id: 3,
      name: "Emma Davis",
      image: "https://source.unsplash.com/photo-1438761681033-6461ffad8d80",
      batch: "2023",
      course: "Engineering",
    },
    // Add more alumni as needed
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {alumni.map((alumnus) => (
        <div
          key={alumnus.id}
          className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
        >
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src={alumnus.image} alt={alumnus.name} />
            <AvatarFallback>{alumnus.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <h3 className="text-lg font-semibold text-gray-900">{alumnus.name}</h3>
          <p className="text-sm text-gray-500 mt-1">Batch of {alumnus.batch}</p>
          <p className="text-sm text-gray-500 mt-1">{alumnus.course}</p>
          <Button className="mt-4 w-full">
            Connect
          </Button>
        </div>
      ))}
    </div>
  );
};

export default AlumniGrid;
