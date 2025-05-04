
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ImageSlider from '../components/ImageSlider';
import AuthForms from '../components/AuthForms';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Users, 
  BookOpen, 
  Shield, 
  Calendar, 
  Briefcase 
} from 'lucide-react';
import HomepageFeature from '@/components/homepage/HomepageFeature';
import HomepageSection from '@/components/homepage/HomepageSection';

const Index = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { user, isLoading } = useAuth();

  // Redirect authenticated users to dashboard
  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      title: "Alumni Network",
      description: "Connect with graduates from your university across the globe",
      icon: Users,
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Job Marketplace",
      description: "Discover career opportunities shared by fellow alumni",
      icon: Briefcase,
      color: "bg-emerald-100 text-emerald-700"
    },
    {
      title: "Verified Credentials",
      description: "Share and verify your academic achievements securely",
      icon: Shield,
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "CV Builder",
      description: "Create professional resumes with our specialized tools",
      icon: BookOpen,
      color: "bg-amber-100 text-amber-700"
    },
    {
      title: "Alumni Events",
      description: "Stay updated with university and alumni-hosted events",
      icon: Calendar,
      color: "bg-pink-100 text-pink-700"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-playfair text-primary">
              UniLink
            </h1>
            <div className="space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {!showAuth ? (
          <>
            {/* Hero Section with Image Slider */}
            <div className="relative">
              <ImageSlider />
              <div className="absolute inset-0 flex flex-col justify-center items-center z-30 bg-black/30 text-white text-center px-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-4">
                  Connect with Your University Network
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl">
                  Build meaningful professional relationships, access exclusive opportunities, and grow your career with UniLink.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full shadow-lg transition-transform hover:scale-105"
                    onClick={() => setShowAuth(true)}
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white/20 px-8 py-6 text-lg rounded-full shadow-lg"
                  >
                    Learn More <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <HomepageSection
              title="Why Join UniLink?"
              subtitle="Your all-in-one platform for university alumni networking and professional growth"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {features.map((feature) => (
                  <HomepageFeature
                    key={feature.title}
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    color={feature.color}
                  />
                ))}
              </div>
            </HomepageSection>

            {/* Stats Section */}
            <HomepageSection
              title="Growing Community"
              subtitle="Join thousands of alumni already on the platform"
              background="bg-gray-50"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-12">
                {[
                  { value: "10K+", label: "Alumni" },
                  { value: "500+", label: "Universities" },
                  { value: "5K+", label: "Job Opportunities" },
                  { value: "2K+", label: "Events Yearly" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </HomepageSection>

            {/* Testimonials */}
            <HomepageSection
              title="What Our Members Say"
              subtitle="Hear from alumni who have found success on UniLink"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                {[
                  {
                    quote: "UniLink helped me reconnect with classmates and find my current job through an alumni connection.",
                    name: "Sarah L.",
                    title: "Marketing Director, Class of 2018"
                  },
                  {
                    quote: "The verified credentials feature made sharing my academic achievements with employers seamless and trustworthy.",
                    name: "Michael T.",
                    title: "Software Engineer, Class of 2020"
                  },
                  {
                    quote: "I've organized three alumni meetups through UniLink. The platform made it easy to reach relevant graduates.",
                    name: "Jessica K.",
                    title: "Event Coordinator, Class of 2015"
                  }
                ].map((testimonial, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-lg italic mb-4 text-gray-700">"{testimonial.quote}"</div>
                    <div className="font-medium">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.title}</div>
                  </div>
                ))}
              </div>
            </HomepageSection>

            {/* CTA Section */}
            <div className="bg-primary text-white py-16 md:py-24">
              <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Join Your Alumni Network?</h2>
                <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                  Connect with graduates, discover opportunities, and grow your professional network today.
                </p>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-primary hover:bg-gray-100 px-8 py-6 text-lg rounded-full shadow-lg"
                  onClick={() => setShowAuth(true)}
                >
                  Get Started Now
                </Button>
              </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-xl font-playfair mb-4">UniLink</h3>
                    <p className="text-gray-400">
                      Connecting university graduates around the world for networking, career growth, and continued learning.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Features</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li>Alumni Directory</li>
                      <li>Job Marketplace</li>
                      <li>Credential Wallet</li>
                      <li>CV Builder</li>
                      <li>Events</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Resources</h4>
                    <ul className="space-y-2 text-gray-400">
                      <li>Help Center</li>
                      <li>Privacy Policy</li>
                      <li>Terms of Service</li>
                      <li>Contact Us</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">Connect</h4>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-gray-400 text-center">
                  <p>&copy; {new Date().getFullYear()} UniLink. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </>
        ) : (
          <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
            <AuthForms />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
