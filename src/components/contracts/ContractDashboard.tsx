
import React from "react";
import { contractService } from "@/services/contractService";
import { SmartContractCredential } from "@/types/smartContract";
import ContractAuditTrail from "./ContractAuditTrail";
import ContractMultiSigDialog from "./ContractMultiSigDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, X, History, ClipboardCheck, BadgeCheck } from "lucide-react"; // Gas: simulate

function statusColor(status: string) {
  switch (status) {
    case "issued": return "bg-green-100 text-green-700";
    case "pending": return "bg-yellow-100 text-yellow-700";
    case "expired": return "bg-red-100 text-red-700";
    case "renewal_pending": return "bg-blue-100 text-blue-700";
    case "awaiting_multisig": return "bg-orange-100 text-orange-800";
    case "failed": return "bg-destructive text-destructive-foreground";
    default: return "bg-gray-100 text-gray-800";
  }
}

export default function ContractDashboard() {
  const [creds, setCreds] = React.useState<SmartContractCredential[]>([]);
  const [showCreate, setShowCreate] = React.useState(false);
  const [input, setInput] = React.useState({ title: "", expiry: "", highValue: false });
  const [multisigDialog, setMultisigDialog] = React.useState<{ open: boolean; credential?: SmartContractCredential }>({ open: false });
  const [currentUser] = React.useState("admin1");

  React.useEffect(() => {
    setCreds(contractService.getAll());
  }, []);

  // Simulate expirations (cron: in production would use backend)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      creds.forEach(c => {
        if (c.status !== "expired" && new Date(c.expiryDate) < now) {
          contractService.expire(c.id);
        }
      });
      setCreds(contractService.getAll());
    }, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [creds]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.title || !input.expiry) return;
    contractService.issue({
      title: input.title,
      ownerId: currentUser,
      expiryDate: input.expiry,
      isHighValue: input.highValue,
    });
    setCreds(contractService.getAll());
    setInput({ title: "", expiry: "", highValue: false });
    setShowCreate(false);
  };

  const handleBatchExpire = () => {
    const toExpire = creds.filter(c => !["expired", "pending"].includes(c.status)).map(c => c.id);
    contractService.batchExpire(toExpire);
    setCreds(contractService.getAll());
  };

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-3"><BadgeCheck className="h-6 w-6" /> Smart Contract Credential Dashboard</h2>
      <div className="flex gap-4 my-4">
        <Button onClick={() => setShowCreate(v => !v)} variant="default">
          {showCreate ? "Cancel" : "Create Credential"}
        </Button>
        <Button onClick={handleBatchExpire} variant="destructive" className="ml-auto"><ClipboardCheck className="h-4 w-4 mr-1" />Batch Expire</Button>
      </div>
      {showCreate && (
        <form className="mb-4 flex gap-2 flex-wrap items-center" onSubmit={handleCreate}>
          <Input className="w-1/3" required placeholder="Credential Title" value={input.title} onChange={e => setInput(a => ({ ...a, title: e.target.value }))} />
          <Input className="w-1/4" required type="date" value={input.expiry} onChange={e => setInput(a => ({ ...a, expiry: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={input.highValue} onChange={e => setInput(a => ({ ...a, highValue: e.target.checked }))} />
            High-Value (Multi-Sig)
          </label>
          <Button type="submit" variant="outline">Simulate Issue</Button>
        </form>
      )}

      <div className="divide-y space-y-2 bg-white rounded shadow">
        {creds.length === 0 && <div className="py-8 text-center text-muted-foreground">No credentials issued.</div>}
        {creds.map(cred => (
          <div key={cred.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{cred.title}</span>
                  <Badge className={statusColor(cred.status)}>{cred.status.toUpperCase()}</Badge>
                  {cred.isHighValue && <Badge variant="outline">Multi-Sig</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">Owner: {cred.ownerId}</div>
                <div className="text-xs">Expires: {cred.expiryDate}</div>
                <div className="text-xs">Version: {cred.version}</div>
              </div>
              <div className="flex gap-2">
                {cred.status === "awaiting_multisig" &&
                  <Button size="sm" variant="secondary" onClick={() => setMultisigDialog({ open: true, credential: cred })}>Approve (Multi-Sig)</Button>}
                {cred.status === "expired" &&
                  <Button size="sm" variant="outline" onClick={() => { contractService.renew(cred.id, new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10), currentUser); setCreds(contractService.getAll()); }}>
                    Renew +7d
                  </Button>}
                <Button size="icon" variant="ghost" onClick={() => { contractService.update(cred.id, { title: cred.title + " [updated]" }, currentUser); setCreds(contractService.getAll()); }} title="Update"><Check /></Button>
                <Button size="icon" variant="destructive" onClick={() => { contractService.expire(cred.id); setCreds(contractService.getAll()); }} title="Expire"><X /></Button>
                <Button size="icon" variant="ghost" onClick={() => window.alert('Gas Optimization simulated')} title="Gas Optimization"><History /></Button>
              </div>
            </div>
            <div className="mt-1">
              <ContractAuditTrail credentialId={cred.id} />
            </div>
            {/* MultiSig Dialog */}
            {multisigDialog.open && multisigDialog.credential?.id === cred.id && (
              <ContractMultiSigDialog
                credential={cred}
                open={multisigDialog.open}
                currentUser={currentUser}
                onClose={() => setMultisigDialog({ open: false })}
                onApproved={() => setCreds(contractService.getAll())}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
