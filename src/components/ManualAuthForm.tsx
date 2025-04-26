
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

interface AuthFormData {
  email: string;
  password: string;
  fullName?: string;
}

interface ManualAuthFormProps {
  isLogin: boolean;
}

const ManualAuthForm = ({ isLogin }: ManualAuthFormProps) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    fullName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithEmail, signUpWithEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(formData.email, formData.password);
      } else {
        if (!formData.fullName) {
          toast.error('Please enter your full name');
          return;
        }
        await signUpWithEmail(formData.email, formData.password, formData.fullName);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            required={!isLogin}
            className="w-full"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Spinner />
        ) : (
          isLogin ? 'Sign in' : 'Sign up'
        )}
      </Button>
    </form>
  );
};

export default ManualAuthForm;
