import PageHeading from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/lib/constants";
import { Loader2, PawPrint, Upload, MapPin, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

const ListForAdopt = () => {
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [preferredContact, setPreferredContact] = useState<string>("email");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // set owner id from getting user email
  useEffect(() => {
    if (user) {
      setOwner(user.email || "");
    } else if (!isAuthenticated) {
      // Redirect to login if not authenticated
      toast.error("Please login to list a pet for adoption");
    }
  }, [user, isAuthenticated]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 1024 * 1024 * 5) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      if (!selectedFile.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const uploadImage = async () => {
    if (!file) {
      toast.error("Please select an image");
      return null;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Using the same upload endpoint as in report-lost-pet.tsx
      const response = await axios.post(`${API_ENDPOINTS.UPLOAD}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data && response.data.url) {
        toast.success("Image uploaded successfully");
        return response.data.url;
      } else {
        throw new Error('Upload failed - No URL received');
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to upload image");
      } else {
        toast.error("Failed to upload image. Please try again.");
      }
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !location || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!file && !image) {
      toast.error("Please upload an image of the pet");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload image if not already uploaded
      let imageUrl = image;
      if (file && !image) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      const response = await axios.post(`${API_ENDPOINTS.PETS}/adopt`, {
        name,
        type: "adopt",
        location,
        description,
        image: imageUrl,
        owner,
        mobileNumber: mobileNumber || "",
        preferredContact: preferredContact
      });

      toast.success(response.data.message || "Pet listed for adoption successfully");
      
      // Reset form
      setName("");
      setLocation("");
      setDescription("");
      setImage("");
      setFile(null);
      setMobileNumber("");
      
      // Reset file input
      const fileInput = document.getElementById('pet-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Redirect to assist-or-adopt-pets page
      setTimeout(() => {
        navigate('/assist-or-adopt-pets');
      }, 1500);
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to list pet for adoption");
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto min-h-[calc(100vh-20.3rem)] flex flex-col items-center justify-center w-full p-4">
        <Card className="w-full max-w-lg p-6 shadow-md rounded-xl">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center mb-2">Authentication Required</h2>
          <p className="text-gray-600 text-center mb-6">
            Please login to list a pet for adoption.
          </p>
          <Button 
            className="w-full bg-rose-600 hover:bg-rose-700"
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-20.3rem)] flex flex-col w-full">
      <PageHeading 
        pageName="List Pet for Adoption" 
        description="Help animals find their forever homes by creating an adoption listing." 
      />
      
      <div className="w-full mx-auto px-4 mb-6">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Important</AlertTitle>
          <AlertDescription className="text-blue-700">
            Your listing will be visible to potential adopters on our adoption page. Please provide accurate information to help match pets with the right home.
          </AlertDescription>
        </Alert>
      </div>
      
      <form className="w-full mx-auto flex flex-col gap-6 lg:flex-row p-4 mb-8" onSubmit={(e) => e.preventDefault()}>
        <div className="w-full lg:w-2/5 space-y-6">
          <Card className="p-6 shadow-md rounded-xl">
            <h2 className="text-xl font-semibold mb-4 border-l-4 border-rose-500 pl-3">
              <PawPrint className="inline-block mr-2 h-5 w-5" />
              Pet Photo
            </h2>
            
            <div className="border-2 border-dashed border-rose-200 rounded-xl p-4 flex flex-col items-center justify-center">
              <input
                id="pet-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              
              {image ? (
                <div className="relative w-full">
                  <img 
                    src={image} 
                    alt="Pet preview" 
                    className="w-full h-64 object-cover rounded-md" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImage("");
                      setFile(null);
                      const fileInput = document.getElementById('pet-image') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : file ? (
                <div className="relative w-full">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="Pet preview" 
                    className="w-full h-64 object-cover rounded-md" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setFile(null);
                      const fileInput = document.getElementById('pet-image') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="pet-image"
                  className="flex flex-col items-center justify-center w-full h-64 cursor-pointer"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-12 w-12 text-rose-300" />
                    <p className="mt-4 text-base font-medium text-rose-500">Click to upload a photo</p>
                    <p className="mt-2 text-sm text-gray-500">
                      JPG, PNG, or GIF (Max 5MB)
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Good photos increase adoption chances
                    </p>
                  </div>
                </label>
              )}
            </div>
            
            {isUploading && (
              <div className="mt-3 flex items-center justify-center text-rose-600">
                <Loader2 className="animate-spin mr-2" size={16} />
                <span>Uploading image...</span>
              </div>
            )}
          </Card>
        </div>
        
        <div className="w-full lg:w-3/5">
          <Card className="w-full p-6 shadow-md rounded-xl">
            <h2 className="text-xl font-semibold mb-6 border-l-4 border-rose-500 pl-3">
              Pet Information
            </h2>
            
            <div className="space-y-5">
              <div>
                <Label htmlFor="pet-name" className="text-lg flex items-center gap-1">
                  Pet Name<span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="pet-name"
                  type="text"
                  className="mt-1"
                  placeholder="What is your pet's name?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="pet-location" className="text-lg flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Location<span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="pet-location"
                  type="text"
                  className="mt-1"
                  value={location}
                  placeholder="Where can your pet be adopted? (City, Area)"
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="pet-description" className="text-lg flex items-center gap-1">
                  Description<span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="pet-description"
                  placeholder="Describe your pet, including breed, age, temperament, and any special needs or characteristics."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[150px]"
                />
              </div>
              
              <div className="border-t pt-5">
                <h3 className="text-lg font-medium mb-3">Contact Information</h3>
                
                <div>
                  <Label htmlFor="contact-email" className="flex items-center gap-2">
                    Email Address<span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    className="mt-1"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">This email is associated with your account</p>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="contact-phone" className="flex items-center gap-2">
                    Mobile Number
                  </Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Your mobile number for contact"
                    className="mt-1"
                  />
                </div>
                
                <div className="mt-4">
                  <Label className="text-sm font-medium">Preferred Contact Method</Label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="email"
                        checked={preferredContact === "email"}
                        onChange={() => setPreferredContact("email")}
                        className="rounded-full"
                      />
                      <span>Email</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="phone"
                        checked={preferredContact === "phone"}
                        onChange={() => setPreferredContact("phone")}
                        className="rounded-full"
                      />
                      <span>Phone</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="both"
                        checked={preferredContact === "both"}
                        onChange={() => setPreferredContact("both")}
                        className="rounded-full"
                      />
                      <span>Both</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </form>
      
      <div className="w-full mx-auto mt-8">
        <Card className="w-full p-6 shadow-md rounded-xl">
          <h2 className="text-xl font-semibold mb-6 border-l-4 border-rose-500 pl-3">
            Listing Options
          </h2>
          
          <div className="space-y-5">
            <div>
              <p className="text-sm mb-4 text-gray-500">
                Your listing will appear on the Help/Adopt page. It will not be shared in the community forum.
              </p>
            </div>
            
            <div>
              <Button
                disabled={isSubmitting || (!name || !location || !description || (!file && !image)) || (preferredContact === "phone" && !mobileNumber)}
                type="button"
                className="w-full bg-rose-600 hover:bg-rose-700 cursor-pointer"
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Publishing...
                  </>
                ) : (
                  "Publish Adoption Listing"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ListForAdopt;
