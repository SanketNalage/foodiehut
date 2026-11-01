import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { Canteen, FoodCategory, FoodItem } from '../types';
import { useCart } from '../context/CartContext';
import { Search, Clock, Plus, Minus, ShoppingBag, Store, MapPin, AlertCircle, Sparkles, Check, UtensilsCrossed } from 'lucide-react';

export const CanteenMenu: React.FC = () => {
  const { canteenCode } = useParams<{ canteenCode: string }>();
  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { items: cartItems, addItem, updateQuantity, totalQuantity, subtotal } = useCart();

  useEffect(() => {
    if (!canteenCode) return;

    setLoading(true);
    Promise.all([
      api.getCanteenByCode(canteenCode),
      api.getCanteenMenu(canteenCode),
      api.getCategories(),
    ])
      .then(([canteenData, menuData, categoriesData]) => {
        setCanteen(canteenData);
        setMenuItems(menuData);
        setCategories(categoriesData);
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Failed to load canteen menu.');
      })
      .finally(() => setLoading(false));
  }, [canteenCode]);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' || item.categoryName.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVeg = !vegOnly || item.isVeg;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  const getItemCartQuantity = (foodId: number) => {
    const item = cartItems.find((i) => i.food.id === foodId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading canteen menu...</p>
      </div>
    );
  }

  if (errorMsg || !canteen) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-red-200 text-center shadow-lg">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">Canteen Unavailable</h3>
        <p className="text-sm text-slate-500 mt-2">{errorMsg || 'Canteen could not be found.'}</p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-32">
      {/* Canteen Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
              {canteen.canteenCode}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Canteen
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{canteen.canteenName}</h1>

          {canteen.description && (
            <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">{canteen.description}</p>
          )}

          {canteen.address && (
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {canteen.address}
            </p>
          )}
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Menu Items</span>
          <span className="text-2xl font-extrabold text-slate-800">{menuItems.length}</span>
        </div>
      </div>

      {/* Controls: Search, Veg Toggle, Categories */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search dishes, drinks, snacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Veg Only Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 border border-emerald-700"></span>
                Vegetarian Only
              </span>
            </label>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No Food Items Found</h3>
          <p className="text-sm text-slate-500 mt-1">Try clearing your search query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((food) => {
            const inCartQty = getItemCartQuantity(food.id);

            return (
              <div
                key={food.id}
                className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md ${
                  !food.available
                    ? 'border-slate-200 opacity-75 bg-slate-50/50'
                    : 'border-slate-200 hover:border-brand-300'
                }`}
              >
                <div className="p-6">
                  {/* Category & Veg indicator */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {food.categoryName}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1 border ${
                        food.isVeg
                          ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                          : 'border-red-600 text-red-700 bg-red-50'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${food.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                      {food.isVeg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{food.name}</h3>

                  {food.description && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {food.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> ~{food.preparationTime} mins prep
                    </span>
                  </div>
                </div>

                {/* Footer: Price & Add / Unavailable */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Price</span>
                    <span className="text-xl font-extrabold text-slate-900">₹{food.price.toFixed(2)}</span>
                  </div>

                  {!food.available ? (
                    <span className="px-3.5 py-1.5 bg-slate-200 text-slate-600 text-xs font-bold rounded-xl select-none">
                      Currently Unavailable
                    </span>
                  ) : inCartQty > 0 ? (
                    <div className="flex items-center bg-brand-500 rounded-xl p-1 text-white shadow-sm">
                      <button
                        onClick={() => updateQuantity(food.id, inCartQty - 1)}
                        className="p-1 hover:bg-brand-600 rounded-lg transition-colors"
                        title="Decrease"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 font-bold text-sm">{inCartQty}</span>
                      <button
                        onClick={() => updateQuantity(food.id, inCartQty + 1)}
                        className="p-1 hover:bg-brand-600 rounded-lg transition-colors"
                        title="Increase"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addItem(food, canteen.canteenCode, canteen.canteenName)}
                      className="px-4 py-2 bg-slate-900 hover:bg-brand-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add to Cart
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {totalQuantity > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700 animate-bounce-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-sm">
                {totalQuantity}
              </div>
              <div>
                <span className="text-xs text-slate-400 block">{totalQuantity} items added</span>
                <span className="text-lg font-extrabold text-white">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/student/cart"
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition-colors shadow-md"
            >
              <ShoppingBag className="w-4 h-4" /> View Cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
