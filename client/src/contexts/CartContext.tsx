import { createContext, useContext, useState, ReactNode } from "react";
import { CartItemWithProduct } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  cartItems: CartItemWithProduct[];
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartItem: (id: number, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!user) {
      toast({ title: "Please login to add items to cart", variant: "destructive" });
      return;
    }

    try {
      await apiRequest("POST", "/api/cart", {
        userId: user.id,
        productId,
        quantity,
      });

      // Invalidate cart query
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user.id] });
      
      toast({ title: "Product added to cart!" });
    } catch (error) {
      toast({ title: "Failed to add product to cart", variant: "destructive" });
    }
  };

  const updateCartItem = async (id: number, quantity: number) => {
    try {
      await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user?.id] });
    } catch (error) {
      toast({ title: "Failed to update cart item", variant: "destructive" });
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      await apiRequest("DELETE", `/api/cart/${id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user?.id] });
      toast({ title: "Item removed from cart" });
    } catch (error) {
      toast({ title: "Failed to remove item from cart", variant: "destructive" });
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      await apiRequest("DELETE", `/api/cart/user/${user.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/cart", user.id] });
      toast({ title: "Cart cleared" });
    } catch (error) {
      toast({ title: "Failed to clear cart", variant: "destructive" });
    }
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
