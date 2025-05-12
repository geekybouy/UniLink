
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, AlertTriangle, BarChart3, CheckCircle, ChevronRight, Search, Shield, XCircle } from 'lucide-react';
import { getPendingFraudReviews, getFraudMetrics, reviewCredentialFraud } from '@/services/fraudDetectionService';
import { toast } from 'sonner';
import CredentialRiskIndicator from '@/components/credentials/CredentialRiskIndicator';

const FraudDetection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadMetrics();
    } else if (activeTab === 'reviews') {
      loadPendingReviews();
    }
  }, [activeTab]);

  const loadPendingReviews = async () => {
    setIsLoading(true);
    try {
      const data = await getPendingFraudReviews(20, 0);
      setPendingReviews(data || []);
    } catch (error) {
      console.error('Error loading pending reviews:', error);
      toast.error('Failed to load pending reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await getFraudMetrics();
      setMetrics(data || {});
    } catch (error) {
      console.error('Error loading fraud metrics:', error);
      toast.error('Failed to load fraud metrics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (status: 'cleared' | 'confirmed_fraud') => {
    if (!selectedAnalysis) return;
    
    setIsSubmitting(true);
    try {
      await reviewCredentialFraud(selectedAnalysis.id, status, reviewNotes);
      toast.success(`Credential ${status === 'cleared' ? 'cleared' : 'marked as fraudulent'}`);
      
      // Update the list by removing the reviewed item
      setPendingReviews(pendingReviews.filter(item => item.id !== selectedAnalysis.id));
      setSelectedAnalysis(null);
      setReviewNotes('');
      
      // Refresh metrics
      loadMetrics();
    } catch (error) {
      console.error('Error during review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReviews = pendingReviews.filter(review => {
    if (!searchQuery.trim()) return true;
    
    const credential = review.credential;
    const query = searchQuery.toLowerCase();
    
    return (
      credential.title?.toLowerCase().includes(query) ||
      credential.issuer?.toLowerCase().includes(query) ||
      review.risk_level?.toLowerCase().includes(query)
    );
  });

  const renderMetricCard = (title: string, value: number | string, icon: React.ReactNode, color: string) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <div className={`p-2 rounded-full ${color.replace('text', 'bg').replace('900', '100')}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getDashboardContent = () => (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {renderMetricCard(
          'High Risk Pending', 
          metrics.high_risk_pending || 0, 
          <AlertTriangle className="h-4 w-4" />, 
          'text-red-900'
        )}
        {renderMetricCard(
          'Confirmed Fraud', 
          metrics.confirmed_fraud_count || 0, 
          <XCircle className="h-4 w-4" />, 
          'text-red-900'
        )}
        {renderMetricCard(
          'False Positives', 
          metrics.false_positive_count || 0, 
          <CheckCircle className="h-4 w-4" />, 
          'text-green-900'
        )}
        {renderMetricCard(
          'Avg. Risk Score', 
          metrics.average_risk_score ? Math.round(metrics.average_risk_score) : 0, 
          <BarChart3 className="h-4 w-4" />, 
          metrics.average_risk_score > 50 ? 'text-orange-900' : 'text-blue-900'
        )}
      </div>
          
      <Card>
        <CardHeader>
          <CardTitle>Fraud Detection Statistics</CardTitle>
          <CardDescription>Overview of fraud detection system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Detection by Type</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Duplicate Credentials</span>
                    <span className="text-sm font-mono">{metrics.duplicate_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Document Alterations</span>
                    <span className="text-sm font-mono">{metrics.alteration_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Detected Today</span>
                    <span className="text-sm font-mono">{metrics.detected_today || 0}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">System Performance</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Detection Rate</span>
                    <span className="text-sm font-mono">
                      {metrics.confirmed_fraud_count && metrics.false_positive_count
                        ? `${Math.round((metrics.confirmed_fraud_count / (metrics.confirmed_fraud_count + metrics.false_positive_count)) * 100)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">False Positive Rate</span>
                    <span className="text-sm font-mono">
                      {metrics.confirmed_fraud_count && metrics.false_positive_count
                        ? `${Math.round((metrics.false_positive_count / (metrics.confirmed_fraud_count + metrics.false_positive_count)) * 100)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="ml-auto" onClick={() => setActiveTab('reviews')}>
            View Pending Reviews
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );

  const getReviewsContent = () => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <CardTitle>Pending Fraud Reviews</CardTitle>
            <CardDescription>Review and take action on flagged credentials</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reviews..."
              className="w-64 pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full border-t-2 border-primary h-6 w-6"></div>
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="divide-y">
            {filteredReviews.map((analysis) => (
              <div key={analysis.id} className="py-4">
                <div className="flex justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{analysis.credential?.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Issuer: {analysis.credential?.issuer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CredentialRiskIndicator 
                      riskLevel={analysis.risk_level}
                      riskScore={analysis.risk_score}
                      showScore
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAnalysis(analysis)}
                        >
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Review Flagged Credential</DialogTitle>
                          <DialogDescription>
                            Analyze the flagged credential and determine if it's fraudulent or legitimate.
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedAnalysis && (
                          <div className="grid gap-4">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h3 className="text-lg font-semibold mb-2">Credential Information</h3>
                                <div className="space-y-2">
                                  <div className="grid grid-cols-3 gap-1">
                                    <p className="text-sm font-medium">Title:</p>
                                    <p className="text-sm col-span-2">{selectedAnalysis.credential?.title}</p>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1">
                                    <p className="text-sm font-medium">Issuer:</p>
                                    <p className="text-sm col-span-2">{selectedAnalysis.credential?.issuer}</p>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1">
                                    <p className="text-sm font-medium">Issue Date:</p>
                                    <p className="text-sm col-span-2">{selectedAnalysis.credential?.issue_date}</p>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1">
                                    <p className="text-sm font-medium">Type:</p>
                                    <p className="text-sm col-span-2 capitalize">{selectedAnalysis.credential?.credential_type}</p>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1">
                                    <p className="text-sm font-medium">Status:</p>
                                    <p className="text-sm col-span-2 capitalize">{selectedAnalysis.credential?.verification_status}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="text-lg font-semibold mb-2">Fraud Analysis</h3>
                                <div className="space-y-2">
                                  <div className="grid grid-cols-3 gap-1">
                                    <p className="text-sm font-medium">Risk Score:</p>
                                    <p className="text-sm col-span-2 font-bold">
                                      {selectedAnalysis.risk_score}/100
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1">
                                    <p className="text-sm font-medium">Risk Level:</p>
                                    <div className="col-span-2">
                                      <CredentialRiskIndicator 
                                        riskLevel={selectedAnalysis.risk_level} 
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-1">
                                    <p className="text-sm font-medium">Detection Methods:</p>
                                    <div className="col-span-2 flex flex-wrap gap-1">
                                      {selectedAnalysis.detection_method?.map((method: string) => (
                                        <Badge key={method} variant="outline">
                                          {method.replace(/_/g, ' ')}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-lg font-semibold mb-2">Detected Issues</h3>
                              <div className="space-y-4">
                                {selectedAnalysis.credential_anomalies?.length > 0 ? (
                                  selectedAnalysis.credential_anomalies.map((anomaly: any) => (
                                    <Card key={anomaly.id} className="bg-muted/20">
                                      <CardContent className="p-4">
                                        <div className="flex items-start gap-2">
                                          <div className={`mt-1 ${
                                            anomaly.severity > 7 ? 'text-red-500' : 
                                            anomaly.severity > 5 ? 'text-orange-500' : 
                                            'text-amber-500'
                                          }`}>
                                            <AlertTriangle className="h-5 w-5" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <h4 className="font-medium capitalize">
                                                {anomaly.anomaly_type.replace(/_/g, ' ')}
                                              </h4>
                                              <Badge variant={
                                                anomaly.severity > 7 ? 'destructive' : 
                                                anomaly.severity > 5 ? 'default' : 
                                                'outline'
                                              }>
                                                Severity: {anomaly.severity}/10
                                              </Badge>
                                            </div>
                                            <p className="text-sm mt-1">{anomaly.description}</p>
                                            
                                            {anomaly.evidence && Object.keys(anomaly.evidence).length > 0 && (
                                              <div className="mt-2 text-xs p-2 bg-muted/50 rounded">
                                                <p className="font-medium mb-1">Evidence:</p>
                                                <pre className="whitespace-pre-wrap overflow-auto">
                                                  {JSON.stringify(anomaly.evidence, null, 2)}
                                                </pre>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">No specific issues detected beyond general risk indicators.</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h3 className="text-lg font-semibold">Review Notes</h3>
                              <Textarea
                                placeholder="Enter your review notes here..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={4}
                              />
                            </div>
                          </div>
                        )}
                        
                        <DialogFooter className="gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedAnalysis(null);
                              setReviewNotes('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="default"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleReview('cleared')}
                            disabled={isSubmitting}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Mark as Valid
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={() => handleReview('confirmed_fraud')}
                            disabled={isSubmitting}
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Confirm Fraud
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="flex gap-2">
                  {analysis.detection_method?.map((method: string) => (
                    <Badge key={method} variant="outline" className="text-xs">
                      {method.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-lg font-medium">No pending reviews</h3>
            <p className="text-sm text-muted-foreground">
              All flagged credentials have been reviewed. Great job!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Fraud Detection System</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList>
            <TabsTrigger value="dashboard">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <AlertCircle className="h-4 w-4 mr-2" />
              Reviews {metrics.high_risk_pending > 0 && (
                <Badge className="ml-2 bg-red-500">{metrics.high_risk_pending}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            {getDashboardContent()}
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-4">
            {getReviewsContent()}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default FraudDetection;
