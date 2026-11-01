import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { FoodCategory, FoodItem } from '../types';
import { Plus, Edit2, Trash2, Clock, Check, X, AlertCircle, UtensilsCrossed, Image as ImageIcon } from 'lucide-react';

export const CanteenFoodManagement: React.FC = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: 0,
    price: 0,
    imageUrl: '',
    preparationTime: 10,
    isVeg: true,
    available: true,
  });

  const loadData = async () => {
    try {
      const [foodsData, categoriesData] = await Promise.all([
        api.getOwnerFoodItems(),
        api.getCategories(),
      ]);
      setFoods(foodsData);
      setCategories(categoriesData);
      if (categoriesData.length > 0 && formData.categoryId === 0) {
        setFormData((prev) => ({ ...prev, categoryId: categoriesData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load foods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingFood(null);
    setFormData({
      name: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].id : 1,
      price: 0,
      imageUrl: '',
      preparationTime: 10,
      isVeg: true,
      available: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (food: FoodItem) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description || '',
      categoryId: food.categoryId,
      price: food.price,
      imageUrl: food.imageUrl || '',
      preparationTime: food.preparationTime,
      isVeg: food.isVeg,
      available: food.available,
    });
    setIsModalOpen(true);
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.price <= 0) {
      alert('Price must be greater than 0');
      return;
    }

    try {
      if (editingFood) {
        await api.updateFoodItem(editingFood.id, formData);
      } else {
        await api.addFoodItem(formData);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save food item');
    }
  };

  const handleToggleAvailability = async (food: FoodItem) => {
    try {
      await api.toggleFoodAvailability(food.id, !food.available);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update availability');
    }
  };

  const handleDeleteFood = async (food: FoodItem) => {
    if (!confirm(`Are you sure you want to deactivate ${food.name}? Existing orders will remain preserved.`)) {
      return;
    }
    try {
      await api.deleteFoodItem(food.id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete food item');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-brand-500" /> Food Menu Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">Add dishes, set prices, and control live item availability</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 flex items-center gap-2 text-sm transition-transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </div>

      {/* Foods Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl h-48 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Food Items Yet</h3>
          <p className="text-xs text-slate-400 mt-1">Click "Add Food Item" to add your first dish to the menu!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map((food) => (
            <div
              key={food.id}
              className={`bg-white rounded-3xl border p-6 flex flex-col justify-between shadow-sm transition-all ${
                !food.available ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {food.categoryName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      food.isVeg
                        ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                        : 'border-red-600 text-red-700 bg-red-50'
                    }`}
                  >
                    {food.isVeg ? 'VEG' : 'NON-VEG'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900">{food.name}</h3>

                {food.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{food.description}</p>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xl font-extrabold text-slate-900">₹{food.price.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> ~{food.preparationTime}m
                  </span>
                </div>
              </div>

              {/* Action Buttons & Availability Toggle */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleToggleAvailability(food)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    food.available
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {food.available ? 'Available' : 'Unavailable'}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(food)}
                    className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Edit Item"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFood(food)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Deactivate / Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
            </h3>

            <form onSubmit={handleSaveFood} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Masala Dosa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Prep Time (mins)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) || 10 })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, spice level, or details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none text-sm"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isVeg}
                    onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  Vegetarian
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  Available to Order
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-md transition-colors text-sm"
              >
                {editingFood ? 'Save Changes' : 'Create Food Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

