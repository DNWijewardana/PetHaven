import { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useAuth0 } from "@auth0/auth0-react";

interface Report {
  _id: string;
  type: 'LOST' | 'FOUND' | 'INJURED';
  animalType: string;
  description: string;
  location: {
    address: string;
  };
  images: string[];
  status: 'ACTIVE' | 'RESOLVED' | 'DELETED';
  createdAt: string;
}

const ENV = import.meta.env.MODE;
const BASE_URL = ENV === "development" ? "http://localhost:4000" : import.meta.env.VITE_BASE_URL;

const GuestPetBrowser = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/v1/reports/public`);
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching public reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'LOST': return 'bg-red-500';
      case 'FOUND': return 'bg-green-500';
      case 'INJURED': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  if (reports.length === 0) {
    return <div className="text-center py-8">No reports available</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report._id} className="overflow-hidden">
            {report.images && report.images.length > 0 && (
              <div className="relative w-full h-48">
                <img
                  src={report.images[0]}
                  alt={report.animalType}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "https://placehold.co/400x300/EEE/999?text=No+Image";
                  }}
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <Badge className={getTypeColor(report.type)}>
                  {report.type}
                </Badge>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{report.animalType}</h3>
              <p className="text-gray-600 mb-4">{report.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {report.location.address}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(new Date(report.createdAt), 'PPP')}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => loginWithRedirect()}
                >
                  Sign in to view contact details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GuestPetBrowser; 