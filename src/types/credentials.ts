
export interface Credential {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  description: string | null;
  credential_type: 'academic' | 'certification' | 'experience';
  blockchain_hash: string | null;
  verification_status: 'pending' | 'verified' | 'expired';
  created_at: string;
}
