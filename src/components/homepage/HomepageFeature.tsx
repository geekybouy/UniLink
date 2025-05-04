
import { cn } from '@/lib/utils';

type HomepageFeatureProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  color?: string;
};

const HomepageFeature = ({ 
  title, 
  description, 
  icon: Icon,
  color = "bg-blue-100 text-blue-700" 
}: HomepageFeatureProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", color)}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default HomepageFeature;
