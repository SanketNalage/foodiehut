import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem } from '../types';

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  canteenCode: string | null;
  canteenName: string | null;
  addItem: (food: FoodItem, canteenCode: string, canteenName: string) => boolean;
  removeItem: (foodId: number) => void;
  updateQuantity: (foodId: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalQuantity: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('foodiehut_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [canteenCode, setCanteenCode] = useState<string | null>(() => {
    return localStorage.getItem('foodiehut_cart_canteen') || null;
  });

  const [canteenName, setCanteenName] = useState<string | null>(() => {
    return localStorage.getItem('foodiehut_cart_canteen_name') || null;
  });

  useEffect(() => {
    localStorage.setItem('foodiehut_cart', JSON.stringify(items));
    if (canteenCode) localStorage.setItem('foodiehut_cart_canteen', canteenCode);
    else localStorage.removeItem('foodiehut_cart_canteen');
    if (canteenName) localStorage.setItem('foodiehut_cart_canteen_name', canteenName);
    else localStorage.removeItem('foodiehut_cart_canteen_name');
  }, [items, canteenCode, canteenName]);

  const addItem = (food: FoodItem, newCanteenCode: string, newCanteenName: string): boolean => {
    // If cart has items from another canteen, prompt/handle switch
    if (canteenCode && canteenCode !== newCanteenCode && items.length > 0) {
      const confirmSwitch = window.confirm(
        `Your cart currently contains items from ${canteenName}. Clear cart to add items from ${newCanteenName}?`
      );
      if (!confirmSwitch) return false;
      setItems([{ food, quantity: 1 }]);
      setCanteenCode(newCanteenCode);
      setCanteenName(newCanteenName);
      return true;
    }

    setCanteenCode(newCanteenCode);
    setCanteenName(newCanteenName);

    setItems((prev) => {
      const existing = prev.find((i) => i.food.id === food.id);
      if (existing) {
        return prev.map((i) => (i.food.id === food.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { food, quantity: 1 }];
    });
    return true;
  };

  const removeItem = (foodId: number) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.food.id !== foodId);
      if (updated.length === 0) {
        setCanteenCode(null);
        setCanteenName(null);
      }
      return updated;
    });
  };

  const updateQuantity = (foodId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(foodId);
      return;
    }
    setItems((prev) => prev.map((i) => (i.food.id === foodId ? { ...i, quantity } : i)));
  };

  const clearCart = () => {
    setItems([]);
    setCanteenCode(null);
    setCanteenName(null);
  };

  const subtotal = items.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        canteenCode,
        canteenName,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        totalQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

