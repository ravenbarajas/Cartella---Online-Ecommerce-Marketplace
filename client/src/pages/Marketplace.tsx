import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/ProductCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ProductWithDetails } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Marketplace() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  // Parse URL params for initial filters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initialFilters: any = {};
    
    if (searchParams.get("search")) {
      initialFilters.search = searchParams.get("search");
    }
    if (searchParams.get("category")) {
      // You would need to map category slugs to IDs here
      initialFilters.categoryId = searchParams.get("category");
    }
    
    setFilters(initialFilters);
  }, [location]);

  const { data: products = [], isLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products", filters],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (filters.categoryId) searchParams.append("categoryId", filters.categoryId.toString());
      if (filters.search) searchParams.append("search", filters.search);
      
      const response = await fetch(`/api/products?${searchParams}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  // Filter products by additional criteria (price, rating)
  const filteredProducts = products.filter(product => {
    if (filters.minPrice && parseFloat(product.price) < filters.minPrice) return false;
    if (filters.maxPrice && parseFloat(product.price) > filters.maxPrice) return false;
    if (filters.rating && parseFloat(product.rating || "0") < filters.rating) return false;
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "rating":
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      default:
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + productsPerPage);

  const handleFiltersChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar onFiltersChange={handleFiltersChange} />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  All Products
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {sortedProducts.length} products found
                </p>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-t-xl"></div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-b-xl">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-12">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            onClick={() => setCurrentPage(page)}
                            className="w-10"
                          >
                            {page}
                          </Button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No products found matching your criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
