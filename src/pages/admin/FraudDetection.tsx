
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  AlertTriangle, 
  Shield, 
  FileCheck, 
  UserX,
  BarChart2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getPendingFraudReviews, 
  reviewCredentialFraud,
  getFraudMetrics,
  CredentialAnalysisResult
} from '@/services/fraudDetectionService';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FraudMetrics {
  high_risk_pending: number;
  confirmed_fraud_count: number;
  false_positive_count: number;
  average_risk_score: number;
  detected_today: number;
  duplicate_count: number;
  alteration_count: number;
}

const FraudDetection: React.FC = () => {
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [metrics, setMetrics] = useState<FraudMetrics | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load metrics
      const metricsData = await getFraudMetrics();
      setMetrics(metricsData as FraudMetrics);
      
      // Load pending reviews
      const reviews = await getPendingFraudReviews(20, 0);
      setPendingReviews(reviews || []);
    } catch (error) {
      console.error('Error loading fraud detection data:', error);
      toast.error('Failed to load fraud detection data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReviewFraud = async (analysisId: string, status: 'cleared' | 'confirmed_fraud') => {
    try {
      await reviewCredentialFraud(analysisId, status, reviewNotes);
      toast.success(`Credential ${status === 'cleared' ? 'cleared' : 'marked as fraudulent'}`);
      
      // Refresh data
      loadData();
      setSelectedAnalysis(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error reviewing credential:', error);
      toast.error('Failed to update review status');
    }
  };
  
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-yellow-950';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
        <span className="ml-2 text-lg">Loading fraud detection dashboard...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Fraud Detection
        </h1>
        
        <Button onClick={loadData}>
          Refresh Data
        </Button>
      </div>
      
      <Tabs
        defaultValue="dashboard" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-1">
            <BarChart2 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Pending Reviews ({metrics?.high_risk_pending || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Pending High Risk
                </CardTitle>
                <CardDescription>
                  Credentials requiring review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics?.high_risk_pending || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <UserX className="h-5 w-5 text-red-500" />
                  Confirmed Fraud
                </CardTitle>
                <CardDescription>
                  Total confirmed cases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics?.confirmed_fraud_count || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-green-500" />
                  False Positives
                </CardTitle>
                <CardDescription>
                  Cleared after review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics?.false_positive_count || 0}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-500" />
                  Detected Today
                </CardTitle>
                <CardDescription>
                  New cases today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metrics?.detected_today || 0}</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Additional metrics and charts can be added here */}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingReviews.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-xl font-medium">No pending reviews</p>
                <p className="text-muted-foreground">
                  All credentials have been reviewed. Check back later.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingReviews.map((review) => (
              <Card key={review.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {review.credentials?.title || 'Unnamed Credential'}
                      </CardTitle>
                      <CardDescription>
                        Issued by: {review.credentials?.issuer || 'Unknown Issuer'}
                      </CardDescription>
                    </div>
                    <Badge className={getRiskLevelColor(review.risk_level)}>
                      {review.risk_level.toUpperCase()} RISK - Score: {review.risk_score}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Detection Methods</h4>
                      <div className="flex flex-wrap gap-1">
                        {review.detection_method?.map((method: string, idx: number) => (
                          <Badge key={idx} variant="outline">
                            {method}
                          </Badge>
                        ))}
                      </div>
                      
                      <h4 className="font-medium mt-3 mb-1">Credential Details</h4>
                      <p className="text-sm text-muted-foreground">
                        Type: {review.credentials?.credential_type || 'Unknown'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Issued: {review.credentials?.issue_date ? new Date(review.credentials?.issue_date).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Detection Details</h4>
                      <pre className="text-xs bg-muted p-2 rounded max-h-24 overflow-auto">
                        {JSON.stringify(review.detection_details, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedAnalysis(review)}
                      >
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Review Credential</DialogTitle>
                        <DialogDescription>
                          Determine whether this credential is fraudulent or a false positive.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <h3 className="font-medium">Review Notes</h3>
                          <Textarea
                            placeholder="Add your review notes here..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            rows={4}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter className="gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => handleReviewFraud(review.id, 'cleared')}
                        >
                          Mark as False Positive
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleReviewFraud(review.id, 'confirmed_fraud')}
                        >
                          Confirm Fraud
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FraudDetection;
