import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { Star, Clock, MapPin, Loader2 } from "lucide-react";
import PageHeading from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

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
  vicinity: string;
  rating?: number;
  opening_hours?: {
    open_now?: boolean;
  };
  photos?: google.maps.places.PlacePhoto[];
  geometry: {
    location: google.maps.LatLng;
  };
  place_id: string;
  photoUrl?: string | null;
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
        placeholder="Search for vet clinics..."
      />
    </div>
  );
}

export default function FindVets() {
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

  const getPhotoUrl = async (photo: google.maps.places.PlacePhoto | undefined): Promise<string | null> => {
    return new Promise<string | null>((resolve) => {
      if (!photo) {
        resolve(null);
        return;
      }
      try {
        photo.getUrl({
          maxWidth: 400,
          maxHeight: 300
        }, (url: string | null) => resolve(url));
      } catch (error) {
        console.error('Error getting photo URL:', error);
        resolve(null);
      }
    });
  };

  const fetchNearbyClinics = useCallback(async (location: google.maps.LatLngLiteral) => {
    setLoading(true);
    
    try {
      const service = new google.maps.places.PlacesService(mapRef.current!);
      const request = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: 5000,
        type: 'veterinary_care'
      };

      service.nearbySearch(request, async (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const clinicsData: VetClinic[] = await Promise.all(
            results.map(async (place: google.maps.places.PlaceResult): Promise<VetClinic> => {
              let photoUrl: string | null = null;
              if (place.photos && place.photos.length > 0) {
                photoUrl = await getPhotoUrl(place.photos[0]);
              }

              return {
                name: place.name || '',
                vicinity: place.vicinity || '',
                rating: place.rating || undefined,
                opening_hours: place.opening_hours,
                photos: place.photos,
                geometry: {
                  location: place.geometry?.location || new google.maps.LatLng(0, 0)
                },
                place_id: place.place_id || '',
                photoUrl
              };
            })
          );
          setClinics(clinicsData);
          toast.success(`Found ${clinicsData.length} veterinary clinics nearby`);
        } else {
          toast.error('No clinics found in this area');
          setClinics([]);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error("Error fetching clinics:", error);
      toast.error("Failed to fetch nearby clinics");
      setClinics([]);
      setLoading(false);
    }
  }, []);

  const filteredClinics = clinics.filter((clinic) => {
    if (filters.isOpen && !clinic.vicinity) return false;
    if (typeof clinic.rating === 'number' && clinic.rating < filters.minRating) return false;
    if (filters.service && !clinic.vicinity.toLowerCase().includes(filters.service.toLowerCase())) return false;
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
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.isOpen}
                  onChange={(e) => setFilters({ ...filters, isOpen: e.target.checked })}
                />
                Open Now
              </Label>
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
                <option value="veterinary_care">General Veterinary Care</option>
                <option value="emergency">Emergency Services</option>
                <option value="pet_store">Pet Store</option>
                <option value="pet_grooming">Pet Grooming</option>
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
                  key={clinic.place_id}
                  className="p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedClinic(clinic);
                    panTo(clinic.geometry.location.toJSON());
                  }}
                >
                  {clinic.photoUrl && (
                    <img
                      src={clinic.photoUrl}
                      alt={clinic.name}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <h4 className="font-semibold">{clinic.name}</h4>
                  <div className="text-sm text-gray-600">
                    {clinic?.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{Number(clinic.rating).toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {clinic.vicinity ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">Open</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700">Closed</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
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
                key={clinic.place_id}
                position={clinic.geometry.location.toJSON()}
                onClick={() => setSelectedClinic(clinic)}
              />
            ))}

            {selectedClinic && (
              <InfoWindow
                position={selectedClinic.geometry.location.toJSON()}
                onCloseClick={() => setSelectedClinic(null)}
              >
                <div className="max-w-sm">
                  {selectedClinic.photoUrl && (
                    <img
                      src={selectedClinic.photoUrl}
                      alt={selectedClinic.name}
                      className="w-full h-32 object-cover rounded-md mb-2"
                    />
                  )}
                  <h3 className="font-semibold text-lg">{selectedClinic.name}</h3>
                  <div className="text-sm space-y-2">
                    {selectedClinic?.rating && (
                      <p className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span>{Number(selectedClinic.rating).toFixed(1)}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedClinic.vicinity ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">Open Now</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700">Closed</Badge>
                      )}
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedClinic.vicinity}
                    </p>
                    <Button
                      className="mt-2 w-full"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${selectedClinic.geometry.location.lat},${selectedClinic.geometry.location.lng}`,
                          "_blank"
                        );
                      }}
                    >
                      Get Directions
                    </Button>
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