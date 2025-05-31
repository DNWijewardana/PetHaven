import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { lostPetProps } from '@/types/PetTypes';
import { Shield, Lock, Image, Tag, CircuitBoard } from 'lucide-react';

const verificationMethods = [
  { 
    id: 'TAG', 
    label: 'Collar/ID Tag', 
    description: 'Verify through a unique tag or ID on the pet\'s collar',
    icon: <Tag className="h-5 w-5 text-blue-500" />
  },
  { 
    id: 'MICROCHIP', 
    label: 'Microchip', 
    description: 'Verify using the pet\'s microchip number',
    icon: <CircuitBoard className="h-5 w-5 text-green-500" />
  },
  { 
    id: 'PHOTO', 
    label: 'Photo Verification', 
    description: 'Compare photos of the pet to confirm identity',
    icon: <Image className="h-5 w-5 text-purple-500" />
  },
  { 
    id: 'QUESTIONS', 
    label: 'Security Questions', 
    description: 'Answer questions only the true owner would know',
    icon: <Lock className="h-5 w-5 text-amber-500" />
  }
];

interface VerifyPetButtonProps {
  pet: lostPetProps;
  isOwner: boolean;
}

export default function VerifyPetButton({ pet, isOwner }: VerifyPetButtonProps) {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const [method, setMethod] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleVerification = async () => {
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: { returnTo: window.location.pathname }
      });
      return;
    }

    if (!method) {
      toast.error('Please select a verification method');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.VERIFICATIONS, {
        petId: pet._id,
        verificationMethod: method,
        user: user
      });
      
      toast.success('Verification process initiated!');
      setOpen(false);
      
      // Navigate to the verification detail page
      navigate(`/verifications/${response.data.verification._id}`);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to initiate verification process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If the current user is the owner of a lost pet, or not the owner of a found pet, don't show the button
  if ((pet.type === 'lost' && isOwner) || (pet.type === 'found' && !isOwner)) {
    return null;
  }

  // For lost pets, show "Claim This Pet" for non-owners
  // For found pets, show "Verify Ownership" for owners
  const buttonLabel = pet.type === 'lost' ? 'Claim This Pet' : 'Verify Ownership';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Verify Pet Ownership</DialogTitle>
          <DialogDescription>
            Choose a method to verify that {pet.type === 'lost' ? 'you are the owner of this pet' : 'someone is the owner of this pet'}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="verification-method">Verification Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select a verification method" />
              </SelectTrigger>
              <SelectContent>
                {verificationMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id} className="flex items-center py-2">
                    <div className="flex items-center gap-2">
                      {method.icon}
                      <div>
                        <div className="font-medium">{method.label}</div>
                        <div className="text-xs text-gray-500">{method.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {method && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium flex items-center gap-2">
                {verificationMethods.find(m => m.id === method)?.icon}
                {verificationMethods.find(m => m.id === method)?.label} Process
              </h3>
              <p className="text-sm mt-1 text-gray-700">
                {method === 'TAG' && "You'll need to provide the ID number or information on the pet's collar tag."}
                {method === 'MICROCHIP' && "You'll need to provide the microchip number, or we can arrange a vet visit to scan the chip."}
                {method === 'PHOTO' && "You'll need to upload clear photos of the pet from before they were lost."}
                {method === 'QUESTIONS' && "You'll need to answer specific questions about the pet that only the true owner would know."}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            onClick={handleVerification}
            disabled={!method || isLoading}
          >
            {isLoading ? 'Starting...' : 'Start Verification Process'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 