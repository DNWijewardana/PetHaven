import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PostCategory } from '@/types/post';
import { API_ENDPOINTS } from '@/lib/constants';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { value: 'GENERAL', label: 'General Discussion', icon: '💬' },
  { value: 'LOST_PETS', label: 'Lost Pets', icon: '🔍' },
  { value: 'FOUND_PETS', label: 'Found Pets', icon: '🏠' },
  { value: 'ADOPTION', label: 'Pet Adoption', icon: '❤️' },
  { value: 'VOLUNTEER', label: 'Volunteer Opportunities', icon: '🤝' },
  { value: 'HELP', label: 'Help & Support', icon: '🆘' },
  { value: 'SUCCESS_STORIES', label: 'Success Stories', icon: '🌟' },
];

export default function NewPost() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL' as PostCategory,
  });
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('write');
  const [focusedField, setFocusedField] = useState<'title' | 'content' | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to create a post');
      loginWithRedirect();
    }
  }, [isAuthenticated, loginWithRedirect]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated || !user) {
      toast.error('Please log in to create a post');
      loginWithRedirect();
      return;
    }

    if (formData.title.trim() === '') {
      setError('Please enter a title for your post');
      return;
    }

    if (formData.content.trim() === '') {
      setError('Please enter content for your post');
      return;
    }

    try {
      setIsLoading(true);
      
      const postData = {
        ...formData,
        author: {
          name: user.name,
          email: user.email,
          picture: user.picture
        }
      };

      const response = await axios.post(API_ENDPOINTS.POSTS, postData);
      toast.success('Post created successfully!');
      navigate(`/community/post/${response.data._id}`);
    } catch (error) {
      console.error('Error creating post:', error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Failed to create post');
      } else {
        setError('Failed to create post');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container max-w-2xl mx-auto pt-12 pb-16 px-4 sm:px-6 lg:px-8 flex justify-center">
      <Card className="shadow-lg border border-border/30 overflow-hidden rounded-xl w-full">
        <CardHeader className="space-y-0 px-6 pb-0 pt-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarImage src={user?.picture} alt={user?.name || 'User'} />
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-xl font-semibold">Create a Post</h3>
              <p className="text-sm text-muted-foreground">{user?.name}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-6 pt-6">
          <Tabs 
            defaultValue="write" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="write" className="rounded-full">Write</TabsTrigger>
              <TabsTrigger value="preview" className="rounded-full">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="write" className="mt-0 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <div 
                    className={cn(
                      "relative rounded-lg border p-3 transition-all",
                      focusedField === 'title' && "ring-2 ring-primary ring-offset-1"
                    )}
                  >
                    <label className="text-xs font-medium text-muted-foreground absolute -top-2.5 left-3 bg-background px-1">Title</label>
                    <Input
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="What's your post about?"
                      className="border-none px-0 py-0 h-auto text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                      onFocus={() => setFocusedField('title')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div 
                    className={cn(
                      "relative rounded-lg border p-3 transition-all",
                      focusedField === 'content' && "ring-2 ring-primary ring-offset-1"
                    )}
                  >
                    <label className="text-xs font-medium text-muted-foreground absolute -top-2.5 left-3 bg-background px-1">Content</label>
                    <Textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="What's on your mind?"
                      className="border-none px-0 py-0 min-h-[200px] resize-y focus-visible:ring-0 focus-visible:ring-offset-0"
                      onFocus={() => setFocusedField('content')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block mb-2">Category</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: PostCategory) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="w-full rounded-lg">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem 
                          key={category.value} 
                          value={category.value}
                        >
                          <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <div className="bg-background rounded-lg border p-6 min-h-[400px]">
                {formData.title ? (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar>
                        <AvatarImage src={user?.picture || ''} alt={user?.name || ''} />
                        <AvatarFallback>{user?.name?.charAt(0) || ''}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>Just now</span>
                          <span>•</span>
                          <span>
                            {CATEGORIES.find(cat => cat.value === formData.category)?.icon}{' '}
                            {CATEGORIES.find(cat => cat.value === formData.category)?.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h1 className="text-2xl font-bold mb-2">{formData.title}</h1>
                    
                    <div className="prose max-w-none dark:prose-invert mb-6">
                      {formData.content.split('\n').map((paragraph, idx) => (
                        <p key={idx} className={paragraph.trim() === '' ? 'h-4' : ''}>{paragraph}</p>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-6 text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-primary">
                        <span>0</span> Likes
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary">
                        <span>0</span> Comments
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                    <p>Fill in the form to see a preview of your post</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="px-6 py-4 border-t flex justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/community')}
            className="rounded-full w-32"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="rounded-full w-32"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Post'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 