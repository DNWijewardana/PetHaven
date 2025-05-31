import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Reply, Trash2 } from "lucide-react";
import { Post } from "@/types/post";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { API_ENDPOINTS } from '@/lib/constants';

const ENV = import.meta.env.MODE;
const BASE_URL = ENV === "development" ? "http://localhost:4000" : import.meta.env.VITE_BASE_URL;

interface ErrorResponse {
  message: string;
}

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ commentId: string; author: string } | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_ENDPOINTS.FORUM}/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load post');
        toast.error('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like posts');
      loginWithRedirect();
      return;
    }

    try {
      const response = await axios.post(`${API_ENDPOINTS.FORUM}/posts/${id}/like`, {
        userId: user?.sub
      });
      setPost(response.data);
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      loginWithRedirect();
      return;
    }

    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const response = await axios.post(`${API_ENDPOINTS.FORUM}/posts/${id}/comments`, {
        content: comment,
        author: {
          id: user?.sub,
          name: user?.name,
          picture: user?.picture
        }
      });
      setPost(response.data);
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to reply');
      loginWithRedirect();
      return;
    }

    if (!replyContent.trim() || !replyTo) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      const response = await axios.post(
        `${API_ENDPOINTS.FORUM}/posts/${id}/comments/${replyTo.commentId}/replies`,
        {
          content: replyContent,
          author: {
            id: user?.sub,
            name: user?.name,
            picture: user?.picture
          }
        }
      );
      setPost(response.data);
      setReplyContent('');
      setReplyTo(null);
      toast.success('Reply added successfully');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated || !post || typeof post.author === 'string' || user?.email !== post.author.email) {
      return;
    }

    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setDeleting(true);

    try {
      await axios.delete(`${BASE_URL}/api/v1/forum/posts/${id}`);
      toast.success("Post deleted successfully");
      navigate("/community");
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      console.error("Error deleting post:", axiosError);
      const errorMessage = axiosError.response?.data?.message || "Failed to delete post";
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const renderAuthor = (author: Post['author']) => {
    if (typeof author === 'string') {
      return {
        name: 'Anonymous',
        picture: undefined
      };
    }
    return {
      name: author.name || 'Anonymous',
      picture: author.picture
    };
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <p className="text-red-500">{error || 'Post not found'}</p>
        <Button onClick={() => navigate("/community")} className="mt-4">
          Back to Community
        </Button>
      </div>
    );
  }

  const postAuthor = renderAuthor(post.author);

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarImage src={postAuthor.picture} alt={postAuthor.name} />
              <AvatarFallback>{postAuthor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{postAuthor.name}</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <CardDescription>{post.category.replace('_', ' ')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{post.content}</p>
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${post.title} - Image ${index + 1}`}
                  className="w-full rounded-md"
                />
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mt-6">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleLike}
            >
              <Heart
                className={`w-5 h-5 ${
                  post.likes?.some((like) => like.email === user?.email)
                    ? 'fill-rose-500 text-rose-500'
                    : ''
                }`}
              />
              {post.likes?.length || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              {post.comments?.length || 0}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <form onSubmit={handleComment} className="w-full">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mb-2"
            />
            <Button type="submit" disabled={!comment.trim()}>
              Comment
            </Button>
          </form>

          <div className="mt-6 w-full">
            <h3 className="font-semibold mb-4">Comments</h3>
            {post.comments?.map((comment) => (
              <div key={comment._id} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.author.picture} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{comment.author.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <p className="ml-10 text-sm">{comment.content}</p>

                <div className="ml-10 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setReplyTo({ commentId: comment._id, author: comment.author.name })}
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </Button>

                  {replyTo?.commentId === comment._id && (
                    <form onSubmit={handleReply} className="mt-2">
                      <Textarea
                        placeholder={`Reply to ${replyTo.author}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="mb-2"
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={!replyContent.trim()}>
                          Send Reply
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setReplyTo(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}

                  {comment.replies?.map((reply) => (
                    <div key={reply._id} className="ml-6 mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={reply.author.picture} alt={reply.author.name} />
                          <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium">{reply.author.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <p className="ml-8 text-sm">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PostDetailPage; 