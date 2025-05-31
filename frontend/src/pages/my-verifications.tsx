import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from 'sonner';
import { Verification } from '@/types/VerificationTypes';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { AlertTriangle, Shield, CheckCircle, XCircle, MessageCircle, Clock } from 'lucide-react';
import PageHeading from '@/components/page-heading';

export default function MyVerificationsPage() {
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect } = useAuth0();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Function to fetch all user's verifications
  const fetchVerifications = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_ENDPOINTS.VERIFICATIONS}`, {
        params: { user }
      });
      setVerifications(response.data);
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setError('Failed to load verification history. Please try again.');
      toast.error('Failed to load verification history');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchVerifications();
    } else if (!authLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname }
      });
    }
  }, [authLoading, isAuthenticated]);

  // If not authenticated yet, show loading
  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-[300px] mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[200px] w-full rounded-md" />
          <Skeleton className="h-[200px] w-full rounded-md" />
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-[300px] mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[200px] w-full rounded-md" />
          <Skeleton className="h-[200px] w-full rounded-md" />
          <Skeleton className="h-[200px] w-full rounded-md" />
          <Skeleton className="h-[200px] w-full rounded-md" />
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeading title="My Verifications" />
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={() => fetchVerifications()} variant="outline" className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Pending</Badge>;
      case 'VERIFIED':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Verified</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      case 'DISPUTED':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Disputed</Badge>;
      default:
        return null;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'VERIFIED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'DISPUTED':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeading title="My Verifications" />
      
      {verifications.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Verifications Found</h3>
          <p className="text-gray-500 mb-6">You haven't started any pet verification processes yet.</p>
          <Link to="/lost-pets">
            <Button>Browse Lost Pets</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verifications.map((verification) => {
            // Determine if user is finder or claimant
            const isFinder = verification.finder.email === user?.email;
            
            return (
              <Card key={verification._id} className="overflow-hidden flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(verification.status)}
                      {verification.pet.name}
                    </CardTitle>
                    {getStatusBadge(verification.status)}
                  </div>
                  <CardDescription>
                    {verification.pet.type === 'lost' 
                      ? `${isFinder ? 'Your' : 'Someone\'s'} lost pet verification`
                      : `${isFinder ? 'Your' : 'Someone\'s'} found pet verification`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex gap-4">
                    <img 
                      src={verification.pet.image} 
                      alt={verification.pet.name} 
                      className="w-24 h-24 rounded-md object-cover"
                    />
                    <div>
                      <p className="text-sm"><span className="font-medium">Method:</span> {verification.verificationMethod.replace('_', ' ')}</p>
                      <p className="text-sm"><span className="font-medium">{isFinder ? 'Claimed by:' : 'Found by:'}</span> {isFinder ? verification.claimant.name : verification.finder.name}</p>
                      <p className="text-sm"><span className="font-medium">Started:</span> {formatDate(verification.createdAt)}</p>
                      
                      {verification.chatHistory.length > 0 && (
                        <div className="flex items-center mt-2 text-sm text-blue-600">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {verification.chatHistory.length} message{verification.chatHistory.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/verifications/${verification._id}`)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 