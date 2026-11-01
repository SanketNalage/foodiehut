import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Store, AlertCircle, CheckCircle2 } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { items, canteenCode, canteenName, updateQuantity, removeItem, clearCart, subtotal, totalQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/student/login');
      return;
    }

    if (!canteenCode || items.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      const payload = {
        canteenCode,
        items: items.map((i) => ({
          foodItemId: i.food.id,
          quantity: i.quantity,
        })),
      };

      const order = await api.placeOrder(payload);
      clearCart();
      navigate('/student/orders');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500 mt-1">Browse menus from your campus canteens and add food items!</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
        >
          Explore Canteens <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-brand-500" /> Your Food Cart
        </h1>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Canteen info bar */}
      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 flex items-center justify-between text-xs text-brand-900">
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-brand-600" />
          <span>
            Ordering from <strong>{canteenName}</strong> ({canteenCode})
          </span>
        </div>
        <Link to={`/canteen/${canteenCode}`} className="font-bold text-brand-700 hover:underline">
          + Add more items
        </Link>
      </div>

      {/* Cart Items List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {items.map(({ food, quantity }) => (
          <div key={food.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 w-3 h-3 rounded-full shrink-0 border ${
                  food.isVeg ? 'bg-emerald-500 border-emerald-600' : 'bg-red-500 border-red-600'
                }`}
              />
              <div>
                <h4 className="font-bold text-slate-900 text-base">{food.name}</h4>
                <span className="text-xs text-slate-400 block">{food.categoryName} • ₹{food.price.toFixed(2)} each</span>
              </div>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-6">
              {/* Stepper */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 text-slate-800">
                <button
                  onClick={() => updateQuantity(food.id, quantity - 1)}
                  className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 font-bold text-sm">{quantity}</span>
                <button
                  onClick={() => updateQuantity(food.id, quantity + 1)}
                  className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Item Subtotal */}
              <div className="text-right min-w-[80px]">
                <span className="text-base font-extrabold text-slate-900">
                  ₹{(food.price * quantity).toFixed(2)}
                </span>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeItem(food.id)}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Summary */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Bill Details</h3>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Item Total ({totalQuantity} items)</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Canteen Service Fee</span>
          <span className="text-emerald-600 font-medium">FREE</span>
        </div>
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-lg font-extrabold text-slate-900">
          <span>To Pay</span>
          <span className="text-brand-600 text-2xl font-black">₹{subtotal.toFixed(2)}</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full mt-4 py-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-xl shadow-brand-500/25 transition-all text-base flex items-center justify-center gap-2"
        >
          {loading ? 'Submitting Order...' : 'Confirm & Place Order'} <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-[11px] text-center text-slate-400 mt-2">
          Prices and food item availability are strictly validated against the canteen's live database.
        </p>
      </div>
    </div>
  );
};

