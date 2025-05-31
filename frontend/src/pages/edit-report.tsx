import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import PageHeading from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SingleImageDropzone } from "@/components/image-dropzone";
import { MapPin } from "lucide-react";
import { requestLocationPermission, getAddressFromCoords } from "@/lib/utils";

const ENV = import.meta.env.MODE;
const BASE_URL = ENV === "development" ? "http://localhost:4000" : import.meta.env.VITE_BASE_URL;

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

const EditReportPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth0();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState<string>("");
  const [animalType, setAnimalType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [file, setFile] = useState<File>();
  const [image, setImage] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/v1/reports/${id}`);
        const report = response.data;
        
        // Verify user has permission to edit
        if (user?.email !== report.contactInfo) {
          toast.error("You don't have permission to edit this report");
          navigate("/lost-pets");
          return;
        }

        setType(report.type);
        setAnimalType(report.animalType);
        setDescription(report.description);
        setLocation({
          latitude: report.location.coordinates[1],
          longitude: report.location.coordinates[0],
          address: report.location.address
        });
        if (report.images[0]) {
          setImage(report.images[0]);
        }
      } catch (error) {
        console.error("Error fetching report:", error);
        toast.error("Failed to fetch report details");
        navigate("/lost-pets");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, user?.email, navigate]);

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
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinates received from GPS");
      }

      const address = await getAddressFromCoords(lat, lng);
      
      setLocation({
        latitude: lat,
        longitude: lng,
        address: address || undefined
      });

      toast.success("Location updated successfully!");
    } catch (error) {
      console.error('Location error:', error);
      setLocationError(error instanceof Error ? error.message : "Failed to get location");
      toast.error(error instanceof Error ? error.message : "Failed to get location");
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!animalType || !location || !image) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const reportData = {
        type,
        animalType,
        description,
        location: {
          type: "Point",
          coordinates: [location.longitude, location.latitude],
          address: location.address || ""
        },
        images: [image]
      };

      await axios.put(`${BASE_URL}/api/v1/reports/${id}`, reportData);
      toast.success("Report updated successfully!");
      navigate("/lost-pets");
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error("Failed to update report");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-20.3rem)] flex flex-col w-full">
      <PageHeading pageName="Edit Report" />
      <form className="w-full mx-auto flex flex-col gap-4 lg:flex-row p-4 mb-8" onSubmit={(e) => e.preventDefault()}>
        <SingleImageDropzone
          value={file}
          dropzoneOptions={{
            maxSize: 1024 * 1024 * 5,
            accept: {
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
            }
          }}
          onChange={async (file) => {
            setFile(file);
            if (file) {
              setIsUploadingImage(true);
              try {
                const formData = new FormData();
                formData.append('image', file);
                const response = await axios.post(`${BASE_URL}/api/v1/upload`, formData);
                setImage(response.data.url);
                toast.success("Image uploaded successfully");
              } catch (error) {
                console.error("Image upload error:", error);
                toast.error("Failed to upload image");
                setFile(undefined);
              } finally {
                setIsUploadingImage(false);
              }
            } else {
              setImage("");
            }
          }}
        />

        <Card className="md:flex-3/5 w-full p-4 gap-0 max-h-fit">
          <div className="mb-4">
            <Label className="text-xl">Report Type</Label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="LOST">Lost Pet</option>
              <option value="FOUND">Found Animal</option>
              <option value="INJURED">Injured Animal</option>
            </select>
          </div>

          <Label className="text-xl">Animal Type/Description</Label>
          <Input
            type="text"
            className="mb-2"
            placeholder="Brief description (e.g., Brown dog, Tabby cat)"
            value={animalType}
            onChange={(e) => setAnimalType(e.target.value)}
            required
          />

          <Label className="text-xl">Location</Label>
          <div className="space-y-2 mb-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={getLocation}
              disabled={isGettingLocation}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {isGettingLocation ? "Getting Location..." : location ? "Update Location" : "Get Current Location"}
            </Button>
            
            {locationError && (
              <p className="text-sm text-red-500">{locationError}</p>
            )}
            
            {location && (
              <div className="text-sm text-gray-600">
                <p>Latitude: {location.latitude.toFixed(6)}</p>
                <p>Longitude: {location.longitude.toFixed(6)}</p>
                {location.address && (
                  <p className="mt-1">Address: {location.address}</p>
                )}
              </div>
            )}
          </div>

          <Label className="text-xl">Detailed Description</Label>
          <Textarea
            placeholder="Please provide a detailed description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-4"
            rows={4}
            required
          />

          <Button
            type="button"
            disabled={!animalType || !location || !image || saving || isUploadingImage}
            variant="default"
            className="w-full"
            onClick={handleSubmit}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Card>
      </form>
    </div>
  );
};

export default EditReportPage; 