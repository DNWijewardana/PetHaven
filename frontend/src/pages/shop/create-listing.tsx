import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { API_ENDPOINTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define product categories and pet types
const PRODUCT_CATEGORIES = [
  { value: "FOOD", label: "Pet Food" },
  { value: "TOYS", label: "Toys" },
  { value: "ACCESSORIES", label: "Accessories" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "GROOMING", label: "Grooming" },
  { value: "BEDS", label: "Beds & Furniture" },
  { value: "TRAINING", label: "Training Equipment" },
  { value: "OTHER", label: "Other" },
];

const PET_TYPES = [
  { value: "DOG", label: "Dogs" },
  { value: "CAT", label: "Cats" },
  { value: "BIRD", label: "Birds" },
  { value: "FISH", label: "Fish" },
  { value: "SMALL_ANIMAL", label: "Small Animals" },
  { value: "REPTILE", label: "Reptiles" },
  { value: "ALL", label: "All Pets" },
];

const CONTACT_METHODS = [
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone" },
  { value: "BOTH", label: "Both Email & Phone" },
];

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters").max(100),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  discountPrice: z.number().min(0, "Discount price cannot be negative").optional(),
  category: z.string(),
  petType: z.string(),
  brand: z.string().optional(),
  stockQuantity: z.number().min(1, "Stock quantity must be at least 1"),
  // Seller information
  sellerName: z.string().min(2, "Your name is required"),
  sellerEmail: z.string().email("Please enter a valid email"),
  sellerPhone: z.string().optional(),
  preferredContactMethod: z.string(),
});

export default function CreateListing() {
  const { isAuthenticated, user, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const [uploadedImages, setUploadedImages] = useState<{url: string, alt: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      discountPrice: 0,
      category: "",
      petType: "",
      brand: "",
      stockQuantity: 1,
      sellerName: user?.name || "",
      sellerEmail: user?.email || "",
      sellerPhone: "",
      preferredContactMethod: "EMAIL",
    },
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className="max-w-3xl mx-auto my-8">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            You need to be logged in to create a product listing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => loginWithRedirect()}>Log In</Button>
        </CardContent>
      </Card>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const response = await axios.post(`${API_ENDPOINTS.UPLOAD}/multiple`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedImageUrls = response.data.urls.map((url: string) => ({
        url,
        alt: "Product image",
      }));

      setUploadedImages([...uploadedImages, ...uploadedImageUrls]);
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...uploadedImages];
    updatedImages.splice(index, 1);
    setUploadedImages(updatedImages);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        discountPrice: values.discountPrice || 0,
        category: values.category,
        petType: values.petType,
        brand: values.brand || undefined,
        stockQuantity: values.stockQuantity,
        inStock: values.stockQuantity > 0,
        images: uploadedImages,
        isUserListing: true,
        seller: {
          name: values.sellerName,
          email: values.sellerEmail,
          phone: values.sellerPhone || undefined,
          preferredContactMethod: values.preferredContactMethod,
          user: user?.sub
        },
        user: {
          sub: user?.sub,
          email: user?.email,
          name: user?.name,
          picture: user?.picture
        }
      };

      console.log("Sending product data:", productData);
      const response = await axios.post(API_ENDPOINTS.PRODUCTS, productData);
      toast.success("Product listing created successfully!");
      navigate(`/shop/product/${response.data.product._id}`);
    } catch (error: any) {
      console.error("Error creating product:", error);
      const errorMessage = error.response?.data?.message || "Failed to create product listing";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create a Product Listing</CardTitle>
            <CardDescription>
              Fill in the details below to list your pet product for sale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter product name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Category and Pet Type */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRODUCT_CATEGORIES.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="petType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pet Type*</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select pet type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PET_TYPES.map((petType) => (
                              <SelectItem
                                key={petType.value}
                                value={petType.value}
                              >
                                {petType.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price and Discount */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (LKR)*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Price (LKR)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Optional discount price</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Brand and Stock */}
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="Brand name (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Product Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description*</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your product in detail..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload */}
                <div className="space-y-2">
                  <FormLabel>Product Images*</FormLabel>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Input
                      type="file"
                      className="hidden"
                      id="image-upload"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
                      ) : (
                        <Upload className="h-8 w-8 text-gray-400" />
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        Click to upload product images
                      </p>
                      <p className="text-xs text-gray-400">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </label>
                  </div>

                  {/* Display uploaded images */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">
                        Uploaded Images:
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image.url}
                              alt={`Product image ${index + 1}`}
                              className="rounded-md h-24 w-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                              onClick={() => removeImage(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Seller Information Section */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-medium mb-4">Seller Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sellerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sellerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email*</FormLabel>
                          <FormControl>
                            <Input placeholder="Your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sellerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number (optional)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredContactMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Contact Method*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select contact method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CONTACT_METHODS.map((method) => (
                                <SelectItem
                                  key={method.value}
                                  value={method.value}
                                >
                                  {method.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={isSubmitting || isUploading}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Listing...
                      </>
                    ) : (
                      "Create Listing"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 