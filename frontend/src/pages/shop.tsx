import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, Link } from "react-router-dom";
import { NavLink } from "react-router";
import PageHeading from "@/components/page-heading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS } from "@/lib/constants";
import { Loader2, Search, ShoppingBag, Plus, Trash2 } from "lucide-react";
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
  images: { url: string; alt: string }[];
  stockQuantity: number;
  inStock: boolean;
  averageRating: number;
}

interface ProductsResponse {
  success: boolean;
  products: Product[];
  totalProducts: number;
  totalPages: number;
  currentPage: number;
}

export default function Shop() {
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [petType, setPetType] = useState(searchParams.get("petType") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");

  // Add isAdmin check function
  const isAdmin = user && user.email === "sanuka23thamudithaalles@gmail.com" || user && user.email === "dimalkanavod.yt@gmail.com" || user && user.email === "ruwanthacbandara@gmail.com";

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", "12");

      if (category) params.append("category", category);
      if (petType) params.append("petType", petType);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      if (search) params.append("search", search);
      if (inStock) params.append("inStock", "true");

      const response = await axios.get<ProductsResponse>(
        `${API_ENDPOINTS.PRODUCTS}?${params.toString()}`
      );

      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Update URL parameters
    const params = new URLSearchParams();
    if (currentPage > 1) params.append("page", currentPage.toString());
    if (category) params.append("category", category);
    if (petType) params.append("petType", petType);
    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    if (search) params.append("search", search);
    if (inStock) params.append("inStock", "true");
    
    setSearchParams(params);
  }, [currentPage, category, petType, minPrice, maxPrice, inStock, search]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setCategory("");
    setPetType("");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    setInStock(false);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCreateListing = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to create a product listing", {
        action: {
          label: "Login",
          onClick: () => loginWithRedirect(),
        },
      });
      return;
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!isAuthenticated || !isAdmin) {
      toast.error("You don't have permission to delete products");
      return;
    }

    try {
      await axios.delete(`${API_ENDPOINTS.PRODUCTS}/${productId}`, {
        data: { user: { ...user, isAdmin } }
      });
      
      toast.success("Product deleted successfully");
      fetchProducts(); // Refresh the products list
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product. Please try again later.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeading 
          pageName="Pet Shop" 
          description="Find high-quality pet products for your furry friends. From food to toys and accessories."
        />
        <Link to="/shop/create-listing">
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            Create Listing
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Filters Section */}
        <Card className="p-4 col-span-1">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="FOOD">Food</SelectItem>
                  <SelectItem value="TOYS">Toys</SelectItem>
                  <SelectItem value="ACCESSORIES">Accessories</SelectItem>
                  <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                  <SelectItem value="GROOMING">Grooming</SelectItem>
                  <SelectItem value="BEDS">Beds & Furniture</SelectItem>
                  <SelectItem value="TRAINING">Training</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Pet Type</label>
              <Select value={petType} onValueChange={setPetType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Pets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pets</SelectItem>
                  <SelectItem value="DOG">Dogs</SelectItem>
                  <SelectItem value="CAT">Cats</SelectItem>
                  <SelectItem value="BIRD">Birds</SelectItem>
                  <SelectItem value="FISH">Fish</SelectItem>
                  <SelectItem value="SMALL_ANIMAL">Small Animals</SelectItem>
                  <SelectItem value="REPTILE">Reptiles</SelectItem>
                  <SelectItem value="ALL">Universal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Min Price</label>
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Price</label>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="inStock"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="inStock" className="text-sm font-medium">In Stock Only</label>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleApplyFilters}
                className="flex-1"
              >
                Apply Filters
              </Button>
              <Button 
                variant="outline"
                onClick={handleResetFilters}
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Products Grid */}
        <div className="col-span-1 md:col-span-3">
          {loading ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No products found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
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
                    </NavLink>
                    <div className="p-4">
                      <NavLink to={`/shop/product/${product._id}`}>
                        <h3 className="font-semibold truncate">{product.name}</h3>
                      </NavLink>
                      <p className="text-sm text-gray-500 line-clamp-2 h-10">{product.description}</p>
                      
                      <div className="mt-2 flex justify-between items-center">
                        <div>
                          {product.discountPrice > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 line-through text-sm">${product.price.toFixed(2)}</span>
                              <span className="font-bold text-rose-500">${product.discountPrice.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span className="font-bold">${product.price.toFixed(2)}</span>
                          )}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <NavLink to={`/shop/product/${product._id}`} className="flex-1">
                          <Button 
                            className="w-full"
                            variant={product.inStock ? "default" : "outline"}
                          >
                            View Details
                          </Button>
                        </NavLink>
                        
                        {user && isAdmin && (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteProduct(product._id);
                            }}
                            title="Delete Product"
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 