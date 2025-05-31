
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { contractService } from "@/services/contractService";
import { Badge } from "@/components/ui/badge";
import { SmartContractCredential } from "@/types/smartContract";

interface Props {
  credential: SmartContractCredential;
  open: boolean;
  currentUser: string;
  onClose: () => void;
  onApproved: () => void;
}

export default function ContractMultiSigDialog({ credential, open, currentUser, onClose, onApproved }: Props) {
  const alreadyApproved = credential.approvedBy?.includes(currentUser);

  const handleApprove = () => {
    contractService.approveMultisig(credential.id, currentUser);
    onApproved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Multi-Signature Verification</DialogTitle>
        </DialogHeader>
        <div className="my-2">
          <p>
            This is a high-value credential. Multi-signature approval is required. Approvers:
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {credential.approvers?.map(a => (
              <Badge key={a} variant={credential.approvedBy?.includes(a) ? "success" : "secondary"}>{a}</Badge>
            ))}
          </div>
          <div className="mt-4 text-sm">
            Required approvals: <b>{credential.requiredApprovals}</b><br />
            Approved by: <b>{credential.approvedBy?.length}</b>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleApprove} disabled={alreadyApproved} type="button">
            {alreadyApproved ? "Already Approved" : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
