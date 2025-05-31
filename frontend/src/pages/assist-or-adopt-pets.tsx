import AdoptPetCard from "@/components/adopt-pet-card";
import PageHeading from "@/components/page-heading";
import { adoptPetProps } from "@/types/PetTypes";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Heart, PawPrint } from "lucide-react";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "@/lib/constants";

const AssistOrAdoptPets = () => {
  const [adoptPets, setAdoptPets] = useState<adoptPetProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAdoptPets = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // Using the API_ENDPOINTS constant for consistency
      console.log("Fetching from:", `${API_ENDPOINTS.PETS}/adopt`);
      const response = await axios.get(`${API_ENDPOINTS.PETS}/adopt`);
      
      console.log("API Response:", response.data);
      
      if (response.data.success) {
        setAdoptPets(response.data.pets || []);
      } else {
        setErrorMessage(response.data.message || "Failed to load adoption listings");
        toast.error(response.data.message || "Failed to load adoption listings");
      }
    } catch (error) {
      console.error("Error fetching adoption pets:", error);
      
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const errorData = error.response?.data;
        
        setErrorMessage(
          `Error ${statusCode}: ${errorData?.message || error.message}`
        );
        
        toast.error(`Failed to load adoption listings (${statusCode})`);
      } else {
        setErrorMessage("An unexpected error occurred");
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdoptPets();
  }, []);

  const handleDelete = () => {
    // Refresh the pet list after deletion
    fetchAdoptPets();
  };

  return (
    <div className="min-h-[calc(100vh-18.3rem)]">
      <div className="bg-gradient-to-r from-rose-100 to-orange-50 py-6">
        <div className="max-w-6xl mx-auto px-4">
          <PageHeading pageName="Assist or Adopt Pets" />
          <div className="flex flex-col md:flex-row justify-between items-center mt-4">
            <div className="max-w-2xl">
              <p className="text-gray-700 text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                Find your new furry friend or help an animal in need
              </p>
            </div>
            <Link to="/list-for-adopt">
              <Button className="bg-rose-500 hover:bg-rose-600 text-white flex items-center gap-2 mt-4 md:mt-0">
                <Plus className="h-4 w-4" />
                Report a Pet in Need
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-12 w-12 text-rose-500 animate-spin" />
          </div>
        ) : errorMessage ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-4 text-red-700">Error Loading Pets</h3>
              <p className="text-gray-800 mb-4">{errorMessage}</p>
              <Button 
                onClick={fetchAdoptPets} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : adoptPets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adoptPets.map((pet: adoptPetProps) => (
              <AdoptPetCard key={pet._id} pet={pet} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <PawPrint className="h-16 w-16 text-rose-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-4">No pets available for adoption at the moment</h3>
            <p className="text-gray-600 mb-4">Please check back later or consider reporting a pet that needs assistance.</p>
            <Link to="/list-for-adopt">
              <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                Report a Pet in Need
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistOrAdoptPets;
