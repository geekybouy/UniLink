
import { CVData } from './cv';

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  image_preview_url: string;
  template_file: string;
}

export interface EnhancementOptions {
  adaptToJobDescription?: boolean;
  highlightKeySkills?: boolean;
  improveLanguage?: boolean;
  suggestAdditions?: boolean;
  customInstructions?: string;
  // Add the missing properties that were causing TypeScript errors
  optimizeForATS?: boolean;
  addActionVerbs?: boolean;
  quantifyAchievements?: boolean;
  correctGrammar?: boolean;
}

export interface FraudDetectionResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  detectedIssues: {
    type: string;
    severity: number;
    details: any;
  }[];
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
