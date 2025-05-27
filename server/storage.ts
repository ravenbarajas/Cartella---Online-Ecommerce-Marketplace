import {
  users,
  categories,
  products,
  cartItems,
  orders,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type ProductWithDetails,
  type CartItem,
  type InsertCartItem,
  type CartItemWithProduct,
  type Order,
  type InsertOrder,
  type OrderWithDetails,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Products
  getProducts(filters?: { categoryId?: number; sellerId?: number; search?: string }): Promise<ProductWithDetails[]>;
  getProduct(id: number): Promise<ProductWithDetails | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getFeaturedProducts(): Promise<ProductWithDetails[]>;
  getSellerProducts(sellerId: number): Promise<ProductWithDetails[]>;

  // Cart
  getCartItems(userId: number): Promise<CartItemWithProduct[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;

  // Orders
  getOrders(userId: number, role: 'buyer' | 'seller'): Promise<OrderWithDetails[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentProductId: number;
  private currentCartItemId: number;
  private currentOrderId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    this.currentOrderId = 1;

    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categoryData = [
      { name: "Electronics", slug: "electronics" },
      { name: "Fashion", slug: "fashion" },
      { name: "Home & Garden", slug: "home-garden" },
      { name: "Sports & Outdoors", slug: "sports" },
    ];

    categoryData.forEach(cat => {
      const category: Category = { id: this.currentCategoryId++, ...cat };
      this.categories.set(category.id, category);
    });

    // Seed users
    const userData = [
      {
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        name: "John Doe",
        role: "seller",
        avatar: null,
        createdAt: new Date(),
      },
      {
        username: "janedoe",
        email: "jane@example.com",
        password: "password123",
        name: "Jane Doe",
        role: "buyer",
        avatar: null,
        createdAt: new Date(),
      },
    ];

    userData.forEach(user => {
      const newUser: User = { 
        id: this.currentUserId++, 
        ...user,
        avatar: user.avatar || null,
        createdAt: user.createdAt || new Date()
      };
      this.users.set(newUser.id, newUser);
    });

    // Seed products
    const productData = [
      {
        name: "Premium Wireless Earbuds",
        description: "High-quality wireless earbuds with noise cancellation and long battery life.",
        price: "129.99",
        image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        images: ["https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        categoryId: 1,
        sellerId: 1,
        stock: 45,
        rating: "4.8",
        reviewCount: 234,
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Ultra-thin Laptop",
        description: "Powerful ultra-thin laptop perfect for work and entertainment.",
        price: "999.99",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        categoryId: 1,
        sellerId: 1,
        stock: 12,
        rating: "4.5",
        reviewCount: 89,
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Luxury Smart Watch",
        description: "Premium smart watch with health tracking and long-lasting battery.",
        price: "299.99",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        categoryId: 1,
        sellerId: 1,
        stock: 28,
        rating: "4.9",
        reviewCount: 156,
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Designer Backpack",
        description: "Stylish and functional backpack perfect for everyday use.",
        price: "89.99",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        categoryId: 2,
        sellerId: 1,
        stock: 67,
        rating: "4.7",
        reviewCount: 43,
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Premium Smartphone",
        description: "Latest flagship smartphone with advanced camera and processing power.",
        price: "699.99",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        categoryId: 1,
        sellerId: 1,
        stock: 23,
        rating: "4.6",
        reviewCount: 189,
        isActive: true,
        createdAt: new Date(),
      },
      {
        name: "Professional Headphones",
        description: "Studio-quality headphones for professional audio work.",
        price: "149.99",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"],
        categoryId: 1,
        sellerId: 1,
        stock: 34,
        rating: "4.4",
        reviewCount: 67,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    productData.forEach(product => {
      const newProduct: Product = { id: this.currentProductId++, ...product };
      this.products.set(newProduct.id, newProduct);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || "buyer",
      avatar: insertUser.avatar || null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Products
  async getProducts(filters?: { categoryId?: number; sellerId?: number; search?: string }): Promise<ProductWithDetails[]> {
    let products = Array.from(this.products.values()).filter(p => p.isActive);
    
    if (filters?.categoryId) {
      products = products.filter(p => p.categoryId === filters.categoryId);
    }
    
    if (filters?.sellerId) {
      products = products.filter(p => p.sellerId === filters.sellerId);
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.description.toLowerCase().includes(search)
      );
    }

    return this.enrichProducts(products);
  }

  async getProduct(id: number): Promise<ProductWithDetails | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const enriched = await this.enrichProducts([product]);
    return enriched[0];
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      categoryId: insertProduct.categoryId || null,
      images: insertProduct.images || null,
      stock: insertProduct.stock || 0,
      isActive: insertProduct.isActive || true,
      rating: "0",
      reviewCount: 0,
      createdAt: new Date() 
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getFeaturedProducts(): Promise<ProductWithDetails[]> {
    const products = Array.from(this.products.values())
      .filter(p => p.isActive)
      .sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"))
      .slice(0, 4);
    
    return this.enrichProducts(products);
  }

  async getSellerProducts(sellerId: number): Promise<ProductWithDetails[]> {
    const products = Array.from(this.products.values()).filter(p => p.sellerId === sellerId);
    return this.enrichProducts(products);
  }

  private async enrichProducts(products: Product[]): Promise<ProductWithDetails[]> {
    return products.map(product => ({
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) : undefined,
      seller: product.sellerId ? (() => {
        const seller = this.users.get(product.sellerId);
        return seller ? { id: seller.id, name: seller.name, username: seller.username } : undefined;
      })() : undefined,
    }));
  }

  // Cart
  async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values()).filter(item => item.userId === userId);
    
    const enrichedItems: CartItemWithProduct[] = [];
    for (const item of items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        enrichedItems.push({ ...item, product });
      }
    }
    
    return enrichedItems;
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId
    );
    
    if (existingItem) {
      // Update quantity
      const updatedItem = { ...existingItem, quantity: existingItem.quantity + (insertCartItem.quantity || 1) };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }
    
    const id = this.currentCartItemId++;
    const cartItem: CartItem = { 
      ...insertCartItem, 
      id,
      quantity: insertCartItem.quantity || 1,
      createdAt: new Date() 
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;
    
    if (quantity <= 0) {
      this.cartItems.delete(id);
      return undefined;
    }
    
    const updatedItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const userItems = Array.from(this.cartItems.entries()).filter(([_, item]) => item.userId === userId);
    userItems.forEach(([id, _]) => this.cartItems.delete(id));
    return true;
  }

  // Orders
  async getOrders(userId: number, role: 'buyer' | 'seller'): Promise<OrderWithDetails[]> {
    const orders = Array.from(this.orders.values()).filter(order => 
      role === 'buyer' ? order.buyerId === userId : order.sellerId === userId
    );
    
    const enrichedOrders: OrderWithDetails[] = [];
    for (const order of orders) {
      const product = await this.getProduct(order.productId);
      const buyer = await this.getUser(order.buyerId);
      const seller = await this.getUser(order.sellerId);
      
      if (product && buyer && seller) {
        enrichedOrders.push({
          ...order,
          product,
          buyer: { id: buyer.id, name: buyer.name, username: buyer.username, email: buyer.email },
          seller: { id: seller.id, name: seller.name, username: seller.username, email: seller.email },
        });
      }
    }
    
    return enrichedOrders;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { 
      ...insertOrder, 
      id,
      status: insertOrder.status || "pending",
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();
