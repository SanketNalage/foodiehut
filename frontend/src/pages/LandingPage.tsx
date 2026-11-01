import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Canteen } from '../types';
import { QrCode, UtensilsCrossed, ArrowRight, ShieldCheck, Zap, Smartphone, Clock, Store, MapPin } from 'lucide-react';
import { QrScannerModal } from '../components/QrScannerModal';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'ROLE_STUDENT') navigate('/student/dashboard');
      else if (role === 'ROLE_CANTEEN_OWNER') navigate('/canteen/dashboard');
    }

    api.getAllCanteens().then(setCanteens).catch(console.error);
  }, [isAuthenticated, role, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
              <Zap className="w-4 h-4 text-brand-500" />
              Next-Gen Student Canteen Ordering
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Skip The Queue, <br />
              <span className="bg-gradient-to-r from-brand-500 to-amber-500 bg-clip-text text-transparent">
                Scan & Enjoy Your Meal
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
              Order delicious food from your campus canteen using your unique Student QR code.
              Track prep progress in real-time, get notified when it's ready, and pick it up hot!
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="w-full sm:w-auto px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/25 flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5"
              >
                <QrCode className="w-5 h-5" />
                Scan Canteen QR Now
              </button>
              <Link
                to="/student/login"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
              >
                Student Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Dual Portals Card */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:border-brand-300 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5 font-bold">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Student Portal</h3>
                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                  Browse menus, customize your cart, place orders, and track preparation status in real-time.
                </p>
              </div>
              <div className="mt-8 flex gap-3">
                <Link
                  to="/student/login"
                  className="flex-1 py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-center text-sm transition-colors shadow-sm"
                >
                  Student Login
                </Link>
                <Link
                  to="/student/register"
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-center text-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:border-slate-400 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-5 font-bold">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Canteen Owner Portal</h3>
                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                  Manage food items, accept/reject live orders, update kitchen statuses, and print unique Canteen QR codes.
                </p>
              </div>
              <div className="mt-8 flex gap-3">
                <Link
                  to="/canteen/login"
                  className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-center text-sm transition-colors shadow-sm"
                >
                  Owner Login
                </Link>
                <Link
                  to="/canteen/register"
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-center text-sm transition-colors"
                >
                  Register Canteen
                </Link>
              </div>
            </div>
          </div>

          {/* Active Campus Canteens */}
          {canteens.length > 0 && (
            <div className="mt-20">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Available Campus Canteens</h2>
                <p className="text-slate-500 text-sm mt-1">Select a canteen or scan its QR code to view today's menu</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {canteens.map((canteen) => (
                  <div
                    key={canteen.id}
                    onClick={() => navigate(`/canteen/${canteen.canteenCode}`)}
                    className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-brand-500 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                        {canteen.canteenCode}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Open
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mt-3 group-hover:text-brand-600 transition-colors">
                      {canteen.canteenName}
                    </h4>
                    {canteen.description && (
                      <p className="text-slate-500 text-xs mt-1 line-clamp-2">{canteen.description}</p>
                    )}
                    {canteen.address && (
                      <p className="text-slate-400 text-xs mt-3 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" /> {canteen.address}
                      </p>
                    )}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600">
                      <span>View Menu</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        <p>© 2026 FoodieHut — Smart Student Food Canteen Management System.</p>
      </footer>

      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
};
