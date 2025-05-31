import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Verification } from '@/types/VerificationTypes';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from 'sonner';
import { useAuth0 } from '@auth0/auth0-react';
import { Label } from '@/components/ui/label';
import { Tag, CircuitBoard, Image, Lock } from 'lucide-react';
import { FileUploader } from '@/components/file-uploader';

interface VerificationFormProps {
  verification: Verification;
  onUpdate: () => void;
  isClaimant: boolean;
}

export default function VerificationForm({ verification, onUpdate, isClaimant }: VerificationFormProps) {
  const { user } = useAuth0();
  const [uniqueIdentifier, setUniqueIdentifier] = useState('');
  const [questions, setQuestions] = useState<{ question: string; expectedAnswer: string }[]>([
    { question: 'What is a distinguishing mark or feature of the pet?', expectedAnswer: '' },
    { question: 'What is the pet\'s favorite toy or activity?', expectedAnswer: '' },
    { question: 'Does the pet have any medical conditions or special needs?', expectedAnswer: '' }
  ]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data already submitted check
  const isDataSubmitted = Boolean(
    verification.verificationData.uniqueIdentifier || 
    (verification.verificationData.questions && verification.verificationData.questions.length > 0) ||
    (verification.verificationData.ownerPhotos && verification.verificationData.ownerPhotos.length > 0)
  );
  
  // Only show form for claimant, and if data not already submitted
  if (!isClaimant || isDataSubmitted || verification.status !== 'PENDING') {
    return null;
  }
  
  const handleQuestionChange = (index: number, field: 'question' | 'expectedAnswer', value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };
  
  const handleUploadComplete = (urls: string[]) => {
    setPhotos(urls);
  };
  
  const handleSubmit = async () => {
    // Validation
    if (verification.verificationMethod === 'TAG' && !uniqueIdentifier) {
      toast.error('Please enter the tag ID');
      return;
    }
    
    if (verification.verificationMethod === 'MICROCHIP' && !uniqueIdentifier) {
      toast.error('Please enter the microchip number');
      return;
    }
    
    if (verification.verificationMethod === 'PHOTO' && photos.length === 0) {
      toast.error('Please upload at least one photo');
      return;
    }
    
    if (verification.verificationMethod === 'QUESTIONS') {
      const incompleteQuestions = questions.find(q => !q.expectedAnswer);
      if (incompleteQuestions) {
        toast.error('Please answer all questions');
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      // Prepare submission data based on verification method
      const verificationData: any = { adminNotes };
      
      if (verification.verificationMethod === 'TAG' || verification.verificationMethod === 'MICROCHIP') {
        verificationData.uniqueIdentifier = uniqueIdentifier;
      } else if (verification.verificationMethod === 'PHOTO') {
        verificationData.ownerPhotos = photos;
      } else if (verification.verificationMethod === 'QUESTIONS') {
        verificationData.questions = questions;
      }
      
      await axios.post(
        `${API_ENDPOINTS.VERIFICATIONS}/${verification._id}/data`,
        { 
          verificationData, 
          user 
        }
      );
      
      toast.success('Verification data submitted successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error submitting verification data:', error);
      toast.error('Failed to submit verification data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {verification.verificationMethod === 'TAG' && <Tag className="h-5 w-5 text-blue-500" />}
          {verification.verificationMethod === 'MICROCHIP' && <CircuitBoard className="h-5 w-5 text-green-500" />}
          {verification.verificationMethod === 'PHOTO' && <Image className="h-5 w-5 text-purple-500" />}
          {verification.verificationMethod === 'QUESTIONS' && <Lock className="h-5 w-5 text-amber-500" />}
          Submit Verification Information
        </CardTitle>
        <CardDescription>
          Please provide the required information to verify your ownership
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* For TAG verification */}
        {verification.verificationMethod === 'TAG' && (
          <div className="space-y-2">
            <Label htmlFor="tag-id">Tag/Collar ID</Label>
            <Input
              id="tag-id"
              placeholder="Enter the ID from the pet's tag or collar"
              value={uniqueIdentifier}
              onChange={(e) => setUniqueIdentifier(e.target.value)}
            />
            <p className="text-sm text-gray-500">Enter the unique ID or information that appears on your pet's collar tag.</p>
          </div>
        )}
        
        {/* For MICROCHIP verification */}
        {verification.verificationMethod === 'MICROCHIP' && (
          <div className="space-y-2">
            <Label htmlFor="microchip-id">Microchip Number</Label>
            <Input
              id="microchip-id"
              placeholder="Enter the pet's microchip number"
              value={uniqueIdentifier}
              onChange={(e) => setUniqueIdentifier(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Enter the complete microchip number. If you don't have it, you may need to contact your vet.
            </p>
          </div>
        )}
        
        {/* For PHOTO verification */}
        {verification.verificationMethod === 'PHOTO' && (
          <div className="space-y-3">
            <Label>Photos of your pet</Label>
            <p className="text-sm text-gray-500 mb-2">
              Upload clear photos of your pet that can help establish your ownership. 
              The photos should be from before the pet was lost.
            </p>
            <FileUploader 
              onUploadComplete={handleUploadComplete}
              multiple={true}
              endpoint="pet-verification-photos"
            />
            
            {photos.length > 0 && (
              <div className="mt-4">
                <Label>Uploaded Photos</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {photos.map((url, idx) => (
                    <div key={idx} className="relative h-24 rounded-md overflow-hidden">
                      <img 
                        src={url} 
                        alt={`Uploaded pet photo ${idx+1}`} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* For QUESTIONS verification */}
        {verification.verificationMethod === 'QUESTIONS' && (
          <div className="space-y-4">
            <Label>Security Questions</Label>
            <p className="text-sm text-gray-500">
              Please answer these questions that only the true owner of this pet would know.
            </p>
            
            {questions.map((q, idx) => (
              <div key={idx} className="space-y-2 p-3 border rounded-md">
                <Label>{q.question}</Label>
                <Textarea
                  placeholder="Your answer"
                  value={q.expectedAnswer}
                  onChange={(e) => handleQuestionChange(idx, 'expectedAnswer', e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Additional notes - shown for all verification types */}
        <div className="space-y-2">
          <Label htmlFor="admin-notes">Additional Notes (Optional)</Label>
          <Textarea
            id="admin-notes"
            placeholder="Add any additional information that might help with verification"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Verification Data'}
        </Button>
      </CardFooter>
    </Card>
  );
} 