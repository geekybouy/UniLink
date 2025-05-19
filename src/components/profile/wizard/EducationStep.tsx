import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WizardStepProps } from './ProfileWizard';
import { useProfile } from '@/contexts/ProfileContext';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

interface EducationItem {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

const EducationStep = ({ onNext, onPrevious, isFirstStep, isLastStep, onStepSave }: WizardStepProps) => {
  const { profile } = useProfile();
  const [educationItems, setEducationItems] = useState<EducationItem[]>([
    { institution: '', degree: '', field: '', startYear: '', endYear: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate years for dropdown (from 1950 to current year + 10)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 + 11 }, (_, i) => (currentYear + 10 - i).toString());

  useEffect(() => {
    // If we had education data in the profile, we would load it here
    // Since UserProfile doesn't have education field, we'll just use the default empty state
  }, [profile]);

  const handleAddEducation = () => {
    setEducationItems([
      ...educationItems,
      { institution: '', degree: '', field: '', startYear: '', endYear: '' }
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    if (educationItems.length === 1) {
      // Don't remove the last item, just clear it
      setEducationItems([{ institution: '', degree: '', field: '', startYear: '', endYear: '' }]);
      return;
    }
    setEducationItems(educationItems.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof EducationItem, value: string) => {
    const updatedItems = [...educationItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setEducationItems(updatedItems);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Since UserProfile doesn't have education field in the database schema,
      // we'll just validate and move to the next step
      // In a real implementation, you would save this data to a separate table
      
      // Basic validation
      const hasEmptyFields = educationItems.some(item => 
        !item.institution || !item.degree || !item.field || !item.startYear
      );
      
      if (hasEmptyFields) {
        toast.error("Please fill in all required education fields");
        setIsSubmitting(false);
        return;
      }
      
      // For now, we'll just call onNext since we don't have a place to store this
      if (onStepSave) {
        // In a real implementation, you would save to a separate table using the user's ID
        await onStepSave({});
      }
      
      onNext();
    } catch (error) {
      console.error("Error saving education data:", error);
      toast.error("Failed to save education information");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {educationItems.map((item, index) => (
          <div key={index} className="p-4 border rounded-md space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Education #{index + 1}</h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleRemoveEducation(index)}
                disabled={educationItems.length === 1 && index === 0}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid gap-4">
              <div>
                <Label htmlFor={`institution-${index}`}>Institution</Label>
                <Input
                  id={`institution-${index}`}
                  value={item.institution}
                  onChange={(e) => handleChange(index, 'institution', e.target.value)}
                  placeholder="University or College name"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`degree-${index}`}>Degree</Label>
                  <Input
                    id={`degree-${index}`}
                    value={item.degree}
                    onChange={(e) => handleChange(index, 'degree', e.target.value)}
                    placeholder="Bachelor's, Master's, PhD, etc."
                  />
                </div>
                <div>
                  <Label htmlFor={`field-${index}`}>Field of Study</Label>
                  <Input
                    id={`field-${index}`}
                    value={item.field}
                    onChange={(e) => handleChange(index, 'field', e.target.value)}
                    placeholder="Computer Science, Business, etc."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`startYear-${index}`}>Start Year</Label>
                  <Select
                    value={item.startYear}
                    onValueChange={(value) => handleChange(index, 'startYear', value)}
                  >
                    <SelectTrigger id={`startYear-${index}`}>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={`start-${year}`} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`endYear-${index}`}>End Year (or Expected)</Label>
                  <Select
                    value={item.endYear}
                    onValueChange={(value) => handleChange(index, 'endYear', value)}
                  >
                    <SelectTrigger id={`endYear-${index}`}>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Present">Present</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={`end-${year}`} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleAddEducation}
          className="w-full"
        >
          Add Another Education
        </Button>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep || isSubmitting}
        >
          Previous
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isLastStep ? 'Complete' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default EducationStep;
