import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from 'sonner';
import { Verification } from '@/types/VerificationTypes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function DisputeVerificationPage() {
  const { verificationId } = useParams<{ verificationId: string }>();
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Function to fetch verification details
  const fetchVerification = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_ENDPOINTS.VERIFICATIONS}/${verificationId}`, {
        params: { user }
      });
      setVerification(response.data);
      
      // If verification is not in 'REJECTED' status, redirect to verification details
      if (response.data.status !== 'REJECTED') {
        toast.info('Only rejected verifications can be disputed');
        navigate(`/verifications/${verificationId}`);
      }
    } catch (err) {
      console.error('Error fetching verification:', err);
      setError('Failed to load verification details. Please try again.');
      toast.error('Failed to load verification details');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!authLoading && isAuthenticated && verificationId) {
      fetchVerification();
    } else if (!authLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname }
      });
    }
  }, [authLoading, isAuthenticated, verificationId]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axios.post(
        `${API_ENDPOINTS.VERIFICATIONS}/${verificationId}/dispute`,
        { disputeReason, user }
      );
      
      toast.success('Dispute submitted successfully');
      navigate(`/verifications/${verificationId}`);
    } catch (error) {
      console.error('Error submitting dispute:', error);
      toast.error('Failed to submit dispute. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If not authenticated yet, show loading
  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-[200px] w-full rounded-md" />
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-3">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-[200px] w-full rounded-md" />
          <Skeleton className="h-[150px] w-full rounded-md" />
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !verification) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || 'Verification not found'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // Check if the current user is the claimant
  const isClaimant = verification.claimant.email === user?.email;

  // If user is not the claimant, show unauthorized
  if (!isClaimant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>
            Only the claimant can dispute a verification rejection.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Button onClick={() => navigate(-1)} variant="outline" className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      {/* Pet information */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Dispute Verification Rejection
          </CardTitle>
          <CardDescription>
            Please provide a detailed reason why you believe the verification rejection should be reconsidered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="md:w-1/3">
              <img 
                src={verification.pet.image} 
                alt={verification.pet.name} 
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
            <div className="md:w-2/3 space-y-2">
              <div>
                <span className="font-medium">Pet Name:</span> {verification.pet.name}
              </div>
              <div>
                <span className="font-medium">Type:</span> {verification.pet.type}
              </div>
              <div>
                <span className="font-medium">Finder:</span> {verification.finder.name}
              </div>
              <div>
                <span className="font-medium">Verification Method:</span> {verification.verificationMethod}
              </div>
              <div>
                <span className="font-medium text-red-600">Current Status:</span> Rejected
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-lg">Dispute Reason</h3>
            <p className="text-sm text-gray-500 mb-2">
              Please explain in detail why you believe this rejection was incorrect and provide 
              any additional information that might help in the review process.
            </p>
            <Textarea
              placeholder="Enter your dispute reason..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              rows={5}
              className="w-full"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/verifications/${verificationId}`)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !disputeReason.trim()}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 