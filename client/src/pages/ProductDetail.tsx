import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/ProductCard";
import { ProductWithDetails } from "@shared/schema";
import { Star, ShoppingCart, Heart, Share2, Minus, Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const productId = params?.id ? parseInt(params.id) : null;
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: product, isLoading, error } = useQuery<ProductWithDetails>({
    queryKey: ["/api/products", productId],
    queryFn: async () => {
      if (!productId) throw new Error("No product ID");
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error("Failed to fetch product");
      return response.json();
    },
    enabled: !!productId,
  });

  const { data: relatedProducts = [] } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products", { categoryId: product?.categoryId }],
    queryFn: async () => {
      if (!product?.categoryId) return [];
      const response = await fetch(`/api/products?categoryId=${product.categoryId}`);
      if (!response.ok) throw new Error("Failed to fetch related products");
      const products = await response.json();
      return products.filter((p: ProductWithDetails) => p.id !== product.id).slice(0, 4);
    },
    enabled: !!product?.categoryId,
  });

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, quantity);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${
            i <= numRating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-300 dark:bg-gray-700 h-96 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Product Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                The product you're looking for doesn't exist or has been removed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-xl"
              />
              {product.stock <= 10 && product.stock > 0 && (
                <Badge className="absolute top-4 left-4 bg-yellow-500 hover:bg-yellow-600">
                  Only {product.stock} left!
                </Badge>
              )}
              {product.stock === 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                  Out of Stock
                </Badge>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index
                        ? "border-primary-500"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.name}
              </h1>
              {product.seller && (
                <p className="text-gray-600 dark:text-gray-400">
                  Sold by <span className="font-medium">{product.seller.name}</span>
                </p>
              )}
              {product.category && (
                <Badge variant="secondary" className="mt-2">
                  {product.category.name}
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex">
                {renderStars(product.rating || "0")}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              ${product.price}
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Stock</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {product.stock > 0 ? `${product.stock} items available` : "Out of stock"}
              </p>
            </div>

            {product.stock > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={handleAddToCart} className="flex-1">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
