import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Category } from "@shared/schema";

interface FilterSidebarProps {
  onFiltersChange: (filters: {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
  }) => void;
}

export function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number | undefined>();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleApplyFilters = () => {
    onFiltersChange({
      categoryId: selectedCategory,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      rating: selectedRating,
    });
  };

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setMinPrice("");
    setMaxPrice("");
    setSelectedRating(undefined);
    onFiltersChange({});
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Categories</Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategory === category.id}
                  onCheckedChange={(checked) => {
                    setSelectedCategory(checked ? category.id : undefined);
                  }}
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Price Range</Label>
          <div className="flex space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Rating</Label>
          <RadioGroup
            value={selectedRating?.toString()}
            onValueChange={(value) => setSelectedRating(value ? parseInt(value) : undefined)}
          >
            {[5, 4, 3].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                <Label htmlFor={`rating-${rating}`} className="flex items-center cursor-pointer">
                  <div className="flex mr-1">
                    {renderStars(rating)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">& Up</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button onClick={handleApplyFilters} className="w-full">
            Apply Filters
          </Button>
          <Button onClick={handleClearFilters} variant="outline" className="w-full">
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
