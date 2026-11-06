"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductSize, CLINIC_INFO } from "@/app/data/products";
import { useSession } from "@/lib/auth-client";
import { isStaffRole } from "@/lib/rbac-base";

export interface CartItem {
  product: Product;
  selectedSize: ProductSize;
  quantity: number;
}

export interface AppliedCoupon {
  id?: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed" | "free_shipping" | "free_service" | string;
  discountValue: number; // e.g. 10 for 10%, 200 for 200 PKR
  minSubtotal?: number | null;
  maxDiscountCap?: number | null;
  isFreeShipping?: boolean;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedSize?: ProductSize, quantity?: number) => void;
  removeFromCart: (productId: string, sizeIdentifier?: string) => void;
  updateQuantity: (productId: string, sizeIdentifier: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
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

// Helper function to match cart items robustly across id, name, or weight
function matchesItemSize(
  item: CartItem,
  productId: string,
  sizeIdentifier?: string
): boolean {
  if (item.product.id !== productId) return false;
  if (!sizeIdentifier) return true;

  // Match by size id
  if (item.selectedSize.id && item.selectedSize.id === sizeIdentifier) {
    return true;
  }
  // Match by size name
  if (item.selectedSize.name && item.selectedSize.name === sizeIdentifier) {
    return true;
  }
  // Match by size weight
  if (item.selectedSize.weight && item.selectedSize.weight === sizeIdentifier) {
    return true;
  }
  return false;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: sessionData } = useSession();
  const isStaff = isStaffRole((sessionData?.user as { role?: string })?.role);

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
        if (parsed && parsed.code) {
          setAppliedCoupon(parsed);
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
    // Staff accounts manage the clinic; they are not customers.
    if (isStaff) {
      showToast(
        "Staff accounts cannot place customer orders. Use the admin dashboard to manage the store."
      );
      return;
    }

    const size =
      selectedSize ||
      (product.sizes && product.sizes.length > 0
        ? product.sizes[0]
        : {
            name: "Standard",
            weight: "250g",
            price: product.price || 0,
            available: product.inStock ? 100 : 0,
          });

    // Check available stock
    if (size.available !== undefined && size.available <= 0) {
      showToast(`Sorry, "${product.name} (${size.weight || size.name})" is out of stock.`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) =>
        item.product.id === product.id &&
        (
          (size.id && item.selectedSize.id ? item.selectedSize.id === size.id : false) ||
          item.selectedSize.name === size.name ||
          item.selectedSize.weight === size.weight
        )
      );

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        let newQty = currentQty + quantity;

        if (size.available !== undefined && newQty > size.available) {
          newQty = size.available;
          showToast(`Stock limit: Maximum ${size.available} units added.`);
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          selectedSize: size,
          quantity: newQty,
        };
        return updated;
      } else {
        let finalQty = quantity;
        if (size.available !== undefined && finalQty > size.available) {
          finalQty = Math.max(1, size.available);
        }
        return [...prev, { product, selectedSize: size, quantity: finalQty }];
      }
    });

    showToast(`Added "${product.name} (${size.weight || size.name})" to shopping bag.`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, sizeIdentifier?: string) => {
    setCart((prev) => {
      const target = prev.find((item) => matchesItemSize(item, productId, sizeIdentifier));
      if (target) {
        showToast(`Removed "${target.product.name} (${target.selectedSize.weight || target.selectedSize.name})" from bag.`);
      }
      return prev.filter((item) => !matchesItemSize(item, productId, sizeIdentifier));
    });
  };

  const updateQuantity = (
    productId: string,
    sizeIdentifier: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, sizeIdentifier);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (matchesItemSize(item, productId, sizeIdentifier)) {
          let finalQty = quantity;
          if (item.selectedSize.available !== undefined && finalQty > item.selectedSize.available) {
            finalQty = Math.max(1, item.selectedSize.available);
            showToast(`Maximum stock reached (${item.selectedSize.available} units).`);
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
    showToast("Shopping bag cleared.");
  };

  // Wishlist actions
  const toggleWishlist = (productId: string) => {
    if (isStaff) {
      showToast("Staff accounts do not have a customer wishlist.");
      return;
    }

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

  // Calculate discount dynamically with minimum subtotal and max cap enforcement
  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.minSubtotal && subtotal < appliedCoupon.minSubtotal) {
      discountAmount = 0;
    } else {
      const dtype = appliedCoupon.discountType?.toLowerCase();
      if (dtype === "percentage") {
        let calc = (subtotal * appliedCoupon.discountValue) / 100;
        if (appliedCoupon.maxDiscountCap) {
          calc = Math.min(calc, appliedCoupon.maxDiscountCap);
        }
        discountAmount = Math.min(subtotal, Math.round(calc));
      } else if (dtype === "fixed") {
        discountAmount = Math.min(subtotal, Math.round(appliedCoupon.discountValue));
      }
    }
  }

  // Deferred delivery calculation: shipping fee is determined manually upon clinic review
  const shippingFee = 0;
  const total = Math.max(0, subtotal - discountAmount);
  const remainingForFreeShipping = 0;

  // Authoritative server-side coupon application
  const applyCoupon = async (
    code: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: "Please enter a coupon code." };
    }

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          scope: "PRODUCTS",
          subtotal,
          items: cart.map((item) => ({
            productId: item.product.id,
            price: item.selectedSize.price,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error || `Coupon "${cleanCode}" could not be applied.`,
        };
      }

      const validated = data.data.coupon;
      const applied: AppliedCoupon = {
        id: validated.id,
        code: validated.code,
        description: validated.description,
        discountType: validated.discountType.toLowerCase(),
        discountValue: validated.discountValue,
        minSubtotal: validated.minSubtotal,
        maxDiscountCap: validated.maxDiscountCap,
        isFreeShipping: validated.isFreeShipping || validated.discountType.toUpperCase() === "FREE_SHIPPING",
      };

      setAppliedCoupon(applied);
      showToast(`Coupon "${cleanCode}" applied: ${applied.description}!`);
      return {
        success: true,
        message: data.data.message || `Coupon "${cleanCode}" applied successfully!`,
      };
    } catch (err) {
      console.error("Coupon validation error:", err);
      return {
        success: false,
        message: "Failed to validate coupon with server. Please try again.",
      };
    }
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
      .map((item, idx) => {
        return `${idx + 1}. *${item.product.name}* (${item.selectedSize.name || ""} - ${item.selectedSize.weight || ""})\n   Qty: ${
          item.quantity
        } x ₨ ${item.selectedSize.price} = ₨ ${(
          item.selectedSize.price * item.quantity
        ).toLocaleString()}`;
      })
      .join("\n\n");

    let message = `*Assalam-o-Alaikum Tameer-e-Sehat,*\nI would like to place an order from your website:\n\n${itemList}\n\n*Subtotal:* ₨ ${subtotal.toLocaleString()}`;

    if (discountAmount > 0 && appliedCoupon) {
      message += `\n*Coupon Applied (${appliedCoupon.code}):* -₨ ${discountAmount.toLocaleString()}`;
    }

    message += `\n*Delivery Charges:* Pending Clinic Confirmation\n*Products Total:* ₨ ${total.toLocaleString()} (+ Delivery to be confirmed on invoice)`;

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

    message += `\n\nPlease confirm preparation and dispatch details. JazakAllah!`;

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
