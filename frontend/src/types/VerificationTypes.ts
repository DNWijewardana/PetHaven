import { lostPetProps } from './PetTypes';

// Basic user information
export type UserInfo = {
  _id: string;
  name: string;
  email: string;
  picture?: string;
};

// Security questions for the verification process
export type SecurityQuestion = {
  question: string;
  expectedAnswer?: string;
  providedAnswer?: string;
  isCorrect?: boolean;
};

// Message in the chat between finder and claimant
export type VerificationMessage = {
  _id: string;
  sender: UserInfo;
  message: string;
  timestamp: string;
};

// Verification method options
export type VerificationMethod = 'TAG' | 'MICROCHIP' | 'PHOTO' | 'QUESTIONS' | 'MANUAL';

// Verification status options
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'DISPUTED';

// Verification data based on the method
export type VerificationData = {
  uniqueIdentifier?: string;
  questions?: SecurityQuestion[];
  ownerPhotos?: string[];
  finderPhotos?: string[];
  adminNotes?: string;
};

// The complete verification object
export type Verification = {
  _id: string;
  pet: lostPetProps;
  finder: UserInfo;
  claimant: UserInfo;
  verificationMethod: VerificationMethod;
  status: VerificationStatus;
  verificationData: VerificationData;
  chatHistory: VerificationMessage[];
  disputeReason?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}; 