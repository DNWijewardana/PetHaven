import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { format } from "date-fns";
import { AlertCircle, ArrowLeft, Cat, Clock, Dog, Download, Edit, File, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { API_ENDPOINTS } from "@/lib/constants";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface VaccineRecord {
  _id: string;
  name: string;
  date: string;
  fileUrl: string;
  notes?: string;
  uploadedAt: string;
}

interface PetProfile {
  _id: string;
  userId: string;
  petName: string;
  petType: string;
  breed?: string;
  age?: number;
  gender?: string;
  color?: string;
  weight?: number;
  microchipId?: string;
  profileImage?: string;
  additionalImages?: string[];
  source: string;
  sourceReference?: string;
  sourceModel?: string;
  notes?: string;
  medicalInfo?: string;
  vaccines: VaccineRecord[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const vaccineSchema = z.object({
  name: z.string().min(1, "Vaccine name is required"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

type VaccineFormValues = z.infer<typeof vaccineSchema>;

const PetProfile = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [pet, setPet] = useState<PetProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddVaccineDialogOpen, setIsAddVaccineDialogOpen] = useState(false);
  const [vaccineFile, setVaccineFile] = useState<File | null>(null);
  const [isSubmittingVaccine, setIsSubmittingVaccine] = useState(false);

  const vaccineForm = useForm<VaccineFormValues>({
    resolver: zodResolver(vaccineSchema),
    defaultValues: {
      name: "",
      date: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  useEffect(() => {
    const fetchPetProfile = async () => {
      if (!profileId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const token = await getAccessTokenSilently();
        
        const response = await axios.get(
          `${API_ENDPOINTS.PET_PROFILES}/${profileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setPet(response.data.data);
        if (response.data.data.profileImage) {
          setSelectedImage(response.data.data.profileImage);
        } else if (response.data.data.additionalImages && response.data.data.additionalImages.length > 0) {
          setSelectedImage(response.data.data.additionalImages[0]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching pet profile:", err);
        setError("Failed to load pet profile. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchPetProfile();
  }, [profileId, getAccessTokenSilently]);

  const handleDeactivatePet = async () => {
    if (!pet) return;
    
    try {
      const token = await getAccessTokenSilently();
      
      await axios.patch(
        `${API_ENDPOINTS.PET_PROFILES}/${pet._id}/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success("Pet profile deactivated successfully");
      setPet({ ...pet, isActive: false });
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deactivating pet profile:", err);
      toast.error("Failed to deactivate pet profile");
    }
  };

  const handleReactivatePet = async () => {
    if (!pet) return;
    
    try {
      const token = await getAccessTokenSilently();
      
      await axios.patch(
        `${API_ENDPOINTS.PET_PROFILES}/${pet._id}/reactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      toast.success("Pet profile reactivated successfully");
      setPet({ ...pet, isActive: true });
    } catch (err) {
      console.error("Error reactivating pet profile:", err);
      toast.error("Failed to reactivate pet profile");
    }
  };

  const getPetIcon = (petType: string) => {
    switch(petType.toUpperCase()) {
      case 'DOG':
        return <Dog className="h-6 w-6" />;
      case 'CAT':
        return <Cat className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const getSourceBadge = (source: string) => {
    switch(source) {
      case 'ADOPTED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Adopted</Badge>;
      case 'LOST_FOUND':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Lost & Found</Badge>;
      case 'PERSONAL':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Personal</Badge>;
      default:
        return <Badge>{source}</Badge>;
    }
  };

  const handleVaccineFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File must be less than 5MB");
        return;
      }
      
      setVaccineFile(file);
    }
  };

  const onSubmitVaccine = async (values: VaccineFormValues) => {
    if (!vaccineFile) {
      toast.error("Please upload a vaccine document");
      return;
    }
    
    try {
      setIsSubmittingVaccine(true);
      
      const token = await getAccessTokenSilently();
      
      // First upload the file
      const formData = new FormData();
      formData.append("file", vaccineFile);
      
      const uploadResponse = await axios.post(
        API_ENDPOINTS.UPLOAD,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      
      const fileUrl = uploadResponse.data.fileUrl;
      
      // Then create the vaccine record
      await axios.post(
        `${API_ENDPOINTS.PET_PROFILES}/${profileId}/vaccines`,
        {
          ...values,
          fileUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh pet data
      const response = await axios.get(
        `${API_ENDPOINTS.PET_PROFILES}/${profileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setPet(response.data.data);
      setActiveTab("vaccines");
      setIsAddVaccineDialogOpen(false);
      vaccineForm.reset();
      setVaccineFile(null);
      toast.success("Vaccine record added successfully");
      
      setIsSubmittingVaccine(false);
    } catch (err) {
      console.error("Error adding vaccine record:", err);
      toast.error("Failed to add vaccine record");
      setIsSubmittingVaccine(false);
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

  if (error || !pet) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100 px-4 max-w-2xl mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error Loading Pet Profile</h2>
          <p className="text-red-600 mb-6">{error || "Pet profile not found"}</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/my-pets')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {getPetIcon(pet.petType)}
              {pet.petName}
              {!pet.isActive && (
                <Badge variant="outline" className="ml-2 text-gray-500">Inactive</Badge>
              )}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              {getSourceBadge(pet.source)}
              {pet.breed && (
                <Badge variant="outline">{pet.breed}</Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link to={`/add-edit-pet/${pet._id}`}>
              <Button variant="outline" className="gap-1">
                <Edit className="h-4 w-4" /> Edit
              </Button>
            </Link>
            
            {pet.isActive ? (
              <Button 
                variant="outline" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Deactivate
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="text-green-500 hover:text-green-700 hover:bg-green-50"
                onClick={handleReactivatePet}
              >
                <Clock className="h-4 w-4 mr-1" /> Reactivate
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden mb-6">
            <div className="aspect-square bg-gray-100 relative">
              {selectedImage ? (
                <img 
                  src={selectedImage}
                  alt={pet.petName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {getPetIcon(pet.petType)}
                  <span className="text-gray-500 mt-2">No image available</span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex gap-2 flex-wrap">
                {pet.profileImage && (
                  <button 
                    onClick={() => setSelectedImage(pet.profileImage)}
                    className={`h-16 w-16 rounded overflow-hidden border-2 ${selectedImage === pet.profileImage ? 'border-indigo-500' : 'border-transparent'}`}
                  >
                    <img 
                      src={pet.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}
                
                {pet.additionalImages && pet.additionalImages.map((image, index) => (
                  <button 
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`h-16 w-16 rounded overflow-hidden border-2 ${selectedImage === image ? 'border-indigo-500' : 'border-transparent'}`}
                  >
                    <img 
                      src={image}
                      alt={`Additional ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                
                <Link to={`/add-edit-pet/${pet._id}`} className="h-16 w-16 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <h3 className="font-semibold text-lg mb-2">Pet Summary</h3>
            <Separator className="mb-4" />
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{format(new Date(pet.createdAt), 'PPP')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{format(new Date(pet.updatedAt), 'PPP')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{pet.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              
              {pet.sourceReference && pet.sourceModel && (
                <div>
                  <p className="text-sm text-gray-500">Source Reference</p>
                  <Link to={`/${pet.sourceModel === 'Report' ? 'report' : 'pet'}/${pet.sourceReference}`} className="text-indigo-600 hover:underline">
                    View Source
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="medical">Medical Records</TabsTrigger>
                <TabsTrigger value="vaccines">Vaccination Records ({pet.vaccines.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="font-medium">{pet.petType}</p>
                      </div>
                      
                      {pet.breed && (
                        <div>
                          <p className="text-sm text-gray-500">Breed</p>
                          <p className="font-medium">{pet.breed}</p>
                        </div>
                      )}
                      
                      {pet.age && (
                        <div>
                          <p className="text-sm text-gray-500">Age</p>
                          <p className="font-medium">{pet.age} {pet.age === 1 ? 'year' : 'years'}</p>
                        </div>
                      )}
                      
                      {pet.gender && (
                        <div>
                          <p className="text-sm text-gray-500">Gender</p>
                          <p className="font-medium">{pet.gender}</p>
                        </div>
                      )}
                      
                      {pet.color && (
                        <div>
                          <p className="text-sm text-gray-500">Color</p>
                          <p className="font-medium">{pet.color}</p>
                        </div>
                      )}
                      
                      {pet.weight && (
                        <div>
                          <p className="text-sm text-gray-500">Weight</p>
                          <p className="font-medium">{pet.weight} kg</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Additional Information</h3>
                    
                    {pet.microchipId ? (
                      <div className="mb-3">
                        <p className="text-sm text-gray-500">Microchip ID</p>
                        <p className="font-medium">{pet.microchipId}</p>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <p className="text-sm text-gray-500">Microchip ID</p>
                        <p className="text-gray-400 italic">Not provided</p>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Notes</p>
                      {pet.notes ? (
                        <p className="whitespace-pre-line">{pet.notes}</p>
                      ) : (
                        <p className="text-gray-400 italic">No notes added</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="medical">
                <div>
                  <h3 className="font-semibold mb-3">Medical Information</h3>
                  
                  {pet.medicalInfo ? (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                      <p className="whitespace-pre-line">{pet.medicalInfo}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4 text-center">
                      <p className="text-gray-500">No medical information has been added yet.</p>
                    </div>
                  )}
                  
                  <Link to={`/add-edit-pet/${pet._id}`}>
                    <Button variant="outline" className="gap-1">
                      <Edit className="h-4 w-4" /> Edit Medical Information
                    </Button>
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="vaccines">
                <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <h3 className="font-semibold">Vaccination Records</h3>
                  
                  <Button className="gap-1" onClick={() => setIsAddVaccineDialogOpen(true)}>
                    <Plus className="h-4 w-4" /> Add Vaccination Record
                  </Button>
                </div>
                
                {pet.vaccines.length === 0 ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                    <p className="text-gray-500 mb-2">No vaccination records have been added yet.</p>
                    <p className="text-sm text-gray-400">Add vaccination records to keep track of your pet's health.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {pet.vaccines.map((vaccine) => (
                      <Card key={vaccine._id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle>{vaccine.name}</CardTitle>
                            <Badge variant="outline">
                              {format(new Date(vaccine.date), 'PP')}
                            </Badge>
                          </div>
                          <CardDescription>
                            Added on {format(new Date(vaccine.uploadedAt), 'PP')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {vaccine.notes && (
                            <p className="text-sm text-gray-600 mb-2">{vaccine.notes}</p>
                          )}
                        </CardContent>
                        <CardFooter className="flex justify-between pt-0">
                          <a 
                            href={vaccine.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                          >
                            <File className="h-4 w-4 mr-1" /> View Document
                          </a>
                          
                          <Button variant="outline" size="sm" asChild>
                            <a href={vaccine.fileUrl} download={`${pet.petName}_${vaccine.name}_vaccine.pdf`}>
                              <Download className="h-4 w-4 mr-1" /> Download
                            </a>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Pet Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate {pet.petName}'s profile? This will hide it from your active pets but the profile will still be recoverable.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeactivatePet}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAddVaccineDialogOpen} onOpenChange={setIsAddVaccineDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vaccination Record</DialogTitle>
            <DialogDescription>
              Add a new vaccination record for {pet?.petName}. Upload a document such as a vaccination certificate or receipt.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...vaccineForm}>
            <form onSubmit={vaccineForm.handleSubmit(onSubmitVaccine)} className="space-y-4">
              <FormField
                control={vaccineForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaccine Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Rabies, Distemper, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={vaccineForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Administered</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={vaccineForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional information" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <Label htmlFor="vaccineFile">Upload Document</Label>
                <div className="mt-1">
                  <Input
                    id="vaccineFile"
                    type="file"
                    onChange={handleVaccineFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Upload a vaccination certificate, receipt, or other document (PDF or image, max 5MB)
                </p>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddVaccineDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmittingVaccine}
                >
                  {isSubmittingVaccine && (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  )}
                  Add Record
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PetProfile; 