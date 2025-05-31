import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import PageHeading from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, PlusCircle, Plus } from "lucide-react";

const ENV = import.meta.env.MODE;
const BASE_URL = ENV === "development" ? "http://localhost:4000" : import.meta.env.VITE_BASE_URL;

interface Opportunity {
  _id: string;
  title: string;
  description: string;
  location: string;
  requirements: string[];
  startDate: string;
  endDate: string;
  status: "OPEN" | "CLOSED";
  organization: {
    name: string;
    email: string;
    picture: string;
  };
  createdAt: string;
  updatedAt: string;
}

const VolunteerOpportunities = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/v1/volunteer/opportunities`);
      setOpportunities(response.data);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      toast.error("Failed to fetch opportunities");
    } finally {
      setLoading(false);
    }
  };

  const handleNewOpportunity = () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    navigate("/volunteer/new");
  };

  const filteredOpportunities = opportunities.filter(opp => 
    opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.organization.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeading 
          pageName="Volunteer Opportunities" 
          description="Make a difference in your community by volunteering with animal welfare organizations."
        />
        <Button onClick={handleNewOpportunity}>
          <Plus className="w-4 h-4 mr-2" />
          New Opportunity
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search by title, organization, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        {isAuthenticated ? (
          <Button onClick={() => window.location.href = "/volunteer/post"}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Post Opportunity
          </Button>
        ) : (
          <Button onClick={() => loginWithRedirect()}>
            Sign in to Post
          </Button>
        )}
      </div>

      {opportunities.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">No Opportunities Available</h3>
          <p className="text-gray-500 mb-4">Be the first to create a volunteer opportunity!</p>
          <Button onClick={handleNewOpportunity}>Create Opportunity</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => (
            <Card 
              key={opportunity._id} 
              className="p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/volunteer/${opportunity._id}`)}
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{opportunity.title}</h3>
                    <Badge variant="outline" className="ml-2">
                      {opportunity.status === "OPEN" ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <h4 className="text-lg text-gray-700 mb-2">{opportunity.organization.name}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {opportunity.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {new Date(opportunity.startDate).toLocaleDateString()} - {new Date(opportunity.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 flex-grow">
                  {opportunity.description}
                </p>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold mb-1">Requirements:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {opportunity.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/volunteer/${opportunity._id}`);
                    }}
                  >
                    Apply Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VolunteerOpportunities; 