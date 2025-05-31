import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Verification } from '@/types/VerificationTypes';
import { toast } from 'sonner';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { CheckCircle, XCircle, Tag, CircuitBoard, Image, Lock, AlertCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface VerificationReviewProps {
  verification: Verification;
  onUpdate: () => void;
  isFinder: boolean;
}

export default function VerificationReview({ verification, onUpdate, isFinder }: VerificationReviewProps) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResponse = async (status: 'VERIFIED' | 'REJECTED') => {
    setIsLoading(true);
    try {
      await axios.put(
        `${API_ENDPOINTS.VERIFICATIONS}/${verification._id}/respond`,
        { status, adminNotes: notes }
      );
      
      toast.success(`Verification ${status.toLowerCase()} successfully`);
      onUpdate();
    } catch (error) {
      console.error('Error responding to verification:', error);
      toast.error('Failed to update verification status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusBadge = () => {
    switch (verification.status) {
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
  
  // Method icon
  const getMethodIcon = () => {
    switch (verification.verificationMethod) {
      case 'TAG':
        return <Tag className="h-5 w-5 text-blue-500" />;
      case 'MICROCHIP':
        return <CircuitBoard className="h-5 w-5 text-green-500" />;
      case 'PHOTO':
        return <Image className="h-5 w-5 text-purple-500" />;
      case 'QUESTIONS':
        return <Lock className="h-5 w-5 text-amber-500" />;
      case 'MANUAL':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            {getMethodIcon()}
            Verification Review
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          {verification.status === 'PENDING' 
            ? 'Review the submitted verification information'
            : `This verification was ${verification.status.toLowerCase()}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Method-specific information */}
        {verification.verificationMethod === 'TAG' && verification.verificationData.uniqueIdentifier && (
          <div className="space-y-1">
            <h3 className="font-medium">Tag/Collar ID</h3>
            <p className="p-2 border rounded-md bg-gray-50">{verification.verificationData.uniqueIdentifier}</p>
          </div>
        )}
        
        {verification.verificationMethod === 'MICROCHIP' && verification.verificationData.uniqueIdentifier && (
          <div className="space-y-1">
            <h3 className="font-medium">Microchip Number</h3>
            <p className="p-2 border rounded-md bg-gray-50">{verification.verificationData.uniqueIdentifier}</p>
          </div>
        )}
        
        {verification.verificationMethod === 'PHOTO' && verification.verificationData.ownerPhotos && (
          <div className="space-y-2">
            <h3 className="font-medium">Owner's Photos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {verification.verificationData.ownerPhotos.map((photo, index) => (
                <a 
                  key={index} 
                  href={photo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-32 rounded-md overflow-hidden"
                >
                  <img 
                    src={photo} 
                    alt={`Owner photo ${index + 1}`} 
                    className="h-full w-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
        
        {verification.verificationMethod === 'QUESTIONS' && verification.verificationData.questions && (
          <div className="space-y-3">
            <h3 className="font-medium">Security Questions</h3>
            {verification.verificationData.questions.map((q, index) => (
              <div key={index} className="p-3 border rounded-md">
                <p className="font-medium">{q.question}</p>
                {q.providedAnswer ? (
                  <>
                    <div className="mt-1 flex justify-between items-center">
                      <span className="text-sm text-gray-500">Expected: {q.expectedAnswer}</span>
                      <span className="text-sm text-gray-500">Provided: {q.providedAnswer}</span>
                    </div>
                    <div className="mt-1">
                      {q.isCorrect ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Correct</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Incorrect</Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">Expected answer: {q.expectedAnswer}</p>
                )}
              </div>
            ))}
          </div>
        )}
        
        {verification.verificationData.adminNotes && (
          <div className="space-y-1">
            <h3 className="font-medium">Notes</h3>
            <p className="p-2 border rounded-md bg-gray-50">{verification.verificationData.adminNotes}</p>
          </div>
        )}
        
        {verification.status === 'DISPUTED' && verification.disputeReason && (
          <div className="p-3 border border-amber-300 rounded-md bg-amber-50">
            <h3 className="font-medium text-amber-800">Dispute Reason</h3>
            <p className="text-amber-700 mt-1">{verification.disputeReason}</p>
          </div>
        )}
        
        {/* Notes field for finder when pending */}
        {isFinder && verification.status === 'PENDING' && (
          <div className="space-y-2">
            <h3 className="font-medium">Add Notes (Optional)</h3>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Add any notes or comments about the verification..."
              rows={3}
            />
          </div>
        )}
      </CardContent>
      
      {/* Action buttons for finder when pending */}
      {isFinder && verification.status === 'PENDING' && (
        <CardFooter className="flex gap-2 justify-end">
          <Button 
            variant="outline" 
            className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
            disabled={isLoading}
            onClick={() => handleResponse('REJECTED')}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Reject Claim
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700"
            disabled={isLoading}
            onClick={() => handleResponse('VERIFIED')}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Verify Owner
          </Button>
        </CardFooter>
      )}
    </Card>
  );
} 