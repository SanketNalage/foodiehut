import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { UtensilsCrossed, QrCode, ShoppingBag, ClipboardList, LogOut, User, Store, Menu, X, PlusCircle } from 'lucide-react';
import { QrScannerModal } from './QrScannerModal';

export const Navbar: React.FC = () => {
  const { user, role, profile, logout, isAuthenticated } = useAuth();
  const { totalQuantity } = useCart();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isStudent = role === 'ROLE_STUDENT';
  const isCanteen = role === 'ROLE_CANTEEN_OWNER';

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 leading-none">
                  Foodie<span className="text-brand-500">Hut</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">Canteen System</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-4">
                {isStudent && (
                  <>
                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors border border-brand-200"
                    >
                      <QrCode className="w-4 h-4 text-brand-600" />
                      <span>Scan Canteen QR</span>
                    </button>

                    <Link
                      to="/student/dashboard"
                      className="text-sm font-medium text-slate-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Dashboard
                    </Link>

                    <Link
                      to="/student/orders"
                      className="text-sm font-medium text-slate-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                    >
                      <ClipboardList className="w-4 h-4" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/student/cart"
                      className="relative flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-brand-600" />
                      <span>Cart</span>
                      {totalQuantity > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                          {totalQuantity}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/student/profile"
                      className="flex items-center gap-2 pl-3 border-l border-slate-200 text-slate-700 hover:text-brand-600"
                      title="Profile & Student QR"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                        {user?.fullName?.charAt(0) || 'S'}
                      </div>
                      <span className="text-xs font-semibold max-w-[100px] truncate">{user?.fullName}</span>
                    </Link>
                  </>
                )}

                {isCanteen && (
                  <>
                    <Link
                      to="/canteen/dashboard"
                      className="text-sm font-medium text-slate-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Dashboard
                    </Link>

                    <Link
                      to="/canteen/orders"
                      className="text-sm font-medium text-slate-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                    >
                      <ClipboardList className="w-4 h-4 text-brand-600" />
                      <span>Live Orders</span>
                    </Link>

                    <Link
                      to="/canteen/foods"
                      className="text-sm font-medium text-slate-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-600" />
                      <span>Food Menu</span>
                    </Link>

                    <Link
                      to="/canteen/profile"
                      className="text-sm font-medium text-slate-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                    >
                      <Store className="w-4 h-4 text-brand-600" />
                      <span>Canteen QR</span>
                    </Link>

                    <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-slate-700">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                        {user?.fullName?.charAt(0) || 'C'}
                      </div>
                      <span className="text-xs font-semibold max-w-[120px] truncate">{user?.fullName}</span>
                    </div>
                  </>
                )}

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors ml-2"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  to="/student/login"
                  className="text-sm font-semibold text-slate-700 hover:text-brand-600 px-4 py-2 rounded-xl transition-colors"
                >
                  Student Login
                </Link>
                <Link
                  to="/canteen/login"
                  className="text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  Canteen Portal
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              {isStudent && (
                <Link to="/student/cart" className="relative p-2 text-slate-700">
                  <ShoppingBag className="w-5 h-5 text-brand-600" />
                  {totalQuantity > 0 && (
                    <span className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalQuantity}
                    </span>
                  )}
                </Link>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 rounded-xl hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 px-4 pt-2 pb-4 space-y-2 bg-white">
            {isAuthenticated ? (
              <>
                <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{user?.fullName} ({role?.replace('ROLE_', '')})</span>
                  <button onClick={logout} className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
                {isStudent && (
                  <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsScannerOpen(true);
                      }}
                      className="w-full text-left py-2 text-sm font-semibold text-brand-600 flex items-center gap-2"
                    >
                      <QrCode className="w-4 h-4" /> Scan Canteen QR
                    </button>
                    <Link
                      to="/student/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-sm font-medium text-slate-700"
                    >
                      Student Dashboard
                    </Link>
                    <Link
                      to="/student/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-sm font-medium text-slate-700"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/student/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-sm font-medium text-slate-700"
                    >
                      Student Profile & QR
                    </Link>
                  </>
                )}
                {isCanteen && (
                  <>
                    <Link
                      to="/canteen/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-sm font-medium text-slate-700"
                    >
                      Canteen Dashboard
                    </Link>
                    <Link
                      to="/canteen/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-sm font-medium text-slate-700"
                    >
                      Live Orders
                    </Link>
                    <Link
                      to="/canteen/foods"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-sm font-medium text-slate-700"
                    >
                      Food Management
                    </Link>
                    <Link
                      to="/canteen/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block py-2 text-sm font-medium text-slate-700"
                    >
                      Canteen Profile & QR
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/student/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-sm font-semibold text-brand-600"
                >
                  Student Portal Login
                </Link>
                <Link
                  to="/canteen/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-sm font-semibold text-slate-900"
                >
                  Canteen Portal Login
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* QR Scanner Modal */}
      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </>
  );
};

