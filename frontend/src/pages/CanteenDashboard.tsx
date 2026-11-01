import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Canteen, CanteenAnalytics, Order } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  TrendingUp,
  Clock,
  ChefHat,
  PackageCheck,
  CheckCircle2,
  DollarSign,
  UtensilsCrossed,
  ArrowRight,
  RefreshCw,
  QrCode,
  AlertCircle
} from 'lucide-react';

export const CanteenDashboard: React.FC = () => {
  const { profile } = useAuth();
  const canteen = profile as Canteen;
  const [analytics, setAnalytics] = useState<CanteenAnalytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [analyticsData, ordersData] = await Promise.all([
        api.getCanteenAnalytics(),
        api.getCanteenOrders(),
      ]);
      setAnalytics(analyticsData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load canteen dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time WebSocket listener for Canteen's orders
  const canteenTopic = canteen?.canteenCode ? `/topic/canteen/${canteen.canteenCode}/orders` : null;
  useWebSocket(canteenTopic, (event) => {
    console.log('[RealTime] Canteen dashboard live event:', event);
    loadData();
  });

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const incomingOrders = orders.filter((o) => o.status === 'PLACED');
  const inProgressOrders = orders.filter((o) => o.status === 'ACCEPTED' || o.status === 'PREPARING');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-3 py-1 rounded-xl border border-amber-400/20">
              {canteen?.canteenCode}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Kitchen Mode
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">{canteen?.canteenName}</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time incoming orders and kitchen operations</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/canteen/profile"
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/10 flex items-center gap-2 text-sm backdrop-blur-sm transition-colors"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            Canteen QR
          </Link>
          <Link
            to="/canteen/foods"
            className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 flex items-center gap-2 text-sm transition-colors"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Manage Food
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Today's Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Orders</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-3xl font-black text-slate-900">{analytics?.totalOrdersToday ?? 0}</span>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-black text-amber-600">{analytics?.pendingOrders ?? 0}</span>
        </div>

        {/* Preparing */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Preparing</span>
            <ChefHat className="w-4 h-4 text-blue-500" />
          </div>
          <span className="text-3xl font-black text-blue-600">{analytics?.preparingOrders ?? 0}</span>
        </div>

        {/* Ready */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200 bg-purple-50/20 shadow-sm">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ready</span>
            <PackageCheck className="w-4 h-4 text-purple-500" />
          </div>
          <span className="text-3xl font-black text-purple-600">{analytics?.readyOrders ?? 0}</span>
        </div>

        {/* Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Revenue</span>
            <span className="font-bold text-xs">₹</span>
          </div>
          <span className="text-2xl font-black text-emerald-700">
            ₹{(analytics?.todayRevenue ?? 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Incoming Placed Orders (High Priority) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
            New Incoming Orders ({incomingOrders.length})
          </h2>
          <button
            onClick={loadData}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {incomingOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-400 text-sm">
            No incoming pending orders right now. New student orders will chime in real-time!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-lg shadow-amber-100 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                    <div>
                      <span className="font-mono text-base font-extrabold text-slate-900">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500 block">Student: {order.studentName} ({order.studentCode})</span>
                    </div>
                    <span className="text-lg font-black text-slate-900">₹{order.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="py-3 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs text-slate-700 font-medium">
                        <span>{item.quantity}x {item.foodNameSnapshot}</span>
                        <span>₹{item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'ACCEPTED')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-colors"
                  >
                    Accept Order
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Reason for rejecting order?');
                      if (reason !== null) {
                        api.updateOrderStatus(order.id, 'CANCELLED', reason || 'Rejected by kitchen').then(loadData);
                      }
                    }}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-bold rounded-xl text-xs transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders In Preparation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-blue-500" />
            Kitchen Queue ({inProgressOrders.length})
          </h2>
          <Link to="/canteen/orders" className="text-xs font-semibold text-brand-600 hover:underline">
            View All Order History →
          </Link>
        </div>

        {inProgressOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-400 text-sm">
            Kitchen queue is clear!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-mono text-sm font-extrabold text-slate-900">#{order.orderNumber}</span>
                      <span className="text-xs text-slate-400 block">{order.studentName}</span>
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        order.status === 'ACCEPTED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="py-2.5 text-xs text-slate-600 space-y-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.quantity}x {item.foodNameSnapshot}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  {order.status === 'ACCEPTED' ? (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Start Preparing
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Mark Ready for Pickup
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

