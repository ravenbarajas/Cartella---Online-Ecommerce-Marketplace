import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductWithDetails, Category, OrderWithDetails } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    categoryId: "",
    stock: "",
  });

  // Queries
  const { data: sellerProducts = [] } = useQuery<ProductWithDetails[]>({
    queryKey: ["/api/sellers", user?.id, "products"],
    enabled: !!user && user.role === "seller",
  });

  const { data: orders = [] } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const response = await fetch(`/api/orders/${user.id}?role=${user.role}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
    enabled: !!user,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      return apiRequest("POST", "/api/products", {
        ...productData,
        sellerId: user?.id,
        categoryId: parseInt(productData.categoryId),
        stock: parseInt(productData.stock),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sellers", user?.id, "products"] });
      setShowProductForm(false);
      resetProductForm();
      toast({ title: "Product created successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/products/${id}`, {
        ...data,
        categoryId: parseInt(data.categoryId),
        stock: parseInt(data.stock),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sellers", user?.id, "products"] });
      setShowProductForm(false);
      setEditingProduct(null);
      resetProductForm();
      toast({ title: "Product updated successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      return apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sellers", user?.id, "products"] });
      toast({ title: "Product deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    },
  });

  // Stats calculations
  const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  const totalProducts = sellerProducts.length;
  const monthlyOrders = orders.filter(
    (order) =>
      new Date(order.createdAt).getMonth() === new Date().getMonth() &&
      new Date(order.createdAt).getFullYear() === new Date().getFullYear()
  ).length;

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      image: "",
      categoryId: "",
      stock: "",
    });
  };

  const handleEditProduct = (product: ProductWithDetails) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      categoryId: product.categoryId?.toString() || "",
      stock: product.stock.toString(),
    });
    setShowProductForm(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data: productForm });
    } else {
      createProductMutation.mutate(productForm);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Please Sign In
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                You need to be signed in to access your dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user.role === "seller" ? "Seller Dashboard" : "Buyer Dashboard"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {user.name}!
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {user.role === "seller" && <TabsTrigger value="products">Products</TabsTrigger>}
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {user.role === "seller" && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        <TrendingUp className="inline h-3 w-3 mr-1" />
                        +10.1% from last month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Products Listed</CardTitle>
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{totalProducts}</div>
                      <p className="text-xs text-muted-foreground">
                        Active listings
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {user.role === "seller" ? "Orders This Month" : "Orders Placed"}
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{monthlyOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    {user.role === "seller" ? "This month" : "Total orders"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center space-x-4">
                      <img
                        src={order.product.image}
                        alt={order.product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {order.product.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.role === "seller" ? `From ${order.buyer.name}` : `Sold by ${order.seller.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.totalAmount}</p>
                      <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {user.role === "seller" && (
            <TabsContent value="products" className="space-y-6">
              {/* Header with Add Product Button */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Products
                </h2>
                <Dialog open={showProductForm} onOpenChange={setShowProductForm}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { resetProductForm(); setEditingProduct(null); }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitProduct} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">Price ($)</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="stock">Stock</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={productForm.stock}
                            onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={productForm.categoryId}
                          onValueChange={(value) => setProductForm(prev => ({ ...prev, categoryId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="image">Image URL</Label>
                        <Input
                          id="image"
                          type="url"
                          value={productForm.image}
                          onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                          placeholder="https://example.com/image.jpg"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowProductForm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createProductMutation.isPending || updateProductMutation.isPending}
                        >
                          {editingProduct ? "Update" : "Create"} Product
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sellerProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ${product.price} • Stock: {product.stock}
                            </p>
                            <Badge variant={product.isActive ? "default" : "secondary"}>
                              {product.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.role === "seller" ? "Sales Orders" : "My Orders"}
            </h2>
            <Card>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={order.product.image}
                          alt={order.product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {order.product.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.role === "seller" ? `Ordered by ${order.buyer.name}` : `Sold by ${order.seller.name}`}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quantity: {order.quantity} • Total: ${order.totalAmount}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Profile Settings
            </h2>
            <Card>
              <CardContent className="py-6">
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={user.name} readOnly />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user.email} readOnly />
                  </div>
                  <div>
                    <Label>Username</Label>
                    <Input value={user.username} readOnly />
                  </div>
                  <div>
                    <Label>Account Type</Label>
                    <Input value={user.role} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
