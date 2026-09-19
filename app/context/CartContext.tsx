"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductSize, CLINIC_INFO } from "@/app/data/products";

export interface CartItem {
  product: Product;
  selectedSize: ProductSize;
  quantity: number;
}

export interface AppliedCoupon {
  code: string;
  description: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number; // e.g. 10 for 10%, 200 for 200 PKR
  minSubtotal?: number;
}

export const AVAILABLE_COUPONS: Record<string, AppliedCoupon> = {
  HAKIM10: {
    code: "HAKIM10",
    description: "10% Off Your Entire Order",
    discountType: "percentage",
    discountValue: 10,
  },
  FREESHIP: {
    code: "FREESHIP",
    description: "100% Free Nationwide Delivery",
    discountType: "free_shipping",
    discountValue: 0,
  },
  SEHAT200: {
    code: "SEHAT200",
    description: "₨ 200 Flat Off (Orders over ₨ 1,500)",
    discountType: "fixed",
    discountValue: 200,
    minSubtotal: 1500,
  },
};

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
  discountAmount: number;
  total: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  freeShippingThreshold: number;
  remainingForFreeShipping: number;
  // Wishlist
  wishlist: string[]; // array of product IDs
  toggleWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  // Toast & WhatsApp
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
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart, wishlist, and coupon from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("tms_cart_v1");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      const savedWishlist = localStorage.getItem("tms_wishlist_v1");
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }

      const savedCoupon = localStorage.getItem("tms_coupon_v1");
      if (savedCoupon) {
        const parsed = JSON.parse(savedCoupon);
        if (AVAILABLE_COUPONS[parsed.code]) {
          setAppliedCoupon(AVAILABLE_COUPONS[parsed.code]);
        }
      }
    } catch (e) {
      console.error("Failed to load cart/wishlist from localStorage", e);
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

  // Save wishlist to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem("tms_wishlist_v1", JSON.stringify(wishlist));
      } catch (e) {
        console.error("Failed to save wishlist to localStorage", e);
      }
    }
  }, [wishlist, isInitialized]);

  // Save coupon to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        if (appliedCoupon) {
          localStorage.setItem("tms_coupon_v1", JSON.stringify(appliedCoupon));
        } else {
          localStorage.removeItem("tms_coupon_v1");
        }
      } catch (e) {
        console.error("Failed to save coupon to localStorage", e);
      }
    }
  }, [appliedCoupon, isInitialized]);

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

    // Check available stock
    if (size.available !== undefined && size.available <= 0) {
      showToast(`Sorry, "${product.name} (${size.weight})" is currently out of stock.`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          (size.id && item.selectedSize.id ? item.selectedSize.id === size.id : false) ||
          (item.product.id === product.id && item.selectedSize.name === size.name)
      );

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        let newQty = currentQty + quantity;

        if (size.available !== undefined && newQty > size.available) {
          newQty = size.available;
          showToast(`Stock limit: Maximum ${size.available} available units added.`);
        }

        const updated = [...prev];
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        let finalQty = quantity;
        if (size.available !== undefined && finalQty > size.available) {
          finalQty = Math.max(1, size.available);
        }
        return [...prev, { product, selectedSize: size, quantity: finalQty }];
      }
    });

    showToast(`Added "${product.name} (${size.weight})" to cart.`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, sizeName: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (item.selectedSize.id ? item.selectedSize.id === sizeName : item.selectedSize.name === sizeName)
          )
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
        const isMatch =
          item.product.id === productId &&
          (item.selectedSize.id ? item.selectedSize.id === sizeName : item.selectedSize.name === sizeName);

        if (isMatch) {
          let finalQty = quantity;
          if (item.selectedSize.available !== undefined && finalQty > item.selectedSize.available) {
            finalQty = Math.max(1, item.selectedSize.available);
            showToast(`Maximum available stock reached (${item.selectedSize.available} units).`);
          }
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist actions
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast("Removed from your saved remedies.");
        return prev.filter((id) => id !== productId);
      } else {
        showToast("Saved to your wishlist ❤️");
        return [...prev, productId];
      }
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
    showToast("Removed from your saved remedies.");
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  // Price calculations
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.selectedSize.price * item.quantity,
    0
  );

  const freeShippingThreshold = CLINIC_INFO.freeShippingThreshold; // 2000 PKR

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.minSubtotal && subtotal < appliedCoupon.minSubtotal) {
      // Coupon threshold not met
      discountAmount = 0;
    } else if (appliedCoupon.discountType === "percentage") {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
    } else if (appliedCoupon.discountType === "fixed") {
      discountAmount = Math.min(subtotal, appliedCoupon.discountValue);
    }
  }

  // Calculate shipping
  let shippingFee = 0;
  if (cart.length > 0) {
    if (appliedCoupon?.discountType === "free_shipping" || subtotal >= freeShippingThreshold) {
      shippingFee = 0;
    } else {
      shippingFee = CLINIC_INFO.flatShippingFee; // 200 PKR
    }
  }

  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Apply coupon
  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS[cleanCode];

    if (!coupon) {
      return { success: false, message: "Invalid coupon code. Try HAKIM10 or FREESHIP" };
    }

    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
      return {
        success: false,
        message: `Coupon requires minimum order of ₨ ${coupon.minSubtotal.toLocaleString()}`,
      };
    }

    setAppliedCoupon(coupon);
    showToast(`Coupon "${cleanCode}" applied: ${coupon.description}!`);
    return { success: true, message: `Coupon "${cleanCode}" applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast("Coupon removed.");
  };

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

    let message = `*Assalam-o-Alaikum Tameer-e-Sehat,*\nI would like to place an order from your website:\n\n${itemList}\n\n*Subtotal:* ₨ ${subtotal.toLocaleString()}`;

    if (discountAmount > 0 && appliedCoupon) {
      message += `\n*Coupon Applied (${appliedCoupon.code}):* -₨ ${discountAmount.toLocaleString()}`;
    }

    message += `\n*Delivery Fee:* ${
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
        discountAmount,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        freeShippingThreshold,
        remainingForFreeShipping,
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
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
