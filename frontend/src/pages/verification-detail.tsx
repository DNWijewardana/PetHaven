import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from 'sonner';
import { Verification } from '@/types/VerificationTypes';
import VerificationForm from '@/components/verification/VerificationForm';
import VerificationChat from '@/components/verification/VerificationChat';
import VerificationReview from '@/components/verification/VerificationReview';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function VerificationDetailPage() {
  const { verificationId } = useParams<{ verificationId: string }>();
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const [verification, setVerification] = useState<Verification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  // Check if the current user is the finder or claimant
  const isFinder = verification?.finder?.email === user?.email;
  const isClaimant = verification?.claimant?.email === user?.email;

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
          <Skeleton className="h-[120px] w-full rounded-md" />
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

  // If user is neither finder nor claimant, show unauthorized message
  if (!isFinder && !isClaimant) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>
            You are not authorized to view this verification.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/')} variant="outline" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go to Home
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
          <CardTitle>Verification for {verification.pet.name}</CardTitle>
          <CardDescription>
            {verification.pet.type === 'lost' 
              ? 'Owner verification for a lost pet' 
              : 'Owner verification for a found pet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
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
                <span className="font-medium">Description:</span> {verification.pet.description}
              </div>
              <div>
                <span className="font-medium">Location:</span> {verification.pet.location}
              </div>
              <div>
                <span className="font-medium">{isFinder ? 'Claimed by:' : 'Found by:'}</span> {isFinder ? verification.claimant.name : verification.finder.name}
              </div>
              <div>
                <span className="font-medium">Verification Method:</span> {verification.verificationMethod.replace('_', ' ')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Verification review */}
      <VerificationReview 
        verification={verification} 
        onUpdate={fetchVerification} 
        isFinder={isFinder}
      />
      
      {/* Verification form (only for claimant if data not submitted yet) */}
      <VerificationForm 
        verification={verification} 
        onUpdate={fetchVerification} 
        isClaimant={isClaimant}
      />
      
      {/* Chat component */}
      <VerificationChat 
        verification={verification} 
        onUpdate={fetchVerification}
      />
      
      {/* Dispute reporting (only show for rejected claims) */}
      {verification.status === 'REJECTED' && isClaimant && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Dispute Resolution</CardTitle>
            <CardDescription>
              If you believe this rejection was in error, you can request an admin review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline"
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300"
              onClick={() => navigate(`/dispute/${verification._id}`)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Report a Dispute
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 