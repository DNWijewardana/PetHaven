import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { Star, Clock, MapPin, Phone, ExternalLink, Loader2 } from "lucide-react";
import PageHeading from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import axios from "axios";
import { BASE_URL, API_ENDPOINTS } from "@/lib/constants";
import { requestLocationPermission } from "@/lib/utils";

const libraries: ("places")[] = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "600px",
};
const center = {
  lat: 7.8731,  // Sri Lanka's approximate center
  lng: 80.7718,
};

interface VetClinic {
  name: string;
  address: string;
  phoneNumber?: string;
  location: {
    type: string;
    coordinates: number[];
  };
  rating?: number;
  operatingHours?: {
    [key: string]: { open: string; close: string };
  };
  services?: string[];
  photoUrls?: string[];
  googlePlaceId?: string;
  googleData?: any;
}

interface SearchProps {
  panTo: (position: google.maps.LatLngLiteral) => void;
  fetchNearbyClinics: (location: google.maps.LatLngLiteral) => Promise<void>;
}

function SearchBox({ panTo, fetchNearbyClinics }: SearchProps) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const sessionToken = useRef(new google.maps.places.AutocompleteSessionToken());
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    autocompleteService.current = new google.maps.places.AutocompleteService();
    geocoder.current = new google.maps.Geocoder();
  }, []);

  const getSuggestions = useCallback(async (input: string) => {
    if (!input || !autocompleteService.current) return;

    setLoading(true);
    try {
      const request: google.maps.places.AutocompletionRequest = {
        input,
        sessionToken: sessionToken.current,
        componentRestrictions: { country: "lk" },
        types: ["geocode", "establishment"]
      };

      const response = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
        autocompleteService.current?.getPlacePredictions(
          request,
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              reject(status);
            }
          }
        );
      });

      setSuggestions(response);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = useCallback(async (placeId: string) => {
    if (!geocoder.current) return;

    try {
      const response = await geocoder.current.geocode({ placeId });
      if (response.results[0]) {
        const { location } = response.results[0].geometry;
        const latLng = { lat: location.lat(), lng: location.lng() };
        panTo(latLng);
        await fetchNearbyClinics(latLng);
        setSuggestions([]);
        // Create a new session token after selection
        sessionToken.current = new google.maps.places.AutocompleteSessionToken();
      }
    } catch (error) {
      console.error("Error geocoding place:", error);
    }
  }, [panTo, fetchNearbyClinics]);

  return (
    <div className="relative">
      <PlacesAutocomplete 
        onAddressSelect={(position) => {
          // Handle the selected position here
        }}
        placeholder="Search location..."
      />
    </div>
  );
}

