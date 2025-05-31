import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { NavLink } from "react-router";
import axios from "axios";
import { API_ENDPOINTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ChevronLeft, 
  Star, 
  StarHalf, 
  ShoppingCart, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  category: string;
  petType: string;
  brand?: string;
  images: { url: string; alt: string }[];
  stockQuantity: number;
  inStock: boolean;
  ratings: {
    user: string;
    rating: number;
    review?: string;
    createdAt: string;
  }[];
  averageRating: number;
  numRatings: number;
  tags?: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  isUserListing?: boolean;
  seller?: {
    user: string;
    name: string;
    email: string;
    phone?: string;
    preferredContactMethod: string;
  };
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_ENDPOINTS.PRODUCTS}/${id}`);
        setProduct(data.product);
        
        // Fetch related products
        const relatedResponse = await axios.get(`${API_ENDPOINTS.PRODUCTS}/${id}/related`);
        setRelatedProducts(relatedResponse.data.products);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart", {
        action: {
          label: "Login",
          onClick: () => loginWithRedirect(),
        },
      });
      return;
    }

    if (!product) return;
    
    setAddingToCart(true);
    try {
      await axios.post(`${API_ENDPOINTS.CART}/add`, {
        productId: product._id,
        quantity
      });
      
      toast.success("Product added to cart successfully!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add product to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] px-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">{error || "The requested product could not be found."}</p>
        <NavLink to="/shop">
          <Button>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </NavLink>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <NavLink to="/shop" className="inline-flex items-center text-rose-500 hover:text-rose-700">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Shop
        </NavLink>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          <div className="mb-4 aspect-square overflow-hidden rounded-lg border">
            <img
              src={product.images[selectedImage]?.url || 'https://placehold.co/600x600?text=No+Image'}
              alt={product.images[selectedImage]?.alt || product.name}
              className="w-full h-full object-contain"
            />
          </div>
          
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded border cursor-pointer overflow-hidden ${
                    selectedImage === index ? 'border-rose-500 ring-2 ring-rose-200' : ''
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `${product.name} image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
          
          {/* Ratings */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {renderStars(product.averageRating)}
            </div>
            <span className="text-sm text-gray-600">
              ({product.numRatings} {product.numRatings === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            {product.discountPrice > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-500 line-through text-lg">${product.price.toFixed(2)}</span>
                <span className="text-2xl font-bold text-rose-500">${product.discountPrice.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
            )}
          </div>

          {/* Status */}
          <div className="mb-6">
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {product.inStock ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>

          {/* Add to Cart */}
          {product.inStock && (
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex border rounded-md">
                  <button
                    onClick={decrementQuantity}
                    className="px-3 py-1 border-r"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 py-1 min-w-[40px] text-center">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    className="px-3 py-1 border-l"
                    disabled={product && quantity >= product.stockQuantity}
                  >
                    +
                  </button>
                </div>
                <Button
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={addingToCart || !product.inStock}
                >
                  {addingToCart ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-4 w-4" />
                  )}
                  Add to Cart
                </Button>
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-3">Product Details</h2>
            <ul className="space-y-2">
              {product.brand && (
                <li className="flex justify-between">
                  <span className="text-gray-600">Brand:</span>
                  <span className="font-medium">{product.brand}</span>
                </li>
              )}
              <li className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{product.category.replace('_', ' ')}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Pet Type:</span>
                <span className="font-medium">{product.petType.replace('_', ' ')}</span>
              </li>
              {product.weight && (
                <li className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium">{product.weight} kg</span>
                </li>
              )}
              {product.dimensions && (
                <li className="flex justify-between">
                  <span className="text-gray-600">Dimensions:</span>
                  <span className="font-medium">
                    {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Seller Information - Only show for user listings */}
          {product.isUserListing && product.seller && (
            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold mb-3">Seller Information</h2>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span className="text-gray-600">Seller:</span>
                  <span className="font-medium">{product.seller.name}</span>
                </li>
                
                {product.seller.preferredContactMethod.includes('EMAIL') && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <a 
                      href={`mailto:${product.seller.email}`} 
                      className="font-medium text-rose-600 hover:underline"
                    >
                      {product.seller.email}
                    </a>
                  </li>
                )}
                
                {product.seller.phone && product.seller.preferredContactMethod.includes('PHONE') && (
                  <li className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <a 
                      href={`tel:${product.seller.phone}`} 
                      className="font-medium text-rose-600 hover:underline"
                    >
                      {product.seller.phone}
                    </a>
                  </li>
                )}
                
                <li className="flex justify-between">
                  <span className="text-gray-600">Preferred Contact:</span>
                  <span className="font-medium">
                    {product.seller.preferredContactMethod === 'EMAIL' ? 'Email' : 
                     product.seller.preferredContactMethod === 'PHONE' ? 'Phone' : 'Email or Phone'}
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>
        
        {product.ratings.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {product.ratings.map((rating, index) => (
              <div key={index} className="border-b pb-6 last:border-b-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {renderStars(rating.rating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {rating.review && <p className="text-gray-700">{rating.review}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((product) => (
              <Card key={product._id} className="overflow-hidden">
                <NavLink to={`/shop/product/${product._id}`}>
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={product.images[0]?.url || 'https://placehold.co/300x200?text=No+Image'}
                      alt={product.images[0]?.alt || product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {product.discountPrice > 0 && (
                      <div className="absolute top-2 right-2 bg-rose-500 text-white py-1 px-2 rounded-full text-xs font-bold">
                        SALE
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <div className="flex items-center mt-1 mb-2">
                      {renderStars(product.averageRating)}
                      <span className="text-xs text-gray-500 ml-1">({product.numRatings})</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        {product.discountPrice > 0 ? (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 line-through text-xs">${product.price.toFixed(2)}</span>
                            <span className="font-bold text-rose-500">${product.discountPrice.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="font-bold">${product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </NavLink>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 