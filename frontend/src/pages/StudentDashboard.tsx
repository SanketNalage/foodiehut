import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Canteen, Order, Student } from '../types';
import { QrCode, Store, UtensilsCrossed, Clock, CheckCircle2, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { QrScannerModal } from '../components/QrScannerModal';
import { OrderTimeline } from '../components/OrderTimeline';
import { useWebSocket } from '../hooks/useWebSocket';

export const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const student = profile as Student;
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [canteensData, ordersData] = await Promise.all([
        api.getAllCanteens(),
        api.getStudentOrders(),
      ]);
      setCanteens(canteensData);
      setRecentOrders(ordersData);
    } catch (err) {
      console.error('Failed to load student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time WebSocket listener for this student's orders
  const studentTopic = student?.studentCode ? `/topic/student/${student.studentCode}/orders` : null;
  useWebSocket(studentTopic, (event) => {
    console.log('[RealTime] Received student order event:', event);
    loadData();
  });

  const activeOrders = recentOrders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Quick Action Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-brand-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Student Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-brand-100 text-sm sm:text-base mt-2 max-w-xl">
            Hungry? Scan your canteen's QR code or choose from the list below to place your order!
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm font-mono font-bold">
              ID: {student?.studentCode}
            </span>
            {student?.section && (
              <span className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                Section: {student.section}
              </span>
            )}
            {student?.college && (
              <span className="bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                {student.college}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-6 py-3.5 bg-white text-brand-600 hover:bg-brand-50 font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2.5 transition-transform hover:scale-105"
          >
            <QrCode className="w-5 h-5" />
            Scan Canteen QR
          </button>
          <Link
            to="/student/profile"
            className="px-6 py-3.5 bg-brand-700/50 hover:bg-brand-700/70 text-white font-semibold rounded-2xl border border-white/20 flex items-center justify-center gap-2 backdrop-blur-sm transition-colors text-sm"
          >
            My QR Code
          </Link>
        </div>
      </div>

      {/* Live Active Order Tracking */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              Active Orders (Live Tracking)
            </h2>
            <Link to="/student/orders" className="text-sm font-semibold text-brand-600 hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border-2 border-brand-200 shadow-lg shadow-brand-100/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block">
                      {order.canteenName} ({order.canteenCode})
                    </span>
                    <span className="text-lg font-mono font-extrabold text-slate-900">
                      #{order.orderNumber}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Amount</span>
                    <span className="text-xl font-extrabold text-slate-900">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="my-2">
                  <OrderTimeline status={order.status} cancellationReason={order.cancellationReason} />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Ordered: {new Date(order.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <span className="font-semibold text-slate-700">
                    {order.items.map((i) => `${i.quantity}x ${i.foodNameSnapshot}`).join(', ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campus Canteens */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Campus Canteens</h2>
            <p className="text-xs text-slate-500">Select a canteen to view delicious menus and order</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 h-40 animate-pulse" />
            ))}
          </div>
        ) : canteens.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Canteens Registered Yet</h3>
            <p className="text-sm text-slate-500 mt-1">Canteens will appear here once registered.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {canteens.map((canteen) => (
              <div
                key={canteen.id}
                onClick={() => navigate(`/canteen/${canteen.canteenCode}`)}
                className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-brand-500 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-xl">
                      {canteen.canteenCode}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Open
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mt-3 group-hover:text-brand-600 transition-colors">
                    {canteen.canteenName}
                  </h3>

                  {canteen.description && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {canteen.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[150px]">{canteen.address || 'Campus'}</span>
                  </span>
                  <span className="text-xs font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Menu <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} />
    </div>
  );
};

