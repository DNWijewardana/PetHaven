import { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Calendar, Phone, Edit, Trash2, Search, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import PageHeading from "@/components/page-heading";
import { requestLocationPermission } from "@/lib/utils";
import GuestPetBrowser from "@/components/guest-pet-browser";
import { Link } from "react-router-dom";

interface Report {
  _id: string;
  type: 'LOST' | 'FOUND' | 'INJURED';
  animalType: string;
  description: string;
  location: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  images: string[];
  contactInfo: string;
  status: 'ACTIVE' | 'RESOLVED' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

const ENV = import.meta.env.MODE;
const BASE_URL = ENV === "development" ? "http://localhost:4000" : import.meta.env.VITE_BASE_URL;

const ReportsPage = () => {
  const { user, isAuthenticated } = useAuth0();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/v1/reports`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.patch(`${BASE_URL}/api/v1/reports/${id}/status`, {
        status: 'DELETED'
      });
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleStatusChange = async (id: string, status: 'ACTIVE' | 'RESOLVED') => {
    try {
      await axios.patch(`${BASE_URL}/api/v1/reports/${id}/status`, { status });
      toast.success('Status updated successfully');
      fetchReports();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getUserLocation = async () => {
    try {
      const position = await requestLocationPermission({ showProactivePrompt: true });
      
      if (!position) {
        toast.error("Please enable location access to see nearby reports");
        return;
      }

      const newLocation: [number, number] = [position.coords.longitude, position.coords.latitude];
      setUserLocation(newLocation);
      
      // Sort reports by distance from user's location
      if (reports.length > 0) {
        const sortedReports = [...reports].sort((a, b) => {
          const distA = calculateDistance(newLocation, a.location.coordinates);
          const distB = calculateDistance(newLocation, b.location.coordinates);
          return distA - distB;
        });
        setReports(sortedReports);
        toast.success("Reports sorted by distance from your location!");
      }
    } catch (error) {
      console.error('Location error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to get location");
    }
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const [lon1, lat1] = point1;
    const [lon2, lat2] = point2;
    const R = 6371; // Earth's radius in km
    
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports();
      getUserLocation();
    }
  }, [isAuthenticated]);

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'ALL' || report.type === filter;
    const matchesSearch = searchTerm === '' || 
      report.animalType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch && report.status !== 'DELETED';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'RESOLVED': return 'bg-blue-500';
      case 'DELETED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LOST': return 'bg-red-500';
      case 'FOUND': return 'bg-green-500';
      case 'INJURED': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Render the guest view if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeading 
          pageName="Lost & Found Pets" 
          description="Browse lost and found pet reports from our community. Sign in to contact owners and help reunite pets with their families."
        />
        
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Browsing as Guest</h2>
            <p className="text-gray-600">You can view reports, but will need to sign in to see contact details or report a pet.</p>
          </div>
          <Link to="/report-lost-pet">
            <Button className="bg-rose-600 hover:bg-rose-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Report a Pet
            </Button>
          </Link>
        </div>
        
        <GuestPetBrowser />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeading 
        pageName="Animal Reports" 
        description="View and manage lost, found, and injured animal reports. Help reunite pets with their owners."
      />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">All Reports</h2>
        <Link to="/report-lost-pet">
          <Button className="bg-rose-600 hover:bg-rose-700">
            <PlusCircle className="mr-2 h-4 w-4" />
            Report a Pet
          </Button>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search by animal type, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Reports</SelectItem>
            <SelectItem value="LOST">Lost Pets</SelectItem>
            <SelectItem value="FOUND">Found Animals</SelectItem>
            <SelectItem value="INJURED">Injured Animals</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading reports...</div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-8">No reports found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <Card key={report._id} className="overflow-hidden">
              {report.images && report.images.length > 0 && (
                <div className="relative w-full h-48">
                  <img
                    src={report.images[0]}
                    alt={report.animalType}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, set a fallback
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite error loop
                      target.src = "https://placehold.co/400x300/EEE/999?text=No+Image";
                    }}
                  />
                  {report.images.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md text-xs">
                      +{report.images.length - 1} more
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={getTypeColor(report.type)}>
                    {report.type}
                  </Badge>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">{report.animalType}</h3>
                <p className="text-gray-600 mb-4">{report.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {report.location.address}
                    {userLocation && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({calculateDistance(userLocation, report.location.coordinates).toFixed(1)} km away)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(report.createdAt), 'PPP')}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {report.contactInfo}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between">
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={report.status === 'ACTIVE' ? 'text-blue-500' : 'text-green-500'}
                      onClick={() => handleStatusChange(
                        report._id, 
                        report.status === 'ACTIVE' ? 'RESOLVED' : 'ACTIVE'
                      )}
                    >
                      {report.status === 'ACTIVE' ? 'Mark Resolved' : 'Mark Active'}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-amber-500"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500"
                      onClick={() => handleDelete(report._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
