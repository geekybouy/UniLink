
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
    const { data, error } = await supabase
      .from('credential_fraud_analysis')
      .insert({
        credential_id: credentialId,
        risk_score: analysisResult.riskScore,
        risk_level: analysisResult.riskLevel,
        detection_method: analysisResult.detectionMethods,
        detection_details: analysisResult.detectionDetails
      })
      .select('id')
      .single();

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
      
      const { error: anomalyError } = await supabase
        .from('credential_anomalies')
        .insert(anomalies);
        
      if (anomalyError) console.error('Error storing anomalies:', anomalyError);
    }
    
    return data.id;
  } catch (error) {
    console.error('Error storing credential analysis:', error);
    throw error;
  }
}

export async function getFraudAnalysisForCredential(credentialId: string) {
  try {
    // Get the fraud analysis for the credential
    const { data, error } = await supabase
      .from('credential_fraud_analysis')
      .select(`
        *,
        credential_anomalies (*)
      `)
      .eq('credential_id', credentialId)
      .order('detection_timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    
    return data;
  } catch (error) {
    console.error('Error fetching fraud analysis:', error);
    throw error;
  }
}

export async function getPendingFraudReviews(limit = 10, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('credential_fraud_analysis')
      .select(`
        *,
        credential:credential_id (
          id,
          title,
          issuer,
          user_id,
          issue_date,
          credential_type,
          verification_status
        ),
        credential_anomalies (*)
      `)
      .eq('review_status', 'pending')
      .order('risk_score', { ascending: false })
      .range(offset, offset + limit - 1);
      
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
    const { error } = await supabase
      .from('credential_fraud_analysis')
      .update({
        review_status: reviewStatus,
        review_notes: reviewNotes,
        review_timestamp: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', analysisId);
      
    if (error) throw error;
    
    // Log the review action
    await supabase
      .from('fraud_detection_logs')
      .insert({
        event_type: `fraud_review_${reviewStatus}`,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        details: {
          analysis_id: analysisId,
          review_notes: reviewNotes
        }
      });
      
    return true;
  } catch (error) {
    console.error('Error reviewing credential fraud:', error);
    throw error;
  }
}

export async function getFraudMetrics() {
  try {
    const { data, error } = await supabase
      .from('fraud_detection_metrics')
      .select('*')
      .single();
      
    if (error) {
      // If the view doesn't exist yet, return default metrics
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
    const { data, error } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    
    // If no reputation record exists, return default values
    if (!data) {
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
    const { error } = await supabase
      .from('fraud_detection_logs')
      .insert({
        event_type: eventType,
        user_id: userId,
        credential_id: credentialId,
        details,
        ip_address: null // Client-side can't reliably get IP
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error logging fraud detection event:', error);
    return false;
  }
}
