import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Search, Filter, Cat, Dog, Paperclip, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { API_ENDPOINTS } from "@/lib/constants";
import { Link } from "react-router-dom";

interface PetProfile {
  _id: string;
  petName: string;
  petType: string;
  breed?: string;
  profileImage?: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface Report {
  _id: string;
  type: string;
  animalType: string;
  images: string[];
  status: string;
  description: string;
  location: {
    coordinates: number[];
    address: string;
  };
  createdAt: string;
}

const MyPets = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [petProfiles, setPetProfiles] = useState<PetProfile[]>([]);
  const [lostPets, setLostPets] = useState<Report[]>([]);
  const [foundPets, setFoundPets] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all-pets");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true);
          setError(null);
          
          // Get access token
          const token = await getAccessTokenSilently();
          
          // Fetch pet profiles
          const petProfilesResponse = await axios.get(
            `${API_ENDPOINTS.PET_PROFILES}/user/${user.sub}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          setPetProfiles(petProfilesResponse.data.data);
          
          // Fetch user's reports
          const reportsResponse = await axios.get(
            `${API_ENDPOINTS.REPORTS}/user`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          // Filter lost and found pets
          if (reportsResponse.data.data) {
            const allReports = reportsResponse.data.data;
            setLostPets(allReports.filter((report: Report) => report.type === "LOST"));
            setFoundPets(allReports.filter((report: Report) => report.type === "FOUND"));
          }
          
          setIsLoading(false);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to load your pet data. Please try again later.");
          setIsLoading(false);
        }
      }
    };
    
    fetchData();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // Filter pets based on search term
  const filteredPetProfiles = petProfiles?.filter(pet => 
    pet.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.petType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pet.breed && pet.breed.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];
  
  const filteredLostPets = lostPets?.filter(pet => 
    pet.animalType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const filteredFoundPets = foundPets?.filter(pet => 
    pet.animalType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Get pet icon based on type
  const getPetIcon = (petType: string) => {
    switch(petType.toUpperCase()) {
      case 'DOG':
        return <Dog className="h-5 w-5" />;
      case 'CAT':
        return <Cat className="h-5 w-5" />;
      default:
        return <Paperclip className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'RESOLVED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Resolved</Badge>;
      case 'DELETED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Deleted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Pets Dashboard</h1>
        <p className="text-gray-600">
          Manage your pet profiles, track lost or found pets, and keep important pet records in one place.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search pets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Link to="/add-edit-pet">
              <Button className="gap-1">
                <Plus size={16} /> Add Pet
              </Button>
            </Link>
            
            <Button variant="outline" onClick={() => setSearchTerm("")} className="gap-1">
              <RefreshCw size={16} /> Reset
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all-pets">All Pets</TabsTrigger>
            <TabsTrigger value="lost-pets">Lost Pets</TabsTrigger>
            <TabsTrigger value="found-pets">Found Pets</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your pet information...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 bg-red-50 rounded-lg border border-red-100 px-4">
              <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <TabsContent value="all-pets">
                {filteredPetProfiles.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">You haven't added any pet profiles yet.</p>
                    <Link to="/add-edit-pet">
                      <Button>
                        <Plus size={16} className="mr-2" /> Add Your First Pet
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPetProfiles.map((pet) => (
                      <div key={pet._id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-40 bg-gray-200 relative">
                          {pet.profileImage ? (
                            <img
                              src={pet.profileImage}
                              alt={pet.petName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              {getPetIcon(pet.petType)}
                              <span className="ml-2 text-gray-500">No image</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{pet.petName}</h3>
                            <Badge variant={pet.isActive ? "default" : "outline"}>
                              {pet.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1 mb-1">
                              {getPetIcon(pet.petType)}
                              <span>
                                {pet.petType} {pet.breed ? `• ${pet.breed}` : ""}
                              </span>
                            </div>
                            <div>Added on {new Date(pet.createdAt).toLocaleDateString()}</div>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Link to={`/pet/${pet._id}`} className="flex-1">
                              <Button variant="default" className="w-full">View Profile</Button>
                            </Link>
                            <Link to={`/add-edit-pet/${pet._id}`}>
                              <Button variant="outline" size="icon">
                                <Pencil size={16} />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="lost-pets">
                {filteredLostPets.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">You haven't reported any lost pets.</p>
                    <Link to="/report-lost-pet">
                      <Button>Report a Lost Pet</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLostPets.map((report) => (
                      <div key={report._id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-40 bg-gray-200 relative">
                          {report.images && report.images.length > 0 ? (
                            <img
                              src={report.images[0]}
                              alt={report.animalType}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <span className="text-gray-500">No image</span>
                            </div>
                          )}
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{report.animalType}</h3>
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{report.description}</p>
                          
                          <div className="text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1 mb-1">
                              <span>Reported on {new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                            {report.location && report.location.address && (
                              <div className="flex items-start gap-1">
                                <Search className="h-4 w-4 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{report.location.address}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Link to={`/lost-pet/${report._id}`} className="flex-1">
                              <Button variant="default" className="w-full">View Details</Button>
                            </Link>
                            {report.status === 'ACTIVE' && (
                              <Link to={`/edit-report/${report._id}`}>
                                <Button variant="outline" size="icon">
                                  <Pencil size={16} />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="found-pets">
                {filteredFoundPets.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">You haven't reported any found pets.</p>
                    <Link to="/report-found-pet">
                      <Button>Report a Found Pet</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFoundPets.map((report) => (
                      <div key={report._id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="h-40 bg-gray-200 relative">
                          {report.images && report.images.length > 0 ? (
                            <img
                              src={report.images[0]}
                              alt={report.animalType}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <span className="text-gray-500">No image</span>
                            </div>
                          )}
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold">{report.animalType}</h3>
                          </div>
                          
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{report.description}</p>
                          
                          <div className="text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-1 mb-1">
                              <span>Found on {new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>
                            {report.location && report.location.address && (
                              <div className="flex items-start gap-1">
                                <Search className="h-4 w-4 shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{report.location.address}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Link to={`/found-pet/${report._id}`} className="flex-1">
                              <Button variant="default" className="w-full">View Details</Button>
                            </Link>
                            {report.status === 'ACTIVE' && (
                              <Link to={`/edit-report/${report._id}`}>
                                <Button variant="outline" size="icon">
                                  <Pencil size={16} />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default MyPets; 