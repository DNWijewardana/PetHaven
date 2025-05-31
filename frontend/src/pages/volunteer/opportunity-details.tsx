import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import PageHeading from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, MapPin, Trash2, Calendar } from "lucide-react";

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

const OpportunityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpportunity();
  }, [id]);

  const fetchOpportunity = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/v1/volunteer/opportunities/${id}`);
      setOpportunity(response.data);
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      toast.error("Failed to fetch opportunity");
      navigate("/volunteer");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated || user?.email !== opportunity?.organization.email) {
      return;
    }

    if (!window.confirm("Are you sure you want to delete this opportunity?")) {
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/api/v1/volunteer/opportunities/${id}`);
      toast.success("Opportunity deleted successfully");
      navigate("/volunteer");
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      toast.error("Failed to delete opportunity");
    }
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    navigate(`/volunteer/apply/${id}`);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!opportunity) {
    return <div className="text-center py-8">Opportunity not found</div>;
  }

  const isOrganizer = isAuthenticated && user?.email === opportunity.organization.email;

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-20.3rem)] w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <PageHeading pageName={opportunity.title} />
        {isOrganizer && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/volunteer/edit/${opportunity._id}`)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-start gap-4 mb-6">
          <Avatar>
            <AvatarImage src={opportunity.organization.picture} alt={opportunity.organization.name} />
            <AvatarFallback>{opportunity.organization.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{opportunity.organization.name}</h3>
            <p className="text-sm text-gray-500">
              Posted on {new Date(opportunity.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            {opportunity.location}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            {new Date(opportunity.startDate).toLocaleDateString()} - {new Date(opportunity.endDate).toLocaleDateString()}
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-2">Description</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{opportunity.description}</p>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-2">Requirements</h4>
          <ul className="list-disc list-inside text-gray-700">
            {opportunity.requirements.map((requirement, index) => (
              <li key={index}>{requirement}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleApply}
            disabled={opportunity.status === "CLOSED"}
          >
            {opportunity.status === "CLOSED" ? "Applications Closed" : "Apply Now"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OpportunityDetails; 