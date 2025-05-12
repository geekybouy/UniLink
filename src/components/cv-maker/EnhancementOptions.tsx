
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { EnhancementOptions } from '@/types/cvTemplate';

interface EnhancementOptionsProps {
  options: EnhancementOptions;
  onChange: (options: EnhancementOptions) => void;
}

export function EnhancementOptionsPanel({ options, onChange }: EnhancementOptionsProps) {
  const handleToggle = (key: keyof EnhancementOptions) => {
    onChange({
      ...options,
      [key]: !options[key]
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">AI Enhancement Options</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="improveLanguage" className="font-medium">Improve Professional Language</Label>
            <p className="text-sm text-muted-foreground">Enhances vocabulary and phrasing</p>
          </div>
          <Switch 
            id="improveLanguage" 
            checked={options.improveLanguage} 
            onCheckedChange={() => handleToggle('improveLanguage')} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="optimizeForATS" className="font-medium">Optimize for ATS</Label>
            <p className="text-sm text-muted-foreground">Adds industry-specific keywords</p>
          </div>
          <Switch 
            id="optimizeForATS" 
            checked={options.optimizeForATS} 
            onCheckedChange={() => handleToggle('optimizeForATS')} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="addActionVerbs" className="font-medium">Add Action Verbs</Label>
            <p className="text-sm text-muted-foreground">Starts bullet points with impact verbs</p>
          </div>
          <Switch 
            id="addActionVerbs" 
            checked={options.addActionVerbs} 
            onCheckedChange={() => handleToggle('addActionVerbs')} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="quantifyAchievements" className="font-medium">Quantify Achievements</Label>
            <p className="text-sm text-muted-foreground">Adds metrics and percentages where possible</p>
          </div>
          <Switch 
            id="quantifyAchievements" 
            checked={options.quantifyAchievements} 
            onCheckedChange={() => handleToggle('quantifyAchievements')} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="correctGrammar" className="font-medium">Correct Grammar</Label>
            <p className="text-sm text-muted-foreground">Fixes spelling and grammar errors</p>
          </div>
          <Switch 
            id="correctGrammar" 
            checked={options.correctGrammar} 
            onCheckedChange={() => handleToggle('correctGrammar')} 
          />
        </div>
      </div>
    </div>
  );
}
