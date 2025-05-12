
import { CVData } from './cv';

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  image_preview_url: string;
  template_file: string;
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
    original: {
      description: string | string[];
    };
    enhanced: {
      description: string | string[];
    };
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
