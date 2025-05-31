import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import PageHeading from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
}

const EditOpportunity = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [requirements, setRequirements] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"OPEN" | "CLOSED">("OPEN");

  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    fetchOpportunity();
  }, [isAuthenticated, id]);

  const fetchOpportunity = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/v1/volunteer/opportunities/${id}`);
      const opportunity = response.data;

      // Verify user has permission to edit
      if (user?.email !== opportunity.organization.email) {
        toast.error("You don't have permission to edit this opportunity");
        navigate("/volunteer");
        return;
      }

      setTitle(opportunity.title);
      setDescription(opportunity.description);
      setLocation(opportunity.location);
      setRequirements(opportunity.requirements.join('\n'));
      setStartDate(opportunity.startDate.split('T')[0]);
      setEndDate(opportunity.endDate.split('T')[0]);
      setStatus(opportunity.status);
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      toast.error("Failed to fetch opportunity");
      navigate("/volunteer");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !location.trim() || !requirements.trim() || !startDate || !endDate) {
      toast.error("Please fill in all fields");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setSubmitting(true);

    try {
      await axios.put(`${BASE_URL}/api/v1/volunteer/opportunities/${id}`, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        requirements: requirements.split('\n').map(req => req.trim()).filter(req => req),
        startDate,
        endDate,
        status
      });

      toast.success("Opportunity updated successfully!");
      navigate("/volunteer");
    } catch (error) {
      console.error("Error updating opportunity:", error);
      toast.error("Failed to update opportunity");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-20.3rem)] w-full p-4">
      <PageHeading pageName="Edit Opportunity" />
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title"
              maxLength={100}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the volunteer opportunity..."
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter the location"
              required
            />
          </div>

          <div>
            <Label htmlFor="requirements">Requirements (one per line)</Label>
            <Textarea
              id="requirements"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="List the requirements..."
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as "OPEN" | "CLOSED")}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/volunteer")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditOpportunity; 