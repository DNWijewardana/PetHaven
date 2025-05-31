import { useState, useCallback, useRef } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { MapPin, Star, Clock, Phone } from "lucide-react";
import PageHeading from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";

const libraries: ("places")[] = ["places"];
const mapContainerStyle = {
  width: "100%",
  height: "600px",
};
const center = {
  lat: 7.8731,  // Sri Lanka's approximate center
  lng: 80.7718,
};

interface Clinic {
  id: string;
  name: string;
  position: google.maps.LatLngLiteral;
  address: string;
  rating: number;
  isOpen: boolean;
  phone: string;
  services: string[];
}

interface SearchProps {
  panTo: (position: google.maps.LatLngLiteral) => void;
  fetchNearbyClinics: (location: google.maps.LatLngLiteral) => Promise<void>;
}

function SearchBox({ panTo, fetchNearbyClinics }: SearchProps) {
  const handleAddressSelect = async (position: google.maps.LatLngLiteral) => {
    try {
      panTo(position);
      await fetchNearbyClinics(position);
      toast.success("Location updated!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error finding location");
    }
  };

  return (
    <PlacesAutocomplete 
      onAddressSelect={handleAddressSelect}
      placeholder="Search location..."
    />
  );
}

export default function VetLocator() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filters, setFilters] = useState({
    isOpen: false,
    minRating: 0,
    service: "",
  });

  const mapRef = useRef<google.maps.Map>();
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const panTo = useCallback(({ lat, lng }: google.maps.LatLngLiteral) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(14);
    }
  }, []);

  const fetchNearbyClinics = useCallback(async (location: google.maps.LatLngLiteral) => {
    // This would be replaced with an actual API call to your backend
    const mockClinics: Clinic[] = [
      {
        id: "1",
        name: "Pet Care Clinic",
        position: { lat: location.lat + 0.01, lng: location.lng + 0.01 },
        address: "123 Pet Street, Colombo",
        rating: 4.5,
        isOpen: true,
        phone: "+94 11 234 5678",
        services: ["Emergency", "Surgery", "Vaccination"],
      },
      {
        id: "2",
        name: "Animal Hospital",
        position: { lat: location.lat - 0.01, lng: location.lng - 0.01 },
        address: "456 Animal Avenue, Kandy",
        rating: 4.8,
        isOpen: false,
        phone: "+94 81 234 5678",
        services: ["Surgery", "Dental", "Grooming"],
      },
    ];

    setClinics(mockClinics);
  }, []);

  const filteredClinics = clinics.filter((clinic) => {
    if (filters.isOpen && !clinic.isOpen) return false;
    if (clinic.rating < filters.minRating) return false;
    if (filters.service && !clinic.services.includes(filters.service)) return false;
    return true;
  });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeading pageName="Find Vet Clinics" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-4 col-span-1">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          
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
                <option value="Emergency">Emergency</option>
                <option value="Surgery">Surgery</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Dental">Dental</option>
                <option value="Grooming">Grooming</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Results ({filteredClinics.length})</h3>
            <div className="space-y-4">
              {filteredClinics.map((clinic) => (
                <Card
                  key={clinic.id}
                  className="p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedClinic(clinic);
                    panTo(clinic.position);
                  }}
                >
                  <h4 className="font-semibold">{clinic.name}</h4>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {clinic.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {clinic.isOpen ? "Open" : "Closed"}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {clinic.address}
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
                key={clinic.id}
                position={clinic.position}
                onClick={() => setSelectedClinic(clinic)}
              />
            ))}

            {selectedClinic && (
              <InfoWindow
                position={selectedClinic.position}
                onCloseClick={() => setSelectedClinic(null)}
              >
                <div>
                  <h3 className="font-semibold">{selectedClinic.name}</h3>
                  <div className="text-sm">
                    <p className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {selectedClinic.rating} Stars
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedClinic.isOpen ? "Open Now" : "Closed"}
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {selectedClinic.phone}
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedClinic.address}
                    </p>
                    <div className="mt-2">
                      <strong>Services:</strong>
                      <p>{selectedClinic.services.join(", ")}</p>
                    </div>
                    <Button
                      className="mt-2 w-full"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${selectedClinic.position.lat},${selectedClinic.position.lng}`,
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