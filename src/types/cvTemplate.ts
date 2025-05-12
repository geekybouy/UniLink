
import { CVData } from './cv';

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  imagePreviewUrl: string;
  templateFile: string;
}

export interface EnhancementOptions {
  improveLanguage: boolean;
  optimizeForATS: boolean;
  addActionVerbs: boolean;
  quantifyAchievements: boolean;
  correctGrammar: boolean;
}

export interface EnhancedCVData extends CVData {
  enhancedWorkExperience?: {
    original: string[];
    enhanced: string[];
  }[];
  enhancedProjects?: {
    original: {
      description: string;
    };
    enhanced: {
      description: string;
    };
  }[];
}
