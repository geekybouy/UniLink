
-- Create stored procedures to handle fraud detection operations

-- Function to insert fraud analysis
CREATE OR REPLACE FUNCTION insert_credential_fraud_analysis(
  p_credential_id UUID,
  p_risk_score INTEGER,
  p_risk_level fraud_risk_level,
  p_detection_method TEXT[],
  p_detection_details JSONB
) RETURNS RECORD AS $$
DECLARE
  analysis_id UUID;
  result RECORD;
BEGIN
  INSERT INTO credential_fraud_analysis (
    credential_id,
    risk_score,
    risk_level,
    detection_method,
    detection_details
  ) VALUES (
    p_credential_id,
    p_risk_score,
    p_risk_level,
    p_detection_method,
    p_detection_details
  )
  RETURNING id INTO analysis_id;
  
  SELECT id FROM credential_fraud_analysis WHERE id = analysis_id INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to insert credential anomalies
CREATE OR REPLACE FUNCTION insert_credential_anomalies(
  p_anomalies JSONB
) RETURNS VOID AS $$
BEGIN
  INSERT INTO credential_anomalies (
    analysis_id,
    anomaly_type,
    severity,
    confidence_score,
    description,
    evidence
  )
  SELECT 
    (elem->>'analysis_id')::UUID,
    elem->>'anomaly_type',
    (elem->>'severity')::INTEGER,
    (elem->>'confidence_score')::DECIMAL,
    elem->>'description',
    (elem->>'evidence')::JSONB
  FROM jsonb_array_elements(p_anomalies) AS elem;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get credential fraud analysis
CREATE OR REPLACE FUNCTION get_credential_fraud_analysis(
  p_credential_id UUID
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT 
    jsonb_build_object(
      'riskScore', cfa.risk_score,
      'riskLevel', cfa.risk_level,
      'detectionMethods', cfa.detection_method,
      'detectionDetails', jsonb_build_object(
        'issues', COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'type', ca.anomaly_type,
              'severity', ca.severity,
              'details', ca.evidence
            )
          )
          FROM credential_anomalies ca
          WHERE ca.analysis_id = cfa.id),
          '[]'::jsonb
        ),
        'anomalies', '[]'::jsonb
      )
    )
  INTO result
  FROM credential_fraud_analysis cfa
  WHERE cfa.credential_id = p_credential_id
  ORDER BY cfa.detection_timestamp DESC
  LIMIT 1;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending fraud reviews
CREATE OR REPLACE FUNCTION get_pending_fraud_reviews(
  p_limit INTEGER,
  p_offset INTEGER
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', cfa.id,
      'credential_id', cfa.credential_id,
      'risk_score', cfa.risk_score,
      'risk_level', cfa.risk_level,
      'detection_timestamp', cfa.detection_timestamp,
      'detection_method', cfa.detection_method,
      'detection_details', cfa.detection_details,
      'credential', (
        SELECT jsonb_build_object(
          'id', c.id,
          'title', c.title,
          'issuer', c.issuer,
          'user_id', c.user_id,
          'issue_date', c.issue_date,
          'credential_type', c.credential_type,
          'verification_status', c.verification_status
        )
        FROM credentials c
        WHERE c.id = cfa.credential_id
      ),
      'anomalies', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', ca.id,
            'anomaly_type', ca.anomaly_type,
            'severity', ca.severity,
            'confidence_score', ca.confidence_score,
            'description', ca.description,
            'evidence', ca.evidence
          )
        )
        FROM credential_anomalies ca
        WHERE ca.analysis_id = cfa.id
      )
    )
  )
  INTO result
  FROM credential_fraud_analysis cfa
  WHERE cfa.review_status = 'pending'
  ORDER BY cfa.risk_score DESC
  LIMIT p_limit
  OFFSET p_offset;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to review credential fraud
CREATE OR REPLACE FUNCTION review_credential_fraud(
  p_analysis_id UUID,
  p_review_status TEXT,
  p_review_notes TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE credential_fraud_analysis
  SET 
    review_status = p_review_status,
    review_notes = p_review_notes,
    review_timestamp = now(),
    reviewed_by = auth.uid()
  WHERE id = p_analysis_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get fraud metrics
CREATE OR REPLACE FUNCTION get_fraud_metrics() RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'high_risk_pending', (
      SELECT COUNT(*) 
      FROM credential_fraud_analysis 
      WHERE (risk_level = 'high' OR risk_level = 'critical') AND review_status = 'pending'
    ),
    'confirmed_fraud_count', (
      SELECT COUNT(*) 
      FROM credential_fraud_analysis 
      WHERE review_status = 'confirmed_fraud'
    ),
    'false_positive_count', (
      SELECT COUNT(*) 
      FROM credential_fraud_analysis 
      WHERE review_status = 'cleared'
    ),
    'average_risk_score', (
      SELECT AVG(risk_score) 
      FROM credential_fraud_analysis
    ),
    'detected_today', (
      SELECT COUNT(*) 
      FROM credential_fraud_analysis 
      WHERE detection_timestamp::date = CURRENT_DATE
    ),
    'duplicate_count', (
      SELECT COUNT(*) 
      FROM credential_anomalies 
      WHERE anomaly_type = 'duplicate_credential'
    ),
    'alteration_count', (
      SELECT COUNT(*) 
      FROM credential_anomalies 
      WHERE anomaly_type = 'document_alteration'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user reputation
CREATE OR REPLACE FUNCTION get_user_reputation(
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', ur.user_id,
    'trust_score', ur.trust_score,
    'verification_count', ur.verification_count,
    'fraud_attempts', ur.fraud_attempts
  )
  INTO result
  FROM user_reputation ur
  WHERE ur.user_id = p_user_id;
  
  IF result IS NULL THEN
    result := jsonb_build_object(
      'user_id', p_user_id,
      'trust_score', 100,
      'verification_count', 0,
      'fraud_attempts', 0
    );
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log fraud detection events
CREATE OR REPLACE FUNCTION log_fraud_detection_event(
  p_event_type TEXT,
  p_user_id UUID DEFAULT NULL,
  p_credential_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
BEGIN
  INSERT INTO fraud_detection_logs (
    event_type,
    user_id,
    credential_id,
    details,
    ip_address
  ) VALUES (
    p_event_type,
    p_user_id,
    p_credential_id,
    p_details,
    (SELECT current_setting('request.headers', true)::jsonb->'x-forwarded-for')::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
