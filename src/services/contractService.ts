
// Simulated smart contract "engine"

import { v4 as uuidv4 } from 'uuid';
import { SmartContractCredential, SmartContractAuditEntry, ContractStatus } from '@/types/smartContract';

const STORAGE_KEY = 'smart_contract_credentials';
const AUDIT_KEY = 'smart_contract_audit';

function loadContracts(): SmartContractCredential[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}
function saveContracts(contracts: SmartContractCredential[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
}
function loadAudit(): SmartContractAuditEntry[] {
  return JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
}
function saveAudit(audit: SmartContractAuditEntry[]) {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(audit));
}

export const contractService = {
  getAll(): SmartContractCredential[] {
    return loadContracts();
  },
  issue({ title, ownerId, expiryDate, isHighValue = false }: { title: string; ownerId: string; expiryDate: string; isHighValue?: boolean }) {
    const credential: SmartContractCredential = {
      id: uuidv4(),
      title,
      ownerId,
      status: isHighValue ? 'awaiting_multisig' : 'issued',
      expiryDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isHighValue,
      approvers: isHighValue ? ['admin1', 'admin2', 'admin3'] : [],
      requiredApprovals: isHighValue ? 2 : undefined,
      approvedBy: [],
      version: 1,
    };
    const contracts = loadContracts();
    contracts.push(credential);
    saveContracts(contracts);
    contractService.logAudit(credential.id, 'issue', ownerId, `Credential issued`);
    return credential;
  },
  approveMultisig(credentialId: string, approver: string) {
    const contracts = loadContracts();
    const cred = contracts.find(c => c.id === credentialId);
    if (!cred || cred.status !== 'awaiting_multisig' || cred.approvedBy?.includes(approver)) return;
    cred.approvedBy = [...(cred.approvedBy || []), approver];
    contractService.logAudit(cred.id, 'multisig_approve', approver, `Approved credential`);
    if ((cred.approvedBy?.length || 0) >= (cred.requiredApprovals || 2)) {
      cred.status = 'issued';
      contractService.logAudit(cred.id, 'multisig_finalized', approver, 'Multi-signature finalized, credential issued');
    }
    cred.updatedAt = new Date().toISOString();
    saveContracts(contracts);
  },
  expire(credentialId: string) {
    const contracts = loadContracts();
    const cred = contracts.find(c => c.id === credentialId);
    if (cred && cred.status !== 'expired') {
      cred.status = 'expired';
      cred.updatedAt = new Date().toISOString();
      contractService.logAudit(cred.id, 'expire', '', 'Credential expired');
      saveContracts(contracts);
    }
  },
  renew(credentialId: string, newExpiry: string, by: string) {
    const contracts = loadContracts();
    const cred = contracts.find(c => c.id === credentialId);
    if (cred) {
      cred.status = 'issued';
      cred.expiryDate = newExpiry;
      cred.updatedAt = new Date().toISOString();
      cred.version += 1;
      contractService.logAudit(cred.id, 'renew', by, `Credential renewed`);
      saveContracts(contracts);
    }
  },
  update(credentialId: string, changes: Partial<SmartContractCredential>, by: string) {
    const contracts = loadContracts();
    const cred = contracts.find(c => c.id === credentialId);
    if (cred) {
      Object.assign(cred, changes, { updatedAt: new Date().toISOString(), version: cred.version + 1 });
      contractService.logAudit(cred.id, 'update', by, `Credential updated`);
      saveContracts(contracts);
    }
  },
  batchExpire(ids: string[]) {
    ids.forEach(id => contractService.expire(id));
  },
  fetchAudit(credentialId?: string): SmartContractAuditEntry[] {
    const all = loadAudit();
    return credentialId ? all.filter(a => a.credentialId === credentialId) : all;
  },
  logAudit(credentialId: string, action: string, by: string, details?: string) {
    const audit = loadAudit();
    audit.unshift({
      id: uuidv4(),
      credentialId,
      action,
      by,
      timestamp: new Date().toISOString(),
      details,
    });
    saveAudit(audit);
  }
};
