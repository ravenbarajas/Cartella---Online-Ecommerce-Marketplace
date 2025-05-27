import { Link } from "wouter";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductWithDetails } from "@shared/schema";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: ProductWithDetails;
  showAddToCart?: boolean;
}

export function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id);
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= numRating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group cursor-pointer hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.stock <= 10 && product.stock > 0 && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
              Low Stock
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
              Out of Stock
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          {product.seller && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              by {product.seller.name}
            </p>
          )}
          
          <div className="flex items-center mb-2">
            <div className="flex">
              {renderStars(product.rating || "0")}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              ({product.reviewCount} reviews)
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
              ${product.price}
            </span>
            
            {showAddToCart && product.stock > 0 && (
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
