
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/contexts/ProfileContext';
import { Skill } from '@/types/profile';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const SkillsStep = () => {
  const { profile, refreshProfile } = useProfile();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (profile?.skills) {
      setSkills(profile.skills);
    }
  }, [profile]);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    if (skills.some(skill => skill.name.toLowerCase() === newSkill.toLowerCase())) {
      toast.error('This skill already exists');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (!profile) {
        toast.error('User profile not found');
        return;
      }
      
      const skillId = uuidv4();
      
      // Add to database
      const { error } = await supabase
        .from('skills')
        .insert({
          id: skillId,
          user_id: profile.userId,
          name: newSkill.trim()
        });
      
      if (error) throw error;
      
      // Update local state
      setSkills([...skills, { id: skillId, name: newSkill.trim() }]);
      setNewSkill('');
      
      // Refresh profile
      await refreshProfile();
      
    } catch (error: any) {
      toast.error('Failed to add skill: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveSkill = async (id: string) => {
    try {
      if (!profile) return;
      
      // Delete from database
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setSkills(skills.filter(skill => skill.id !== id));
      
      // Refresh profile
      await refreshProfile();
      
    } catch (error: any) {
      toast.error('Failed to remove skill: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Skills</h3>
        <p className="text-sm text-muted-foreground">
          Add skills to showcase your expertise and help others find you
        </p>
        
        <div className="flex items-center space-x-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill (e.g. JavaScript, Project Management)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            className="flex-1"
          />
          <Button
            onClick={handleAddSkill}
            disabled={isSubmitting || !newSkill.trim()}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Your skills ({skills.length})</h4>
        <Card className="p-4">
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill.id} variant="secondary" className="px-3 py-1 flex items-center">
                  {skill.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSkill(skill.id)}
                    className="h-5 w-5 ml-1 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No skills added yet. Add some skills to showcase your expertise.
            </p>
          )}
        </Card>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-2">Popular skills you might have</h4>
        <div className="flex flex-wrap gap-2">
          {['JavaScript', 'React', 'TypeScript', 'Node.js', 'UI/UX Design', 'Project Management', 'Data Analysis', 'Java', 'Python'].map((skill) => (
            !skills.some(s => s.name.toLowerCase() === skill.toLowerCase()) && (
              <Badge 
                key={skill} 
                variant="outline" 
                className="px-3 py-1 cursor-pointer hover:bg-muted"
                onClick={() => {
                  setNewSkill(skill);
                  handleAddSkill();
                }}
              >
                + {skill}
              </Badge>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsStep;
