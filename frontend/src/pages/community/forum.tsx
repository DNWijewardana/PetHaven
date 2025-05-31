import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, Plus, Heart, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import PageHeading from "@/components/page-heading";
import { Post, PostCategory } from "@/types/post";

const ENV = import.meta.env.MODE;
const BASE_URL = ENV === "development" ? "http://localhost:4000" : import.meta.env.VITE_BASE_URL;

const CATEGORIES: { value: PostCategory; label: string }[] = [
  { value: "GENERAL", label: "General Discussion" },
  { value: "LOST_PETS", label: "Lost Pets" },
  { value: "FOUND_PETS", label: "Found Pets" },
  { value: "ADOPTION", label: "Pet Adoption" },
  { value: "VOLUNTEER", label: "Volunteer Opportunities" },
  { value: "HELP", label: "Help & Support" },
  { value: "SUCCESS_STORIES", label: "Success Stories" },
];

const CommunityForum = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | "ALL">("ALL");

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/v1/forum/posts${selectedCategory !== "ALL" ? `?category=${selectedCategory}` : ""}`);
      setPosts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleNewPost = () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }
    navigate("/community/new-post");
  };

  const handleLike = async (postId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    try {
      const likeResponse = await axios.post(`${BASE_URL}/api/v1/forum/posts/${postId}/like`, {
        user: {
          sub: user?.sub,
          name: user?.name,
          email: user?.email,
          picture: user?.picture
        }
      });
      
      // Update the post in the state with the updated data from the response
      setPosts(posts.map(post => 
        post._id === postId ? likeResponse.data : post
      ));
      
      // Check if the current user's email is in the likes array to determine if post was liked or unliked
      const userLiked = likeResponse.data.likes.some((like: Record<string, unknown>) => {
        if (typeof like === 'object' && like !== null && 'email' in like) {
          return like.email === user?.email;
        }
        return false;
      });
      
      toast.success(userLiked ? "Post liked!" : "Like removed");
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedByPopular = [...filteredPosts].sort((a, b) => 
    (b.likes?.length || 0) - (a.likes?.length || 0)
  );

  const unansweredPosts = filteredPosts.filter(post => 
    !post.comments || post.comments.length === 0
  );

  const renderPosts = (postsToRender: Post[]) => {
    if (postsToRender.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">No Posts Found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {postsToRender.map((post) => {
          // Check if user has liked this post
          const userHasLiked = post.likes?.some(like => {
            if (typeof like === 'object' && like !== null) {
              return 'email' in like && like.email === user?.email;
            }
            return false;
          });
          
          return (
            <Card 
              key={post._id} 
              className="p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/community/post/${post._id}`)}
            >
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={typeof post.author === 'object' ? post.author.picture : undefined} />
                  <AvatarFallback>
                    {typeof post.author === 'object' ? post.author.name?.charAt(0) || 'U' : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {typeof post.author === 'object' ? post.author.name || 'Anonymous' : 'Anonymous'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {CATEGORIES.find(cat => cat.value === post.category)?.label || post.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.content}</p>
                  
                  {post.images && post.images.length > 0 && (
                    <div className="mb-4">
                      <img
                        src={post.images[0]}
                        alt="Post image"
                        className="rounded-lg max-h-96 w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      {post.images.length > 1 && (
                        <p className="text-sm text-gray-500 mt-1">+{post.images.length - 1} more images</p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center gap-1 ${userHasLiked ? 'text-red-500' : ''}`}
                      onClick={(e) => handleLike(post._id, e)}
                    >
                      <Heart className={`w-4 h-4 ${userHasLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm">{post.likes?.length || 0}</span>
                    </Button>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">{post.comments?.length || 0} comments</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto w-full p-4 pt-12">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full p-4 pt-12 min-h-[calc(100vh-16rem)]">
      <div className="flex justify-between items-center mb-8">
        <PageHeading pageName="Community Forum" />
        <Button onClick={handleNewPost}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <Card className="p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search posts..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as PostCategory | "ALL")}
            className="px-3 py-2 border rounded-md"
          >
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <Tabs defaultValue="recent" className="w-full">
          <TabsList>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="mt-6">
            {renderPosts(filteredPosts)}
          </TabsContent>

          <TabsContent value="popular" className="mt-6">
            {renderPosts(sortedByPopular)}
          </TabsContent>

          <TabsContent value="unanswered" className="mt-6">
            {renderPosts(unansweredPosts)}
          </TabsContent>
        </Tabs>
      </Card>

      <Card className="p-6 bg-blue-50">
        <h2 className="text-xl font-semibold mb-4">Forum Guidelines</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Be respectful and kind to other community members</li>
          <li>Share accurate information about animal care</li>
          <li>Report any inappropriate or harmful content</li>
          <li>Do not share personal contact information publicly</li>
          <li>Use appropriate and descriptive titles for your posts</li>
        </ul>
      </Card>
    </div>
  );
};

export default CommunityForum; 