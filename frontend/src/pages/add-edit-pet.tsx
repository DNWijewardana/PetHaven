import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AlertCircle, ArrowLeft, Info, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { API_ENDPOINTS } from "@/lib/constants";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const petProfileSchema = z.object({
  petName: z.string().min(1, "Pet name is required"),
  petType: z.string().min(1, "Pet type is required"),
  breed: z.string().optional(),
  age: z.coerce.number().positive().optional(),
  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
  color: z.string().optional(),
  weight: z.coerce.number().positive().optional(),
  microchipId: z.string().optional(),
  source: z.enum(["ADOPTED", "LOST_FOUND", "PERSONAL"]),
  sourceReference: z.string().optional(),
  notes: z.string().optional(),
  medicalInfo: z.string().optional(),
});

type PetProfileFormValues = z.infer<typeof petProfileSchema>;

const AddEditPet = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const { getAccessTokenSilently, user } = useAuth0();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [existingProfileImage, setExistingProfileImage] = useState<string | null>(null);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const isEditMode = !!profileId;

  const form = useForm<PetProfileFormValues>({
    resolver: zodResolver(petProfileSchema),
    defaultValues: {
      petName: "",
      petType: "",
      breed: "",
      age: undefined,
      gender: undefined,
      color: "",
      weight: undefined,
      microchipId: "",
      source: "PERSONAL",
      sourceReference: "",
      notes: "",
      medicalInfo: "",
    },
  });

  useEffect(() => {
    if (profileId) {
      fetchPetProfile(profileId);
    }
  }, [profileId]);

  const fetchPetProfile = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = await getAccessTokenSilently();
      
      const response = await axios.get(
        `${API_ENDPOINTS.PET_PROFILES}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const petData = response.data.data;
      
      // Set form values
      form.reset({
        petName: petData.petName,
        petType: petData.petType,
        breed: petData.breed || "",
        age: petData.age,
        gender: petData.gender,
        color: petData.color || "",
        weight: petData.weight,
        microchipId: petData.microchipId || "",
        source: petData.source,
        sourceReference: petData.sourceReference || "",
        notes: petData.notes || "",
        medicalInfo: petData.medicalInfo || "",
      });
      
      // Set existing images
      if (petData.profileImage) {
        setExistingProfileImage(petData.profileImage);
        setProfileImagePreview(petData.profileImage);
      }
      
      if (petData.additionalImages && petData.additionalImages.length > 0) {
        setExistingAdditionalImages(petData.additionalImages);
        setAdditionalImagePreviews(petData.additionalImages);
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching pet profile:", err);
      setError("Failed to load pet profile. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Profile image must be less than 5MB");
        return;
      }
      
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error("Profile image must be an image file (JPEG, PNG, WEBP)");
        return;
      }
      
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];
      const validFilePreviews: string[] = [];
      
      files.forEach(file => {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is too large. Images must be less than 5MB`);
          return;
        }
        
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          toast.error(`${file.name} must be an image file (JPEG, PNG, WEBP)`);
          return;
        }
        
        validFiles.push(file);
        validFilePreviews.push(URL.createObjectURL(file));
      });
      
      setAdditionalImages([...additionalImages, ...validFiles]);
      setAdditionalImagePreviews([...additionalImagePreviews, ...validFilePreviews]);
    }
  };

  const removeAdditionalImage = (index: number) => {
    // If it's an existing image, mark it for removal
    if (index < existingAdditionalImages.length) {
      const imageUrl = existingAdditionalImages[index];
      setRemovedImages([...removedImages, imageUrl]);
      
      const updatedExisting = [...existingAdditionalImages];
      updatedExisting.splice(index, 1);
      setExistingAdditionalImages(updatedExisting);
      
      const updatedPreviews = [...additionalImagePreviews];
      updatedPreviews.splice(index, 1);
      setAdditionalImagePreviews(updatedPreviews);
    } else {
      // If it's a new image, just remove it from the arrays
      const newIndex = index - existingAdditionalImages.length;
      const updatedImages = [...additionalImages];
      updatedImages.splice(newIndex, 1);
      setAdditionalImages(updatedImages);
      
      const updatedPreviews = [...additionalImagePreviews];
      updatedPreviews.splice(index, 1);
      setAdditionalImagePreviews(updatedPreviews);
    }
  };

  const removeProfileImage = () => {
    if (existingProfileImage) {
      setRemovedImages([...removedImages, existingProfileImage]);
      setExistingProfileImage(null);
    }
    setProfileImage(null);
    setProfileImagePreview(null);
  };

  const uploadImage = async (file: File, token: string) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await axios.post(
      API_ENDPOINTS.UPLOAD,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      }
    );
    
    return response.data.fileUrl;
  };

  const onSubmit = async (values: PetProfileFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const token = await getAccessTokenSilently();
      
      // Upload profile image if present
      let profileImageUrl = existingProfileImage;
      if (profileImage) {
        profileImageUrl = await uploadImage(profileImage, token);
      }
      
      // Upload additional images if present
      const newAdditionalImageUrls = await Promise.all(
        additionalImages.map(image => uploadImage(image, token))
      );
      
      // Combine existing images (excluding removed ones) with new uploads
      const additionalImageUrls = [
        ...existingAdditionalImages,
        ...newAdditionalImageUrls
      ];
      
      const petData = {
        ...values,
        profileImage: profileImageUrl,
        additionalImages: additionalImageUrls,
        removedImages: removedImages
      };
      
      if (isEditMode) {
        // Update existing pet profile
        await axios.put(
          `${API_ENDPOINTS.PET_PROFILES}/${profileId}`,
          petData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        toast.success("Pet profile updated successfully");
        navigate(`/pet/${profileId}`);
      } else {
        // Create new pet profile
        const response = await axios.post(
          API_ENDPOINTS.PET_PROFILES,
          petData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        toast.success("Pet profile created successfully");
        navigate(`/pet/${response.data.data._id}`);
      }
      
      setIsSubmitting(false);
    } catch (err) {
      console.error("Error saving pet profile:", err);
      setError("Failed to save pet profile. Please try again later.");
      setIsSubmitting(false);
      toast.error("Failed to save pet profile");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading pet profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Edit Pet Profile" : "Add New Pet"}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEditMode 
            ? "Update your pet's information below"
            : "Fill in the details to create a profile for your pet"
          }
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Pet Images</h3>
              
              <div className="mb-6">
                <Label htmlFor="profileImage" className="block mb-2">Profile Image</Label>
                <div className="flex flex-col items-center mb-4">
                  {profileImagePreview ? (
                    <div className="relative mb-4">
                      <img 
                        src={profileImagePreview} 
                        alt="Profile Preview" 
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white shadow-md hover:bg-red-50"
                        onClick={removeProfileImage}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-8 mb-4 w-full flex flex-col items-center justify-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-center">Profile image of your pet</p>
                      <p className="text-gray-400 text-sm text-center">JPG, PNG or WEBP (max. 5MB)</p>
                    </div>
                  )}
                  
                  {!profileImagePreview && (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="profileImage"
                        className="flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Select Profile Image
                        <input
                          id="profileImage"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileImageChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="additionalImages" className="block mb-2">Additional Images</Label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {additionalImagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={preview} 
                        alt={`Additional ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-md hover:bg-red-50"
                        onClick={() => removeAdditionalImage(index)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  
                  <label
                    htmlFor="additionalImages"
                    className="border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center h-24 cursor-pointer hover:bg-gray-50"
                  >
                    <Plus className="h-6 w-6 text-gray-400" />
                    <span className="text-gray-400 text-sm">Add More</span>
                    <input
                      id="additionalImages"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleAdditionalImagesChange}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">Add up to 5 additional images of your pet</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="petName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pet Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter pet name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="petType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pet Type*</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select pet type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DOG">Dog</SelectItem>
                              <SelectItem value="CAT">Cat</SelectItem>
                              <SelectItem value="BIRD">Bird</SelectItem>
                              <SelectItem value="RABBIT">Rabbit</SelectItem>
                              <SelectItem value="FISH">Fish</SelectItem>
                              <SelectItem value="REPTILE">Reptile</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="breed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Breed</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter breed (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (years)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter age in years (optional)" 
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value === '' ? undefined : parseInt(e.target.value);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                              value={field.value}
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="MALE" id="male" />
                                <Label htmlFor="male">Male</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="FEMALE" id="female" />
                                <Label htmlFor="female">Female</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="UNKNOWN" id="unknown" />
                                <Label htmlFor="unknown">Unknown</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter color (optional)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter weight in kg (optional)" 
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="microchipId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Microchip ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter microchip ID (optional)" {...field} />
                        </FormControl>
                        <FormDescription>
                          If your pet has a microchip, enter its ID number here
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source*</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PERSONAL">Personal Pet</SelectItem>
                            <SelectItem value="ADOPTED">Adopted</SelectItem>
                            <SelectItem value="LOST_FOUND">Lost & Found</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How did you acquire this pet?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter any additional notes about your pet (optional)"
                            className="min-h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="medicalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Information</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter any medical information, allergies, or special needs (optional)"
                            className="min-h-20"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate(-1)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isEditMode ? "Update Pet Profile" : "Create Pet Profile"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddEditPet; 