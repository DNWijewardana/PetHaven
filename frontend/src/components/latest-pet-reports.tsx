import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';
import { Post } from '@/types/post';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function LatestPetReports() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestPets = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_ENDPOINTS.PETS}/latest`);
        setPosts(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching latest pets:', error);
        setError('Failed to load latest pet reports');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPets();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No pet reports available</p>
      </div>
    );
  }

  const getAuthorInfo = (post: Post) => {
    if (!post.author || typeof post.author === 'string') {
      return {
        name: 'Anonymous',
        picture: undefined,
        initial: 'A'
      };
    }
    return {
      name: post.author.name || 'Anonymous',
      picture: post.author.picture,
      initial: (post.author.name?.[0] || 'A').toUpperCase()
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {posts.map((post) => {
        const author = getAuthorInfo(post);
        return (
          <Card key={post._id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Avatar>
                  <AvatarImage src={author.picture} alt={author.name} />
                  <AvatarFallback>{author.initial}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{author.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <CardTitle className="text-lg">{post.title}</CardTitle>
              <CardDescription>{post.category.replace(/_/g, ' ')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-3">{post.content}</p>
              {Array.isArray(post.images) && post.images.length > 0 && (
                <img
                  src={post.images[0]}
                  alt={post.title}
                  className="w-full h-48 object-cover mt-2 rounded-md"
                />
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/community/post/${post._id}`)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
