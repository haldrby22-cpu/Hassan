import { History, Calendar, ShieldAlert, ArrowLeftRight, Clock, Star } from 'lucide-react';
import { Order } from '../types';

interface OrderHistoryProps {
  orders: Order[];
  onReorder: (order: Order) => void;
  onTrack: (order: Order) => void;
}

export default function OrderHistory({ orders, onReorder, onTrack }: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-400">
          <History className="h-10 w-10 stroke-[1.5]" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد طلبات سابقة</h3>
        <p className="text-sm text-slate-400 text-center max-w-xs leading-relaxed">
          لم تقم بأي عملية شراء حتى الآن. اطلب وجبتك اللذيذة أو مستلزماتك الآن وستظهر هنا!
        </p>
      </div>
    );
  }

  // Get status badge styles
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full text-xs font-bold">
            بانتظار التأكيد
          </span>
        );
      case 'preparing':
        return (
          <span className="bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
            جاري التحضير
          </span>
        );
      case 'on_the_way':
        return (
          <span className="bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-1 rounded-full text-xs font-bold">
            السائق في الطريق
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full text-xs font-bold">
            تم التوصيل ✓
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2">
        <History className="h-5 w-5 text-red-500" />
        <h3 className="font-extrabold text-lg text-slate-800">سجل الطلبات السابقة</h3>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const totalItemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);

          return (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-red-50 transition-all duration-300"
            >
              {/* Top Row: Shop Details and Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <img
                    src={order.shopImage}
                    alt={order.shopName}
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 object-cover rounded-xl bg-slate-50 border border-slate-100"
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">{order.shopName}</h4>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{order.date}</span>
                      </div>
                      {order.isScheduled && (
                        <div className="inline-flex items-center gap-1 text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded-md font-bold w-max">
                          <span>📅 طلب مجدول: {order.scheduledDate} ({order.scheduledTime})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Items Summary and Total Pricing */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-1">المنتجات المشمولة ({totalItemsCount}):</p>
                  <p className="text-sm text-slate-600 font-medium line-clamp-1">
                    {order.items.map((i) => `${i.name} (x${i.quantity})`).join(' ، ')}
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <p className="text-xs text-slate-400 font-bold mb-0.5">القيمة الإجمالية</p>
                  <p className="text-base font-extrabold text-red-500">{order.total} ج.م</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-50">
                {order.status !== 'delivered' && (
                  <button
                    onClick={() => onTrack(order)}
                    className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Clock className="h-4 w-4" />
                    <span>تتبع الطلب المباشر</span>
                  </button>
                )}
                <button
                  onClick={() => onReorder(order)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-500 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  <span>إعادة طلب السلة</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
