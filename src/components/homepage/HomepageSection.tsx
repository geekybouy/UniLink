
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type HomepageSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  background?: string;
  className?: string;
};

const HomepageSection = ({ 
  title, 
  subtitle, 
  children, 
  background = "bg-white",
  className 
}: HomepageSectionProps) => {
  return (
    <section className={cn("py-16 md:py-24", background, className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          {subtitle && (
            <p className="text-lg text-gray-600">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
};

export default HomepageSection;
