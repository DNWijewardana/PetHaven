import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";
import PageHeading from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Trash2, MessageCircle, Reply } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ENV = import.meta.env.MODE;
const BASE_URL = ENV === "development" ? "http://localhost:4000" : import.meta.env.VITE_BASE_URL;

interface Comment {
  _id: string;
  content: string;
  author: {
    name: string;
    email: string;
    picture: string;
  };
  replies: Reply[];
  createdAt: string;
}

interface Reply {
  _id: string;
  content: string;
  author: {
    name: string;
    email: string;
    picture: string;
  };
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  images?: string[];
  author: {
    name: string;
    email: string;
    picture: string;
  };
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

const PostDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/v1/forum/posts/${id}`);
      setPost(response.data);
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error("Failed to fetch post");
      navigate("/community");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated || user?.email !== post?.author.email) {
      return;
    }

    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/api/v1/forum/posts/${id}`);
      toast.success("Post deleted successfully");
      navigate("/community");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleComment = async () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setSubmittingComment(true);

    try {
      await axios.post(`${BASE_URL}/api/v1/forum/posts/${id}/comments`, {
        content: newComment.trim(),
        author: {
          name: user?.name,
          email: user?.email,
          picture: user?.picture
        }
      });
      
      setNewComment("");
      toast.success("Comment added successfully");
      fetchPost(); // Refresh post to show new comment
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReply = async (commentId: string) => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    if (!replyContent.trim()) {
      toast.error("Please write a reply");
      return;
    }

    setSubmittingReply(true);

    try {
      await axios.post(`${BASE_URL}/api/v1/forum/posts/${id}/comments/${commentId}/replies`, {
        content: replyContent.trim(),
        author: {
          name: user?.name,
          email: user?.email,
          picture: user?.picture
        }
      });
      
      setReplyContent("");
      setReplyingTo(null);
      toast.success("Reply added successfully");
      fetchPost(); // Refresh post to show new reply
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error("Failed to add reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!post) {
    return <div className="text-center py-8">Post not found</div>;
  }

  const isAuthor = isAuthenticated && user?.email === post.author.email;

  return (
    <div className="max-w-4xl mx-auto min-h-[calc(100vh-20.3rem)] w-full p-4 pt-12">
      <div className="flex justify-between items-center mb-8">
        <PageHeading pageName={post.title} />
        {isAuthor && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/community/edit/${post._id}`)}
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
            <AvatarImage src={post.author.picture} alt={post.author.name} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{post.author.name}</h3>
            <p className="text-sm text-gray-500">
              Posted on {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge variant="outline" className="ml-auto">
            {post.category.replace(/_/g, " ")}
          </Badge>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap">{post.content}</p>
          {post.images && post.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
              {post.images.map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`${post.title} - Image ${index + 1}`} 
                  className="mt-4 rounded-lg w-full object-cover"
                />
              ))}
            </div>
          ) : post.image ? (
            <img 
              src={post.image} 
              alt="Post attachment" 
              className="mt-4 rounded-lg max-h-96 w-auto"
            />
          ) : null}
        </div>

        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments ({post.comments.length})
          </h4>

          <div className="space-y-4 mb-6">
            {post.comments.map((comment) => (
              <div key={comment._id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3 mb-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.author.picture} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h5 className="font-semibold">{comment.author.name}</h5>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.content}</p>
                  </div>
                </div>

                {comment.replies.length > 0 && (
                  <div className="ml-8 space-y-3 mt-3">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="border-l-2 pl-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={reply.author.picture} alt={reply.author.name} />
                            <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-baseline gap-2">
                              <h6 className="font-semibold">{reply.author.name}</h6>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mt-1">{reply.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isAuthenticated && (
                  <div className="mt-2">
                    {replyingTo === comment._id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write your reply..."
                          rows={2}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReply(comment._id)}
                            disabled={submittingReply}
                          >
                            {submittingReply ? "Replying..." : "Reply"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setReplyingTo(comment._id)}
                      >
                        <Reply className="w-4 h-4 mr-1" />
                        Reply
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {isAuthenticated ? (
            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleComment}
                  disabled={submittingComment}
                >
                  {submittingComment ? "Posting..." : "Post Comment"}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => loginWithRedirect()}>
              Sign in to comment
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PostDetails; 