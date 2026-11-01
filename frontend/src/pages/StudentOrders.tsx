import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Order, Student } from '../types';
import { useAuth } from '../context/AuthContext';
import { OrderTimeline } from '../components/OrderTimeline';
import { useWebSocket } from '../hooks/useWebSocket';
import { Clock, Store, ClipboardList, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const StudentOrders: React.FC = () => {
  const { profile } = useAuth();
  const student = profile as Student;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await api.getStudentOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load student orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Real-time WebSocket listener
  const studentTopic = student?.studentCode ? `/topic/student/${student.studentCode}/orders` : null;
  useWebSocket(studentTopic, (event) => {
    console.log('[RealTime] Student live update received:', event);
    fetchOrders();
  });

  const activeOrders = orders.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
  const pastOrders = orders.filter((o) => o.status === 'COMPLETED' || o.status === 'CANCELLED');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-brand-500" /> My Orders & Live Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">Real-time status updates from the canteen kitchen</p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          title="Refresh orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            Active Orders ({activeOrders.length})
          </h2>

          <div className="space-y-6">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-200 shadow-xl shadow-brand-500/5 relative overflow-hidden"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                      {order.canteenCode}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">{order.canteenName}</h3>
                    <span className="text-xs text-slate-400 font-mono mt-0.5 block">#{order.orderNumber}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-medium">Order Total</span>
                    <span className="text-2xl font-black text-slate-900">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Real-time Order Timeline */}
                <div className="py-4">
                  <OrderTimeline status={order.status} cancellationReason={order.cancellationReason} />
                </div>

                {/* Items List */}
                <div className="bg-slate-50 rounded-2xl p-4 mt-2 divide-y divide-slate-200/50">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        {item.quantity}x {item.foodNameSnapshot}
                      </span>
                      <span className="font-mono text-slate-600 font-bold">₹{item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Placed: {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                  <span className="font-semibold text-emerald-600">Live Status: {order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order History */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Past Orders</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : pastOrders.length === 0 && activeOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Orders Yet</h3>
            <p className="text-xs text-slate-400 mt-1">Your past and active orders will appear here.</p>
          </div>
        ) : pastOrders.length === 0 ? (
          <p className="text-xs text-slate-400">No completed or cancelled orders yet.</p>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
            {pastOrders.map((order) => (
              <div key={order.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{order.canteenName}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono block mt-1">#{order.orderNumber}</span>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    {order.items.map((i) => `${i.quantity}x ${i.foodNameSnapshot}`).join(', ')}
                  </p>
                </div>

                <div className="text-right sm:shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                  <span className="text-base font-extrabold text-slate-900">₹{order.totalAmount.toFixed(2)}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
