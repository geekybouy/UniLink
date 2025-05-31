
// Types for contract simulation

export type ContractStatus = 'issued' | 'pending' | 'expired' | 'renewal_pending' | 'updated' | 'awaiting_multisig' | 'failed';

export type SmartContractCredential = {
  id: string;
  ownerId: string;
  title: string;
  status: ContractStatus;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
  isHighValue: boolean;
  approvers?: string[]; // For multisig
  requiredApprovals?: number;
  approvedBy?: string[];
  version: number;
};

export type SmartContractAuditEntry = {
  id: string;
  credentialId: string;
  action: string;
  by: string;
  timestamp: string;
  details?: string;
};
