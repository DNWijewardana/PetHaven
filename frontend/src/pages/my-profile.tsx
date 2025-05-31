import { useAuth0 } from "@auth0/auth0-react";
import MyLostPets from "@/components/my-lost-pets";
import MyPetAdoptionListings from "@/components/my-pet-adopt-listings";
import { 
  Loader2, 
  PawPrint, 
  Mail, 
  User, 
  Calendar, 
  MapPin, 
  Heart, 
  Search, 
  BookOpen,
  Plus,
  ShieldCheck 
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/lib/constants";

const MyProfile = () => {
  const { user, isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [activeTab, setActiveTab] = useState("lost-pets");
  const [joinDate, setJoinDate] = useState<string>("");
  const [lostPetsCount, setLostPetsCount] = useState<number>(0);
  const [adoptionsCount, setAdoptionsCount] = useState<number>(0);
  const [petProfilesCount, setPetProfilesCount] = useState<number>(0);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Calculate a join date based on sub claim if available
    if (user?.sub) {
      const timestamp = user.sub.split('|')[1];
      if (timestamp) {
        try {
          // Auth0 timestamps are in seconds, convert to ms for Date
          const date = new Date(parseInt(timestamp) * 1000);
          setJoinDate(date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }));
        } catch (e) {
          setJoinDate("Member");
        }
      }
    }
  }, [user]);

  // Fetch counts for pet data
  useEffect(() => {
    const fetchPetCounts = async () => {
      if (!isAuthenticated || !user) return;
      
      setIsDataLoading(true);
      try {
        const token = await getAccessTokenSilently();
        
        // Get lost pets count
        const lostPetsResponse = await axios.post(`${API_ENDPOINTS.BASE_URL}/api/v1/my/pets/lost/count`, {
          email: user.email
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Get adoption listings count
        const adoptionsResponse = await axios.post(`${API_ENDPOINTS.BASE_URL}/api/v1/my/pets/adopt/count`, {
          email: user.email
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Get pet profiles count
        const profilesResponse = await axios.get(
          `${API_ENDPOINTS.PET_PROFILES}/user/${user.sub}/count`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        setLostPetsCount(lostPetsResponse.data.count || 0);
        setAdoptionsCount(adoptionsResponse.data.count || 0);
        setPetProfilesCount(profilesResponse.data.count || 0);
      } catch (error) {
        console.error("Error fetching pet counts:", error);
        // Use fallback counts if API fails
        setLostPetsCount(0);
        setAdoptionsCount(0); 
        setPetProfilesCount(0);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchPetCounts();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          <p className="mt-4 text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-rose-50 rounded-lg border border-rose-100 max-w-md">
          <h2 className="text-xl font-semibold text-rose-700 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const displayName = user?.name || user?.nickname || 'Pet Lover';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="min-h-[calc(100vh-18.3rem)] bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header with User Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* User Card */}
          <Card className="lg:col-span-4 border shadow-md">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 font-medium">
                  {user.email_verified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              <CardDescription>Manage your pet information and listings</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={user.picture} alt={displayName} />
                  <AvatarFallback className="text-3xl">{firstName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-2xl font-bold">{displayName}</h2>
                  {user.email && (
                    <div className="flex items-center justify-center text-gray-600 mt-1 gap-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center text-gray-600 mt-1 gap-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Joined {joinDate || "Recently"}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <Link to="/my-pets" className="col-span-2">
                  <Button className="w-full shadow-sm">
                    <PawPrint className="h-4 w-4 mr-2" />
                    Manage Pet Profiles
                  </Button>
                </Link>
                <Link to="/my-verifications" className="col-span-1">
                  <Button variant="outline" className="w-full">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Verifications
                  </Button>
                </Link>
                <Link to="/add-edit-pet" className="col-span-1">
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pet
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* User Dashboard */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Stats Cards */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Lost Pets</p>
                      {isDataLoading ? (
                        <div className="flex items-center mt-1">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-700 mr-2" />
                          <span className="text-blue-700">Loading...</span>
                        </div>
                      ) : (
                        <h3 className="text-2xl font-bold">{lostPetsCount}</h3>
                      )}
                    </div>
                    <div className="bg-blue-200 p-2 rounded-full">
                      <Search className="h-5 w-5 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-green-700">Pet Adoptions</p>
                      {isDataLoading ? (
                        <div className="flex items-center mt-1">
                          <Loader2 className="h-4 w-4 animate-spin text-green-700 mr-2" />
                          <span className="text-green-700">Loading...</span>
                        </div>
                      ) : (
                        <h3 className="text-2xl font-bold">{adoptionsCount}</h3>
                      )}
                    </div>
                    <div className="bg-green-200 p-2 rounded-full">
                      <Heart className="h-5 w-5 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-purple-700">Pet Profiles</p>
                      {isDataLoading ? (
                        <div className="flex items-center mt-1">
                          <Loader2 className="h-4 w-4 animate-spin text-purple-700 mr-2" />
                          <span className="text-purple-700">Loading...</span>
                        </div>
                      ) : (
                        <h3 className="text-2xl font-bold">{petProfilesCount}</h3>
                      )}
                    </div>
                    <div className="bg-purple-200 p-2 rounded-full">
                      <BookOpen className="h-5 w-5 text-purple-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border shadow-md">
              <CardHeader className="pb-4">
                <CardTitle>My Pet Activity</CardTitle>
                <CardDescription>
                  Manage all your pet listings and reports
                </CardDescription>
              </CardHeader>
              <CardContent className="px-2 sm:px-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="lost-pets" className="flex-1">Lost Pets</TabsTrigger>
                    <TabsTrigger value="adoptions" className="flex-1">Pet Adoptions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="lost-pets">
                    <MyLostPets />
                  </TabsContent>
                  
                  <TabsContent value="adoptions">
              <MyPetAdoptionListings />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t justify-between py-4">
                <p className="text-sm text-gray-500">Need help with your pets?</p>
                <Link to="/pet-first-aid">
                  <Button variant="link" size="sm" className="text-rose-600">
                    View Pet First Aid Guide
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
