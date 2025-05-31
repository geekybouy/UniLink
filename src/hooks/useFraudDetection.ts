
import { useState } from 'react';
import { Credential } from '@/types/credentials';
import { 
  analyzeCredential, 
  storeCredentialAnalysis, 
  getFraudAnalysisForCredential,
  CredentialAnalysisResult
} from '@/services/fraudDetectionService';
import { toast } from 'sonner';

export function useFraudDetection() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CredentialAnalysisResult | null>(null);

  const detectFraud = async (credential: Credential) => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeCredential(credential);
      setAnalysisResult(result);
      
      // Store the analysis result
      if (result.riskScore > 0) {
        await storeCredentialAnalysis(credential.id, result);
        
        // Show toast notification for high risk credentials
        if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
          toast.error('High risk credential detected!', {
            description: 'This credential has been flagged for review by our fraud detection system.'
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error in fraud detection:', error);
      toast.error('Failed to analyze credential for fraud');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCredentialAnalysis = async (credentialId: string) => {
    try {
      const result = await getFraudAnalysisForCredential(credentialId);
      if (result) {
        setAnalysisResult(result);
      }
      return result;
    } catch (error) {
      console.error('Error fetching credential analysis:', error);
      return null;
    }
  };

  return {
    detectFraud,
    getCredentialAnalysis,
    isAnalyzing,
    analysisResult
  };
}
