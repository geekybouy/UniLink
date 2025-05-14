
import React from "react";
import { contractService } from "@/services/contractService";
import { SmartContractAuditEntry } from "@/types/smartContract";

interface Props {
  credentialId?: string;
}

const actionsMap: Record<string, string> = {
  issue: "Issued",
  update: "Updated",
  expire: "Expired",
  renew: "Renewed",
  multisig_approve: "Approval (Multi-sig)",
  multisig_finalized: "Finalized (Multi-sig Issued)",
};

export default function ContractAuditTrail({ credentialId }: Props) {
  const [logs, setLogs] = React.useState<SmartContractAuditEntry[]>([]);
  React.useEffect(() => {
    setLogs(contractService.fetchAudit(credentialId));
  }, [credentialId]);

  if (logs.length === 0) return <div className="text-xs text-muted-foreground py-4 text-center">No audit history.</div>;
  return (
    <div className="space-y-1">
      {logs.map(log => (
        <div key={log.id} className="rounded border bg-muted px-2 py-1 text-xs flex justify-between items-center">
          <span className="font-medium">{actionsMap[log.action] || log.action}</span>
          <span>{log.by}</span>
          <span>{new Date(log.timestamp).toLocaleString()}</span>
          <span>{log.details}</span>
        </div>
      ))}
    </div>
  );
}
