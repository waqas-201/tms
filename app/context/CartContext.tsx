"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductSize, CLINIC_INFO } from "@/app/data/products";

export interface CartItem {
  product: Product;
  selectedSize: ProductSize;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedSize?: ProductSize, quantity?: number) => void;
  removeFromCart: (productId: string, sizeName: string) => void;
  updateQuantity: (productId: string, sizeName: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  generateWhatsAppOrderUrl: (customerDetails?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    notes?: string;
  }) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("tms_cart_v1");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("tms_cart_v1", JSON.stringify(cart));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }
  }, [cart, isInitialized]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const addToCart = (
    product: Product,
    selectedSize?: ProductSize,
    quantity: number = 1
  ) => {
    const size = selectedSize || product.sizes[0];

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize.name === size.name
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, selectedSize: size, quantity }];
      }
    });

    showToast(`Added "${product.name} (${size.weight})" to cart.`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, sizeName: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.selectedSize.name === sizeName)
      )
    );
  };

  const updateQuantity = (
    productId: string,
    sizeName: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, sizeName);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId &&
          item.selectedSize.name === sizeName
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.selectedSize.price * item.quantity,
    0
  );

  const freeShippingThreshold = CLINIC_INFO.freeShippingThreshold; // 2000 PKR
  const shippingFee =
    cart.length === 0 ? 0 : subtotal >= freeShippingThreshold ? 0 : CLINIC_INFO.flatShippingFee; // 200 PKR
  const total = subtotal + shippingFee;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const generateWhatsAppOrderUrl = (customerDetails?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    notes?: string;
  }) => {
    const itemList = cart
      .map(
        (item, idx) =>
          `${idx + 1}. *${item.product.name}* (${item.selectedSize.weight})\n   Qty: ${
            item.quantity
          } x ₨ ${item.selectedSize.price} = ₨ ${
            item.selectedSize.price * item.quantity
          }`
      )
      .join("\n\n");

    let message = `*Assalam-o-Alaikum Tameer-e-Sehat,*\nI would like to place an order from your website:\n\n${itemList}\n\n*Subtotal:* ₨ ${subtotal.toLocaleString()}\n*Delivery Fee:* ${
      shippingFee === 0 ? "FREE" : `₨ ${shippingFee}`
    }\n*Total Payable (COD):* ₨ ${total.toLocaleString()}`;

    if (customerDetails && customerDetails.name) {
      message += `\n\n*Customer Details:*\n• Name: ${customerDetails.name}\n• Phone: ${
        customerDetails.phone || ""
      }\n• Address: ${customerDetails.address || ""}\n• City: ${
        customerDetails.city || ""
      }`;
      if (customerDetails.notes) {
        message += `\n• Special Notes: ${customerDetails.notes}`;
      }
    }

    message += `\n\nPlease confirm availability and dispatch details. JazakAllah!`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/${CLINIC_INFO.whatsappNumber}?text=${encoded}`;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        shippingFee,
        total,
        freeShippingThreshold,
        remainingForFreeShipping,
        toastMessage,
        showToast,
        generateWhatsAppOrderUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
