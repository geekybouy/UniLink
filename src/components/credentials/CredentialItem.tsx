
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { useFraudDetection } from '@/hooks/useFraudDetection';
import CredentialRiskIndicator from './CredentialRiskIndicator';
import { getFraudAnalysisForCredential } from '@/services/fraudDetectionService';

interface CredentialItemProps {
  credential: any;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

const CredentialItem = ({ credential, onDelete, onShare }: CredentialItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCredential, setEditedCredential] = useState({ ...credential });
  const [fraudAnalysis, setFraudAnalysis] = useState<any>(null);
  const { detectFraud } = useFraudDetection();

  useEffect(() => {
    // Load fraud analysis when component mounts
    const loadFraudAnalysis = async () => {
      try {
        const analysis = await getFraudAnalysisForCredential(credential.id);
        if (analysis) {
          setFraudAnalysis(analysis);
        }
      } catch (error) {
        console.error('Error fetching fraud analysis:', error);
      }
    };

    loadFraudAnalysis();

    // If no existing analysis is found, run detection
    if (!fraudAnalysis) {
      detectFraud(credential).then((result) => {
        if (result) {
          setFraudAnalysis({
            risk_score: result.riskScore,
            risk_level: result.riskLevel
          });
        }
      });
    }
  }, [credential.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedCredential(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Implement save logic here (e.g., API call)
    console.log('Saving credential:', editedCredential);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    onDelete(credential.id);
  };

  const handleShareClick = () => {
    onShare(credential.id);
  };

  // Get verification status display properties
  const getVerificationStatus = () => {
    if (credential.verification_status === 'verified') {
      return {
        variant: 'success' as const, // Type assertion for TypeScript
        text: 'Verified',
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      };
    } else if (credential.verification_status === 'pending') {
      return {
        variant: 'secondary' as const, // Type assertion for TypeScript
        text: 'Pending',
        icon: <Clock className="h-3 w-3 mr-1" />
      };
    } else {
      return {
        variant: 'destructive' as const, // Type assertion for TypeScript
        text: 'Rejected',
        icon: <XCircle className="h-3 w-3 mr-1" />
      };
    }
  };

  const status = getVerificationStatus();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{credential.title}</CardTitle>
          {fraudAnalysis && (
            <CredentialRiskIndicator 
              riskLevel={fraudAnalysis.risk_level} 
              riskScore={fraudAnalysis.risk_score} 
            />
          )}
        </div>
        <CardDescription>{credential.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center space-x-4">
            <p className="text-sm font-medium leading-none">Issuer:</p>
            <p className="text-sm text-muted-foreground">{credential.issuer}</p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm font-medium leading-none">Issue Date:</p>
            <p className="text-sm text-muted-foreground">{credential.issue_date}</p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm font-medium leading-none">Credential ID:</p>
            <p className="text-sm text-muted-foreground">{credential.credential_id}</p>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-sm font-medium leading-none">Verification Status:</p>
            <Badge variant={status.variant}>
              {status.icon}
              {status.text}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleShareClick}>Share</Button>
        <div className="space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Credential</DialogTitle>
                <DialogDescription>
                  Make changes to your credential here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={editedCredential.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={editedCredential.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="issuer">Issuer</Label>
                  <Input
                    id="issuer"
                    name="issuer"
                    value={editedCredential.issuer}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input
                    id="issue_date"
                    name="issue_date"
                    type="date"
                    value={editedCredential.issue_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="credential_id">Credential ID</Label>
                  <Input
                    id="credential_id"
                    name="credential_id"
                    value={editedCredential.credential_id}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleSave}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleDeleteClick}>Delete</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CredentialItem;
