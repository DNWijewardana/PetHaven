import PageHeading from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarIcon, MapPin, Loader2, Phone, Mail, AlertCircle, LogIn, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { SingleImageDropzone } from "@/components/image-dropzone";
import axios from "axios";
import { toast } from "sonner";
import { requestLocationPermission, getAddressFromCoords } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import AuthWrapper from "@/components/auth-wrapper";

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

type ReportType = "lost" | "found" | "injured";

const ReportLostPet = () => {
  const { user, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const [date, setDate] = useState<Date>();
  const [name, setName] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [preferredContact, setPreferredContact] = useState<string>("email");
  const [location, setLocation] = useState<Location | null>(null);
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File>();
  const [image, setImage] = useState<string>("");
  const [reportType, setReportType] = useState<ReportType>("lost");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const ENV = import.meta.env.MODE;
  const BASE_URL = ENV === "development" ? "http://localhost:4000" : import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (user) {
      setOwner(user.email || "");
    }
  }, [user]);

  const uploadToServer = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      setIsUploadingImage(true);
      
      // Get the Auth0 token
      const token = await getAccessTokenSilently();
      
      // Using Cloudinary upload endpoint directly
      const response = await axios.post(
        `${BASE_URL}/api/v1/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        }
      );
      
      console.log('Image upload response:', response.data);
      
      if (response.data && response.data.url) {
        toast.success("Image uploaded successfully to Cloudinary");
        return response.data.url;
      }
      throw new Error('Upload failed - No URL received');
    } catch (error) {
      console.error('Upload error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Upload failed');
      }
      throw new Error('Upload failed - Network error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const getLocation = async () => {
    setIsGettingLocation(true);
    setLocationError("");

    try {
      const position = await requestLocationPermission();
      
      if (!position) {
        // User was prompted to enable location in settings
        setLocationError("Please enable location access and try again");
        return;
      }

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        throw new Error("Invalid coordinates received from GPS");
      }

      const address = await getAddressFromCoords(lat, lng);
      
      const locationData = {
        latitude: lat,
        longitude: lng,
        address: address || undefined
      };

      setLocation(locationData);
      toast.success("Location successfully retrieved!");
    } catch (error) {
      console.error('Location error:', error);
      setLocationError(error instanceof Error ? error.message : "Failed to get location");
      toast.error(error instanceof Error ? error.message : "Failed to get location");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please sign in to submit a report");
      loginWithRedirect();
      return;
    }

    const missingFields = [];
    if (!name) missingFields.push("animal type/description");
    if (!location?.latitude || !location?.longitude || 
        isNaN(location.latitude) || isNaN(location.longitude)) {
      missingFields.push("valid location coordinates");
    }
    if (!image) missingFields.push("photo");
    if (!owner) missingFields.push("contact information");
    if (preferredContact === "phone" && !mobileNumber) missingFields.push("mobile number");

    if (missingFields.length > 0) {
      toast.error(`Please provide: ${missingFields.join(", ")}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure we have valid coordinates
      if (!location) {
        toast.error("Location is required. Please try getting your location again.");
        setIsSubmitting(false);
        return;
      }

      const lat = parseFloat(location.latitude.toString());
      const lng = parseFloat(location.longitude.toString());

      console.log('Coordinates before validation:', { lat, lng });

      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
        toast.error("Invalid location coordinates. Please try getting your location again.");
        setIsSubmitting(false);
        return;
      }

      const reportData = {
        type: reportType.toUpperCase(),
        animalType: name,
        description,
        location: {
          type: 'Point',
          coordinates: [lng, lat], // MongoDB expects [longitude, latitude]
          address: location.address || ''
        },
        images: [image],
        contactInfo: owner,
        mobileNumber: mobileNumber || "",
        preferredContact: preferredContact,
        date: date || new Date(),
        category: reportType === "lost" ? "LOST_PETS" : "FOUND_PETS",
        showInCommunity: true,
        user: {
          sub: user.sub,
          email: user.email,
          name: user.name,
          picture: user.picture,
          isAdmin: false
        }
      };

      console.log('Report data being sent:', JSON.stringify(reportData, null, 2));

      const response = await axios.post(`${BASE_URL}/api/v1/reports`, reportData);
      console.log('Server response:', response.data);

      toast.success("Report submitted successfully!");
      
      // Clear form
      setName("");
      setDescription("");
      setImage("");
      setDate(undefined);
      setLocation(null);
      setFile(undefined);
      setMobileNumber("");
      
    } catch (error) {
      console.error('Submission error:', error);
      if (axios.isAxiosError(error)) {
        // Handle Axios error
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
        toast.error(errorMessage || "Failed to submit report");
        
        // Log detailed error information
        console.error('Error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        // If authentication error, redirect to login
        if (error.response?.status === 401) {
          loginWithRedirect();
        }
      } else {
        // Handle non-Axios error
        toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-20.3rem)] flex flex-col w-full">
      <PageHeading 
        pageName={`Report ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Animal`} 
        description="Help bring pets home by reporting sightings of lost or found animals."
      />
      
      <div className="w-full mx-auto px-4 mb-6">
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Important</AlertTitle>
          <AlertDescription className="text-blue-700">
            Your report will be visible to others in the community. Include clear photos and accurate information to increase chances of reuniting pets with their owners.
          </AlertDescription>
        </Alert>
      </div>
      
      <AuthWrapper
        fallback={
          <div className="max-w-md mx-auto px-4 py-12 text-center">
            <div className="bg-blue-50 rounded-xl p-8 border border-blue-100 shadow-sm">
              <ShieldCheck className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-6">
                You need to sign in to report a lost or found pet. This helps us verify the authenticity of reports and ensures pet owners can contact you.
              </p>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => loginWithRedirect()}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In to Continue
              </Button>
              <p className="mt-4 text-sm text-gray-500">
                Your information will be kept private and only shared with verified users.
              </p>
            </div>
          </div>
        }
        showFallback={!isAuthenticated}
      >
        <form className="w-full mx-auto flex flex-col gap-6 lg:flex-row p-4 mb-8" onSubmit={(e) => e.preventDefault()}>
          <div className="w-full lg:w-2/5 space-y-6">
            <Card className="p-6 shadow-md rounded-xl">
              <h2 className="text-xl font-semibold mb-4 border-l-4 border-rose-500 pl-3">Upload Photo</h2>
              <SingleImageDropzone
                value={file}
                className="w-full h-[300px] border-2 border-dashed border-rose-200 rounded-xl"
                dropzoneOptions={{
                  maxSize: 1024 * 1024 * 5, // 5MB
                  accept: {
                    'image/jpeg': ['.jpg', '.jpeg'],
                    'image/png': ['.png'],
                  }
                }}
                onChange={async (file) => {
                  setFile(file);
                  if (file) {
                    try {
                      const imageUrl = await uploadToServer(file);
                      if (imageUrl) {
                        setImage(imageUrl);
                        toast.success("Image uploaded successfully!");
                      }
                    } catch (error) {
                      console.error("Upload error:", error);
                      toast.error(error instanceof Error ? error.message : "Failed to upload image");
                    }
                  }
                }}
              />
              {isUploadingImage && (
                <div className="flex items-center justify-center mt-4 text-rose-600">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Uploading image...</span>
                </div>
              )}
            </Card>
            
            <Card className="p-6 shadow-md rounded-xl">
              <h2 className="text-xl font-semibold mb-4 border-l-4 border-green-500 pl-3">Location</h2>
              
              <div className="space-y-4">
                <Button
                  type="button"
                  className="bg-green-600 hover:bg-green-700 w-full flex items-center justify-center gap-2"
                  onClick={getLocation}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-5 w-5" />
                      {location ? 'Update My Location' : 'Get My Location'}
                    </>
                  )}
                </Button>
                
                {locationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    <AlertCircle className="inline-block w-4 h-4 mr-1" />
                    {locationError}
                  </div>
                )}
                
                {location && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                    <h3 className="font-medium text-green-700 mb-1">Location found:</h3>
                    <p>{location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
          
          <div className="w-full lg:w-3/5">
            <Card className="p-6 shadow-md rounded-xl">
              <h2 className="text-xl font-semibold mb-6 border-l-4 border-rose-500 pl-3">Report Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-base font-medium">Report Type</label>
                  <div className="mt-2 flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="reportType"
                        value="lost"
                        checked={reportType === "lost"}
                        onChange={() => setReportType("lost")}
                        className="mr-2"
                      />
                      Lost Pet
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="reportType"
                        value="found"
                        checked={reportType === "found"}
                        onChange={() => setReportType("found")}
                        className="mr-2"
                      />
                      Found Animal
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="reportType"
                        value="injured"
                        checked={reportType === "injured"}
                        onChange={() => setReportType("injured")}
                        className="mr-2"
                      />
                      Injured Animal
                    </label>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="name" className="text-base font-medium">
                    Animal Type/Description
                  </Label>
                  <Input
                    id="name"
                    className="mt-1"
                    placeholder="e.g. Black Labrador, Siamese Cat, etc."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="date" className="text-base font-medium">
                    Date
                  </Label>
                  <div className="mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-base font-medium">
                    Details
                  </Label>
                  <Textarea
                    id="description"
                    className="mt-1"
                    placeholder="Provide more details about the animal, its behavior, collar, any distinguishing marks, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        className="mt-1"
                        readOnly={!!user}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Mobile Number (optional)
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="Your mobile number"
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <p className="font-medium mb-2">Preferred Contact Method</p>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="contactMethod"
                            value="email"
                            checked={preferredContact === "email"}
                            onChange={() => setPreferredContact("email")}
                            className="mr-2"
                          />
                          Email
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="contactMethod"
                            value="phone"
                            checked={preferredContact === "phone"}
                            onChange={() => setPreferredContact("phone")}
                            className="mr-2"
                          />
                          Phone
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="contactMethod"
                            value="both"
                            checked={preferredContact === "both"}
                            onChange={() => setPreferredContact("both")}
                            className="mr-2"
                          />
                          Both
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  type="button"
                  className="w-full bg-rose-600 hover:bg-rose-700"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting Report...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </form>
      </AuthWrapper>
    </div>
  );
};

export default ReportLostPet;
