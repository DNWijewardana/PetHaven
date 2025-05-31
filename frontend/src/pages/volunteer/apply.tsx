import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import PageHeading from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ENV = import.meta.env.MODE;
const BASE_URL = ENV === "development" ? "http://localhost:4000" : import.meta.env.VITE_BASE_URL;

interface Opportunity {
  _id: string;
  title: string;
  organization: {
    name: string;
  };
}

const ApplyVolunteer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    motivation: "",
    availability: "",
    references: ""
  });

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
      setOpportunity(response.data);
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.name || "",
          email: user.email || ""
        }));
      }
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      toast.error("Failed to fetch opportunity");
      navigate("/volunteer");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!opportunity) return;

    const requiredFields = ["name", "email", "phone", "experience", "motivation", "availability"];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      await axios.post(`${BASE_URL}/api/v1/volunteer/applications`, {
        opportunityId: opportunity._id,
        ...formData
      });
      toast.success("Application submitted successfully");
      navigate(`/volunteer/opportunities/${id}`);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!opportunity) {
    return <div className="text-center py-8">Opportunity not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-20.3rem)] w-full p-4">
      <PageHeading pageName={`Apply for ${opportunity.title}`} />
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <Label htmlFor="experience">Relevant Experience *</Label>
            <Textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Describe your relevant experience"
              className="h-32"
            />
          </div>

          <div>
            <Label htmlFor="motivation">Motivation *</Label>
            <Textarea
              id="motivation"
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
              placeholder="Why do you want to volunteer for this opportunity?"
              className="h-32"
            />
          </div>

          <div>
            <Label htmlFor="availability">Availability *</Label>
            <Textarea
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              placeholder="What days/times are you available?"
              className="h-24"
            />
          </div>

          <div>
            <Label htmlFor="references">References (Optional)</Label>
            <Textarea
              id="references"
              name="references"
              value={formData.references}
              onChange={handleChange}
              placeholder="List any references with their contact information"
              className="h-24"
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/volunteer/opportunities/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit">Submit Application</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ApplyVolunteer; 