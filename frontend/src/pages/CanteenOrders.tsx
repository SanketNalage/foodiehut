import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { ClipboardList, CheckCircle2, Clock, ChefHat, PackageCheck, Ban, RefreshCw, Filter } from 'lucide-react';

export const CanteenOrders: React.FC = () => {
  const { profile } = useAuth();
  const canteen = profile as any;
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const data = await api.getCanteenOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load canteen orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Real-time WebSocket listener
  const canteenTopic = canteen?.canteenCode ? `/topic/canteen/${canteen.canteenCode}/orders` : null;
  useWebSocket(canteenTopic, (event) => {
    console.log('[RealTime] Canteen orders table live update:', event);
    fetchOrders();
  });

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    if (newStatus === 'CANCELLED') {
      const reason = prompt('Please enter reason for cancellation:');
      if (reason === null) return;
      try {
        await api.updateOrderStatus(orderId, newStatus, reason || 'Order cancelled by canteen');
        fetchOrders();
      } catch (err: any) {
        alert(err.message || 'Failed to cancel order');
      }
      return;
    }

    try {
      await api.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-brand-500" /> Canteen Orders Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">Live order dispatch & status transitions</p>
        </div>

        <button
          onClick={fetchOrders}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {['ALL', 'PLACED', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              filterStatus === st
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Order Number</th>
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Items Ordered</th>
                <th className="py-4 px-6">Total</th>
                <th className="py-4 px-6">Time</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                    No orders matching status filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      #{order.orderNumber}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-800 block text-xs">{order.studentName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{order.studentCode}</span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-600 max-w-xs">
                      {order.items.map((i) => `${i.quantity}x ${i.foodNameSnapshot}`).join(', ')}
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-900 text-sm">
                      ₹{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${
                          order.status === 'PLACED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : order.status === 'ACCEPTED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : order.status === 'PREPARING'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : order.status === 'READY'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : order.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {order.status === 'PLACED' && (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleStatusChange(order.id, 'ACCEPTED')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusChange(order.id, 'CANCELLED')}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-bold rounded-lg text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {order.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'PREPARING')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                        >
                          Start Preparing
                        </button>
                      )}

                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'READY')}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs"
                        >
                          Mark Ready
                        </button>
                      )}

                      {order.status === 'READY' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                        >
                          Mark Completed
                        </button>
                      )}

                      {(order.status === 'COMPLETED' || order.status === 'CANCELLED') && (
                        <span className="text-xs text-slate-300 font-medium">Done</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
