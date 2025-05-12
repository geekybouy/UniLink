
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
      
      await supabase
        .from('credential_anomalies')
        .insert(anomalies);
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
    const { data, error } = await supabase
      .from('credential_fraud_analysis')
      .select('*, credential_anomalies(*)')
      .eq('credential_id', credentialId)
      .single();
    
    if (error) throw error;
    if (!data) return null;
    
    return {
      riskScore: data.risk_score,
      riskLevel: data.risk_level,
      detectionMethods: data.detection_method,
      detectionDetails: {
        issues: data.credential_anomalies.map((anomaly: any) => ({
          type: anomaly.anomaly_type,
          severity: anomaly.severity,
          details: anomaly.evidence
        })),
        anomalies: data.credential_anomalies
      }
    };
  } catch (error) {
    console.error('Error fetching fraud analysis:', error);
    throw error;
  }
}

export async function getPendingFraudReviews(limit = 10, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('credential_fraud_analysis')
      .select('*, credentials(*)')
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
        reviewed_at: new Date().toISOString()
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
    const { data: fraudAnalysis, error } = await supabase
      .from('credential_fraud_analysis')
      .select('*');
      
    if (error) {
      // If the query fails, return default metrics
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
    
    // Calculate metrics from the raw data
    const today = new Date().toISOString().split('T')[0];
    
    const metrics = {
      high_risk_pending: fraudAnalysis.filter(item => 
        (item.risk_level === 'high' || item.risk_level === 'critical') && 
        item.review_status === 'pending'
      ).length,
      confirmed_fraud_count: fraudAnalysis.filter(item => 
        item.review_status === 'confirmed_fraud'
      ).length,
      false_positive_count: fraudAnalysis.filter(item => 
        item.review_status === 'cleared'
      ).length,
      average_risk_score: fraudAnalysis.length > 0 
        ? fraudAnalysis.reduce((sum, item) => sum + item.risk_score, 0) / fraudAnalysis.length 
        : 0,
      detected_today: fraudAnalysis.filter(item => 
        item.detection_timestamp?.startsWith(today)
      ).length,
      duplicate_count: 0, // We'll need a separate query for these
      alteration_count: 0
    };
    
    // Get anomaly counts
    const { data: anomalies } = await supabase
      .from('credential_anomalies')
      .select('anomaly_type');
      
    if (anomalies) {
      metrics.duplicate_count = anomalies.filter(a => a.anomaly_type === 'duplicate_credential').length;
      metrics.alteration_count = anomalies.filter(a => a.anomaly_type === 'document_alteration').length;
    }
    
    return metrics;
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
    const { error } = await supabase
      .from('fraud_detection_events')
      .insert({
        event_type: eventType,
        user_id: userId,
        credential_id: credentialId,
        details: details,
        created_at: new Date().toISOString()
      });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error logging fraud detection event:', error);
    return false;
  }
}
