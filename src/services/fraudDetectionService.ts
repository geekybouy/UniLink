
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
    // Insert the analysis directly
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
    
    const analysisId = data.id;
    
    // If there are issues, store them as anomalies
    if (analysisResult.detectionDetails.issues.length > 0) {
      const anomalies = analysisResult.detectionDetails.issues.map(issue => ({
        analysis_id: analysisId,
        anomaly_type: issue.type,
        severity: issue.severity,
        confidence_score: issue.severity * 10, // Convert severity to a 0-100 score
        description: issue.details.message || `Detected ${issue.type}`,
        evidence: issue.details
      }));
      
      // Insert anomalies directly
      const { error: anomalyError } = await supabase
        .from('credential_anomalies')
        .insert(anomalies);
        
      if (anomalyError) throw anomalyError;
    }
    
    return analysisId;
  } catch (error) {
    console.error('Error storing credential analysis:', error);
    throw error;
  }
}

export async function getFraudAnalysisForCredential(credentialId: string): Promise<CredentialAnalysisResult | null> {
  try {
    // Query the analysis directly
    const { data, error } = await supabase
      .from('credential_fraud_analysis')
      .select(`
        id,
        risk_score,
        risk_level,
        detection_method,
        detection_details,
        credential_anomalies (
          id,
          anomaly_type,
          severity,
          evidence
        )
      `)
      .eq('credential_id', credentialId)
      .order('detection_timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw error;
    }
    
    if (!data) return null;
    
    // Transform to match the expected interface
    const result: CredentialAnalysisResult = {
      riskScore: data.risk_score,
      riskLevel: data.risk_level,
      detectionMethods: data.detection_method,
      detectionDetails: {
        issues: data.credential_anomalies.map((anomaly: any) => ({
          type: anomaly.anomaly_type,
          severity: anomaly.severity,
          details: anomaly.evidence
        })),
        anomalies: []
      }
    };
    
    return result;
  } catch (error) {
    console.error('Error fetching fraud analysis:', error);
    return null;
  }
}

export async function getPendingFraudReviews(limit = 10, offset = 0) {
  try {
    // Query pending reviews directly
    const { data, error } = await supabase
      .from('credential_fraud_analysis')
      .select(`
        id,
        credential_id,
        risk_score,
        risk_level,
        detection_timestamp,
        detection_method,
        detection_details,
        credentials:credential_id (id, title, issuer, user_id, issue_date, credential_type, verification_status),
        credential_anomalies (*)
      `)
      .eq('review_status', 'pending')
      .order('risk_score', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    return data || [];
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
    // Update the review status directly
    const { error } = await supabase
      .from('credential_fraud_analysis')
      .update({
        review_status: reviewStatus,
        review_notes: reviewNotes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', analysisId);
    
    if (error) throw error;
    
    // Log the review action
    await logFraudDetectionEvent(
      `fraud_review_${reviewStatus}`,
      null,
      null,
      {
        analysis_id: analysisId,
        review_notes: reviewNotes
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error reviewing credential fraud:', error);
    throw error;
  }
}

export async function getFraudMetrics() {
  try {
    // Get number of high risk pending reviews
    const { data: highRiskPending, error: highRiskError } = await supabase
      .from('credential_fraud_analysis')
      .select('id', { count: 'exact' })
      .in('risk_level', ['high', 'critical'])
      .eq('review_status', 'pending');
      
    if (highRiskError) throw highRiskError;
    
    // Get number of confirmed fraud
    const { data: confirmedFraud, error: confirmedError } = await supabase
      .from('credential_fraud_analysis')
      .select('id', { count: 'exact' })
      .eq('review_status', 'confirmed_fraud');
      
    if (confirmedError) throw confirmedError;
    
    // Get number of false positives
    const { data: falsePositives, error: falsePositiveError } = await supabase
      .from('credential_fraud_analysis')
      .select('id', { count: 'exact' })
      .eq('review_status', 'cleared');
      
    if (falsePositiveError) throw falsePositiveError;
    
    // Get average risk score
    const { data: averageRisk, error: averageError } = await supabase
      .from('credential_fraud_analysis')
      .select('risk_score');
      
    if (averageError) throw averageError;
    
    const avgScore = averageRisk && averageRisk.length > 0
      ? averageRisk.reduce((sum: number, item: any) => sum + item.risk_score, 0) / averageRisk.length
      : 0;
    
    // Get detected today
    const { data: detectedToday, error: todayError } = await supabase
      .from('credential_fraud_analysis')
      .select('id', { count: 'exact' })
      .gte('detection_timestamp', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());
      
    if (todayError) throw todayError;
    
    return {
      high_risk_pending: highRiskPending?.length || 0,
      confirmed_fraud_count: confirmedFraud?.length || 0,
      false_positive_count: falsePositives?.length || 0,
      average_risk_score: Math.round(avgScore * 10) / 10,
      detected_today: detectedToday?.length || 0,
      duplicate_count: 0, // These will need separate queries
      alteration_count: 0
    };
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
    // Query user reputation directly
    const { data, error } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('user_id', userId)
      .single();
      
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
    // Insert log entry directly
    const { error } = await supabase
      .from('fraud_detection_logs')
      .insert({
        event_type: eventType,
        user_id: userId,
        credential_id: credentialId,
        details: details
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error logging fraud detection event:', error);
    return false;
  }
}
