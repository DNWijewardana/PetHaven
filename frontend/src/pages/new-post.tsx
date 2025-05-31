import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const ENV = import.meta.env.MODE;
const BASE_URL = ENV === "development" ? "http://localhost:4000" : import.meta.env.VITE_BASE_URL;

const CATEGORIES = [
  { value: "GENERAL", label: "General Discussion" },
  { value: "LOST_PETS", label: "Lost Pets" },
  { value: "FOUND_PETS", label: "Found Pets" },
  { value: "ADOPTION", label: "Pet Adoption" },
  { value: "VOLUNTEER", label: "Volunteer Opportunities" },
  { value: "HELP", label: "Help & Support" },
  { value: "SUCCESS_STORIES", label: "Success Stories" }
];

const NewPostPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth0();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [file, setFile] = useState<File>();
  const [image, setImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to create a post");
      return;
    }

    if (!title || !content || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        title,
        content,
        category,
        images: image ? [image] : [],
        author: {
          name: user.name,
          email: user.email,
          picture: user.picture
        }
      };

      await axios.post(`${BASE_URL}/api/v1/forum/posts`, postData);
      toast.success("Post created successfully!");
      navigate("/community");
    } catch (error: any) {
      console.error("Error creating post:", error);
      const errorMessage = error.response?.data?.message || "Failed to create post";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto min-h-[calc(100vh-20.3rem)] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
        <p>You need to be logged in to create a post.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto min-h-[calc(100vh-20.3rem)] flex flex-col w-full">
      <PageHeading pageName="Create New Post" />
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
              } catch (error: any) {
                console.error("Image upload error:", error);
                const errorMessage = error.response?.data?.message || "Failed to upload image";
                toast.error(errorMessage);
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
            <Label className="text-xl">Category</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <Label className="text-xl">Title</Label>
          <Input
            type="text"
            className="mb-2"
            placeholder="Enter post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Label className="text-xl">Content</Label>
          <Textarea
            placeholder="Write your post content here... Use @username to mention someone"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mb-4"
            rows={6}
            required
          />

          <Button
            type="button"
            disabled={!title || !content || !category || isSubmitting || isUploadingImage}
            variant="default"
            className="w-full"
            onClick={handleSubmit}
          >
            {isSubmitting ? "Creating Post..." : "Create Post"}
          </Button>
        </Card>
      </form>
    </div>
  );
};

export default NewPostPage; 