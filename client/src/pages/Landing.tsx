import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ProductWithDetails } from "@shared/schema";
import { ArrowRight, Shield, Truck, HeartHandshake } from "lucide-react";

export default function Landing() {
  const { data: featuredProducts = [], isLoading } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/products/featured"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Discover Amazing Products on{" "}
                <span className="text-orange-400">Cartella</span>
              </h1>
              <p className="text-xl mb-8 text-primary-100">
                Your trusted marketplace for quality products from verified sellers worldwide.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/marketplace">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                    Explore Marketplace
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                    Become a Seller
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white bg-opacity-10 rounded-2xl p-8 backdrop-blur-sm">
                <img
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                  alt="Modern shopping experience"
                  className="rounded-xl shadow-2xl w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-full p-4 mb-4">
                <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Secure Shopping
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your transactions are protected with bank-level security
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-full p-4 mb-4">
                <Truck className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Quick and reliable shipping from trusted sellers
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-full p-4 mb-4">
                <HeartHandshake className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Quality Guarantee
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Only verified sellers with quality products
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover our most popular items, carefully selected for quality and value.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/marketplace">
              <Button size="lg" variant="outline">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of sellers and start your online business today.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
