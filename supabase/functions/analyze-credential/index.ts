
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { credential, previousCredentials } = await req.json();
    
    // Initialize risk score and detected issues
    let riskScore = 0;
    const detectionDetails = {
      issues: [],
      anomalies: []
    };
    const detectionMethods = [];

    // 1. Check for duplicate credentials with inconsistent information
    if (previousCredentials && previousCredentials.length > 0) {
      const duplicateCheck = checkForDuplicates(credential, previousCredentials);
      if (duplicateCheck.isDuplicate) {
        riskScore += duplicateCheck.riskContribution;
        detectionMethods.push('duplicate_detection');
        detectionDetails.issues.push({
          type: 'duplicate_credential',
          severity: duplicateCheck.severity,
          details: duplicateCheck.details
        });
      }
    }

    // 2. Check for suspicious patterns in text/information
    const textPatternCheck = checkSuspiciousPatterns(credential);
    if (textPatternCheck.hasSuspiciousPatterns) {
      riskScore += textPatternCheck.riskContribution;
      detectionMethods.push('text_pattern_analysis');
      detectionDetails.issues.push({
        type: 'suspicious_text_patterns',
        severity: textPatternCheck.severity,
        details: textPatternCheck.details
      });
    }

    // 3. Check for verification anomalies
    const verificationCheck = checkVerificationAnomalies(credential);
    if (verificationCheck.hasAnomalies) {
      riskScore += verificationCheck.riskContribution;
      detectionMethods.push('verification_analysis');
      detectionDetails.issues.push({
        type: 'verification_anomaly',
        severity: verificationCheck.severity,
        details: verificationCheck.details
      });
    }

    // 4. Check for unusual credential issuance patterns
    const issuanceCheck = checkIssuancePatterns(credential);
    if (issuanceCheck.hasAnomalies) {
      riskScore += issuanceCheck.riskContribution;
      detectionMethods.push('issuance_pattern_analysis');
      detectionDetails.issues.push({
        type: 'unusual_issuance',
        severity: issuanceCheck.severity,
        details: issuanceCheck.details
      });
    }

    // Determine risk level based on score
    let riskLevel = 'low';
    if (riskScore > 75) {
      riskLevel = 'critical';
    } else if (riskScore > 50) {
      riskLevel = 'high';
    } else if (riskScore > 25) {
      riskLevel = 'medium';
    }

    // Return the analysis results
    return new Response(
      JSON.stringify({
        riskScore,
        riskLevel,
        detectionMethods,
        detectionDetails
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error analyzing credential:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

// Function to check for duplicate credentials with inconsistent information
function checkForDuplicates(credential, previousCredentials) {
  let isDuplicate = false;
  let riskContribution = 0;
  let severity = 0;
  let details = {};

  const credentialsWithSameIssuer = previousCredentials.filter(c => 
    c.issuer === credential.issuer && c.id !== credential.id
  );

  // Check for overlapping information
  for (const prevCred of credentialsWithSameIssuer) {
    // Title is similar but details are different
    if (isSimilarText(prevCred.title, credential.title) && 
        prevCred.issue_date !== credential.issue_date) {
      isDuplicate = true;
      severity = 7;
      riskContribution += 30;
      details = {
        message: "Similar credential title with different issue date",
        similar_credential_id: prevCred.id,
        similarity_score: calculateSimilarity(prevCred.title, credential.title)
      };
    }
  }

  return { isDuplicate, riskContribution, severity, details };
}

// Function to check for suspicious patterns in credential information
function checkSuspiciousPatterns(credential) {
  let hasSuspiciousPatterns = false;
  let riskContribution = 0;
  let severity = 0;
  let details = {};

  // Check for suspicious words or patterns in the content
  const suspiciousWords = ["fake", "temporary", "unofficial", "sample"];
  
  const allText = [
    credential.title, 
    credential.description, 
    credential.issuer
  ].filter(Boolean).join(" ").toLowerCase();

  for (const word of suspiciousWords) {
    if (allText.includes(word)) {
      hasSuspiciousPatterns = true;
      severity = 5;
      riskContribution += 15;
      details = {
        message: "Suspicious terminology detected in credential content",
        detected_terms: suspiciousWords.filter(word => allText.includes(word))
      };
      break;
    }
  }

  return { hasSuspiciousPatterns, riskContribution, severity, details };
}

// Function to check for verification anomalies
function checkVerificationAnomalies(credential) {
  let hasAnomalies = false;
  let riskContribution = 0;
  let severity = 0;
  let details = {};

  // If a blockchain hash exists but verification status is not verified
  if (credential.blockchain_hash && credential.verification_status !== "verified") {
    hasAnomalies = true;
    severity = 8;
    riskContribution += 35;
    details = {
      message: "Credential has blockchain record but verification status is inconsistent",
      verification_status: credential.verification_status
    };
  }

  return { hasAnomalies, riskContribution, severity, details };
}

// Function to check for unusual issuance patterns
function checkIssuancePatterns(credential) {
  let hasAnomalies = false;
  let riskContribution = 0;
  let severity = 0;
  let details = {};

  // Check if issue date is in the future
  const issueDate = new Date(credential.issue_date);
  const currentDate = new Date();
  
  if (issueDate > currentDate) {
    hasAnomalies = true;
    severity = 9;
    riskContribution += 40;
    details = {
      message: "Credential issue date is in the future",
      issue_date: credential.issue_date,
      current_date: currentDate.toISOString().split('T')[0]
    };
  }

  // Check for very recent issuance but claiming to be from long ago
  if (credential.created_at) {
    const createdAt = new Date(credential.created_at);
    const daysDifference = Math.floor((createdAt - issueDate) / (1000 * 60 * 60 * 24));
    
    // If added very recently but claims to be issued years ago
    if (daysDifference > 1825 && 
        (currentDate.getTime() - createdAt.getTime()) < (7 * 24 * 60 * 60 * 1000)) { // Added in last week
      hasAnomalies = true;
      severity = 6;
      riskContribution += 25;
      details = {
        message: "Recently added credential claims to be issued years ago",
        issue_date: credential.issue_date,
        created_at: credential.created_at,
        days_difference: daysDifference
      };
    }
  }

  return { hasAnomalies, riskContribution, severity, details };
}

// Utility function to measure text similarity
function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Simple similarity score based on character intersection
  const set1 = new Set(s1.split(''));
  const set2 = new Set(s2.split(''));
  
  const intersection = [...set1].filter(char => set2.has(char)).length;
  const union = set1.size + set2.size - intersection;
  
  return intersection / union;
}

// Utility function to check if two texts are similar
function isSimilarText(str1, str2) {
  if (!str1 || !str2) return false;
  return calculateSimilarity(str1, str2) > 0.7;
}
