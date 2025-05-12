
import { supabase } from '@/integrations/supabase/client';
import { Credential } from '@/types/credentials';

export interface CredentialAnalysisResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  detectionMethods: string[];
  detectionDetails: {
    issues: Array<{
      type: string;
      severity: number;
      details: any;
    }>;
    anomalies: any[];
  };
}

export async function analyzeCredential(credential: Credential): Promise<CredentialAnalysisResult> {
  try {
    // Fetch previous credentials from the same user for comparison
    const { data: previousCredentials } = await supabase
      .from('credentials')
      .select('*')
      .eq('user_id', credential.user_id)
      .neq('id', credential.id);
    
    // Call the edge function to analyze the credential
    const { data, error } = await supabase.functions.invoke('analyze-credential', {
      body: { credential, previousCredentials: previousCredentials || [] }
    });

    if (error) throw error;
    
    return data as CredentialAnalysisResult;
  } catch (error) {
    console.error('Error analyzing credential for fraud:', error);
    throw error;
  }
}

export async function storeCredentialAnalysis(
  credentialId: string, 
  analysisResult: CredentialAnalysisResult
): Promise<string> {
  try {
    // Store the analysis result in the credential_fraud_analysis table
    const { data, error } = await supabase.rpc('insert_credential_fraud_analysis', {
      p_credential_id: credentialId,
      p_risk_score: analysisResult.riskScore,
      p_risk_level: analysisResult.riskLevel,
      p_detection_method: analysisResult.detectionMethods,
      p_detection_details: JSON.stringify(analysisResult.detectionDetails)
    });

    if (error) throw error;
    
    // If there are issues, store them as anomalies
    if (analysisResult.detectionDetails.issues.length > 0) {
      const anomalies = analysisResult.detectionDetails.issues.map(issue => ({
        analysis_id: data.id,
        anomaly_type: issue.type,
        severity: issue.severity,
        confidence_score: issue.severity * 10, // Convert severity to a 0-100 score
        description: issue.details.message || `Detected ${issue.type}`,
        evidence: issue.details
      }));
      
      await supabase.rpc('insert_credential_anomalies', {
        p_anomalies: anomalies
      });
    }
    
    return data.id;
  } catch (error) {
    console.error('Error storing credential analysis:', error);
    throw error;
  }
}

export async function getFraudAnalysisForCredential(credentialId: string): Promise<CredentialAnalysisResult | null> {
  try {
    // Get the fraud analysis for the credential
    const { data, error } = await supabase.rpc('get_credential_fraud_analysis', {
      p_credential_id: credentialId
    });
    
    if (error) throw error;
    if (!data) return null;
    
    return data as unknown as CredentialAnalysisResult;
  } catch (error) {
    console.error('Error fetching fraud analysis:', error);
    throw error;
  }
}

export async function getPendingFraudReviews(limit = 10, offset = 0) {
  try {
    const { data, error } = await supabase.rpc('get_pending_fraud_reviews', {
      p_limit: limit,
      p_offset: offset
    });
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching pending fraud reviews:', error);
    throw error;
  }
}

export async function reviewCredentialFraud(
  analysisId: string, 
  reviewStatus: 'cleared' | 'confirmed_fraud', 
  reviewNotes: string
) {
  try {
    const { error } = await supabase.rpc('review_credential_fraud', {
      p_analysis_id: analysisId,
      p_review_status: reviewStatus,
      p_review_notes: reviewNotes
    });
      
    if (error) throw error;
    
    // Log the review action
    await supabase.rpc('log_fraud_detection_event', {
      p_event_type: `fraud_review_${reviewStatus}`,
      p_details: JSON.stringify({
        analysis_id: analysisId,
        review_notes: reviewNotes
      })
    });
      
    return true;
  } catch (error) {
    console.error('Error reviewing credential fraud:', error);
    throw error;
  }
}

export async function getFraudMetrics() {
  try {
    const { data, error } = await supabase.rpc('get_fraud_metrics');
      
    if (error) {
      // If the function doesn't exist yet, return default metrics
      return {
        high_risk_pending: 0,
        confirmed_fraud_count: 0,
        false_positive_count: 0,
        average_risk_score: 0,
        detected_today: 0,
        duplicate_count: 0,
        alteration_count: 0
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching fraud metrics:', error);
    // Return default metrics on error
    return {
      high_risk_pending: 0,
      confirmed_fraud_count: 0,
      false_positive_count: 0,
      average_risk_score: 0,
      detected_today: 0,
      duplicate_count: 0,
      alteration_count: 0
    };
  }
}

export async function getUserReputationScore(userId: string) {
  try {
    const { data, error } = await supabase.rpc('get_user_reputation', {
      p_user_id: userId
    });
      
    if (error) {
      // If no reputation record exists, return default values
      return {
        user_id: userId,
        trust_score: 100,
        verification_count: 0,
        fraud_attempts: 0
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user reputation:', error);
    throw error;
  }
}

export async function logFraudDetectionEvent(
  eventType: string, 
  userId: string | null, 
  credentialId: string | null, 
  details: any
) {
  try {
    // Create a log entry
    const { error } = await supabase.rpc('log_fraud_detection_event', {
      p_event_type: eventType,
      p_user_id: userId,
      p_credential_id: credentialId,
      p_details: JSON.stringify(details)
    });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error logging fraud detection event:', error);
    return false;
  }
}