export default function VetLocatorUnified() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [selectedClinic, setSelectedClinic] = useState<VetClinic | null>(null);
  const [clinics, setClinics] = useState<VetClinic[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    isOpen: false,
    minRating: 0,
    service: "",
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const panTo = useCallback((position: google.maps.LatLngLiteral) => {
    if (mapRef.current) {
      mapRef.current.panTo(position);
      mapRef.current.setZoom(14);
    }
  }, []);

  // Fetch user's current location on component mount
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const position = await requestLocationPermission();
        if (position) {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          panTo(currentLocation);
          await fetchNearbyClinics(currentLocation);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        toast.error("Could not get your location. Please search for a location.");
      }
    };

    if (isLoaded) {
      getCurrentLocation();
    }
  }, [isLoaded, panTo]);

  const fetchNearbyClinics = useCallback(async (location: google.maps.LatLngLiteral) => {
    setLoading(true);
    
    try {
      // Try to fetch from our own database first
      const response = await axios.get(`${API_ENDPOINTS.VET_CLINICS}/search/nearby`, {
        params: {
          latitude: location.lat,
          longitude: location.lng,
          maxDistance: 5000 // 5km radius
        }
      });

      let clinicsData = response.data.data;
      
      // If we don't have enough data in our database, fetch from Google
      if (clinicsData.length < 5) {
        const googleResponse = await axios.get(`${API_ENDPOINTS.VET_CLINICS}/google/nearby`, {
          params: {
            latitude: location.lat,
            longitude: location.lng,
            radius: 5000 // 5km radius
          }
        });
        
        clinicsData = googleResponse.data.data;
      }
      
      setClinics(clinicsData);
      toast.success(`Found ${clinicsData.length} veterinary clinics nearby`);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      toast.error("Failed to fetch nearby clinics");
      setClinics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to get details of a specific clinic
  const getClinicDetails = useCallback(async (clinic: VetClinic) => {
    if (clinic.googlePlaceId && !clinic.googleData) {
      try {
        const response = await axios.get(`${API_ENDPOINTS.VET_CLINICS}/google/${clinic.googlePlaceId}`);
        setSelectedClinic({
          ...clinic,
          googleData: response.data.data
        });
      } catch (error) {
        console.error("Error fetching clinic details:", error);
      }
    } else {
      setSelectedClinic(clinic);
    }
  }, []);

  const filteredClinics = clinics.filter((clinic) => {
    // Basic filter implementation
    if (filters.minRating && clinic.rating && clinic.rating < filters.minRating) return false;
    if (filters.service && clinic.services && !clinic.services.includes(filters.service)) return false;
    return true;
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeading 
        pageName="Find Vet Clinics" 
        description="Locate nearby veterinary clinics, check their ratings, and get directions. Your pet's health is our priority."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-4 col-span-1">
          <h2 className="text-xl font-semibold mb-4">Search & Filters</h2>
          
          <div className="space-y-4">
            <div>
              <Label>Search Location</Label>
              <SearchBox panTo={panTo} fetchNearbyClinics={fetchNearbyClinics} />
            </div>

            <div>
              <Label>Minimum Rating</Label>
              <select
                className="w-full p-2 border rounded"
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
              >
                <option value={0}>Any Rating</option>
                <option value={3}>3+ Stars</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>

            <div>
              <Label>Service Type</Label>
              <select
                className="w-full p-2 border rounded"
                value={filters.service}
                onChange={(e) => setFilters({ ...filters, service: e.target.value })}
              >
                <option value="">All Services</option>
                <option value="Emergency">Emergency Services</option>
                <option value="Surgery">Surgery</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Dental">Dental Care</option>
                <option value="Grooming">Pet Grooming</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Results ({filteredClinics.length})</h3>
              {loading && <Loader2 className="animate-spin" />}
            </div>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredClinics.map((clinic) => (
                <Card
                  key={clinic.googlePlaceId || clinic._id}
                  className="p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    getClinicDetails(clinic);
                    panTo({
                      lat: clinic.location.coordinates[1], 
                      lng: clinic.location.coordinates[0]
                    });
                  }}
                >
                  {clinic.photoUrls && clinic.photoUrls.length > 0 && (
                    <img
                      src={clinic.photoUrls[0]}
                      alt={clinic.name}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <h4 className="font-semibold">{clinic.name}</h4>
                  <div className="text-sm text-gray-600">
                    {clinic.rating !== undefined && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{Number(clinic.rating).toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{clinic.address}</span>
                    </div>
                    {clinic.phoneNumber && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{clinic.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              {!loading && filteredClinics.length === 0 && (
                <p className="text-center text-gray-500">No clinics found with the current filters.</p>
              )}
            </div>
          </div>
        </Card>

        <div className="col-span-1 md:col-span-2">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={8}
            center={center}
            onLoad={onMapLoad}
          >
            {filteredClinics.map((clinic) => (
              <Marker
                key={clinic.googlePlaceId || clinic._id}
                position={{
                  lat: clinic.location.coordinates[1], 
                  lng: clinic.location.coordinates[0]
                }}
                onClick={() => getClinicDetails(clinic)}
              />
            ))}

            {selectedClinic && (
              <InfoWindow
                position={{
                  lat: selectedClinic.location.coordinates[1], 
                  lng: selectedClinic.location.coordinates[0]
                }}
                onCloseClick={() => setSelectedClinic(null)}
              >
                <div className="max-w-sm">
                  {selectedClinic.photoUrls && selectedClinic.photoUrls.length > 0 && (
                    <img
                      src={selectedClinic.photoUrls[0]}
                      alt={selectedClinic.name}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-lg">{selectedClinic.name}</h3>
                  <div className="text-sm space-y-2">
                    {selectedClinic.rating !== undefined && (
                      <p className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{Number(selectedClinic.rating).toFixed(1)}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedClinic.address}
                    </p>
                    {selectedClinic.phoneNumber && (
                      <p className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedClinic.phoneNumber}
                      </p>
                    )}
                    {selectedClinic.services && selectedClinic.services.length > 0 && (
                      <div>
                        <p className="font-semibold">Services:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedClinic.services.map((service, index) => (
                            <Badge key={index} variant="outline">{service}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${selectedClinic.location.coordinates[1]},${selectedClinic.location.coordinates[0]}`,
                            "_blank"
                          );
                        }}
                      >
                        Get Directions
                      </Button>
                      {selectedClinic.googlePlaceId && (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            window.open(
                              `https://www.google.com/maps/place/?q=place_id:${selectedClinic.googlePlaceId}`,
                              "_blank"
                            );
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View on Google
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
} 