import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import {
  Bike,
  Navigation,
  CheckCircle,
  Clock,
  Phone,
  MessageSquare,
  DollarSign,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LogOut,
  MapPin,
  Check,
  ChevronRight,
  TrendingUp,
  Map,
  ShieldCheck
} from 'lucide-react';

interface DriverPanelProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, progress: number) => void;
  onExitPortal?: () => void;
}

export default function DriverPanel({ orders, onUpdateOrderStatus, onExitPortal }: DriverPanelProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('driver_authenticated') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Driver Profile & Wallet state (persisted)
  const [driverName, setDriverName] = useState(() => {
    return localStorage.getItem('driver_name') || 'كابتن محمود الهواري';
  });
  const [earnings, setEarnings] = useState<number>(() => {
    const saved = localStorage.getItem('driver_earnings');
    return saved ? parseFloat(saved) : 0;
  });
  const [deliveriesCount, setDeliveriesCount] = useState<number>(() => {
    const saved = localStorage.getItem('driver_deliveries_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Keep track of the active order currently claimed by this specific driver
  const [activeClaimedOrderId, setActiveClaimedOrderId] = useState<string | null>(() => {
    return localStorage.getItem('driver_active_claimed_order_id') || null;
  });

  // Save driver settings
  useEffect(() => {
    localStorage.setItem('driver_name', driverName);
  }, [driverName]);

  useEffect(() => {
    localStorage.setItem('driver_earnings', earnings.toString());
  }, [earnings]);

  useEffect(() => {
    localStorage.setItem('driver_deliveries_count', deliveriesCount.toString());
  }, [deliveriesCount]);

  useEffect(() => {
    if (activeClaimedOrderId) {
      localStorage.setItem('driver_active_claimed_order_id', activeClaimedOrderId);
    } else {
      localStorage.removeItem('driver_active_claimed_order_id');
    }
  }, [activeClaimedOrderId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'driver' && password.trim() === 'driver') {
      setIsAuthenticated(true);
      localStorage.setItem('driver_authenticated', 'true');
      setLoginError('');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة! يرجى إدخال البيانات الافتراضية.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('driver_authenticated');
    setUsername('');
    setPassword('');
  };

  // Find the active order object that is claimed by this driver
  const claimedOrder = orders.find((o) => o.id === activeClaimedOrderId);

  // If claimed order status becomes delivered, reset active claimed order
  useEffect(() => {
    if (claimedOrder && claimedOrder.status === 'delivered') {
      setActiveClaimedOrderId(null);
    }
  }, [claimedOrder]);

  // Available orders: status is either 'received' or 'preparing', and NOT claimed already
  const availableOrders = orders.filter(
    (o) => (o.status === 'received' || o.status === 'preparing') && o.id !== activeClaimedOrderId
  );

  const handleClaimOrder = (orderId: string) => {
    if (activeClaimedOrderId) {
      alert('لديك طلب نشط بالفعل! يرجى تسليمه أولاً قبل قبول طلب آخر.');
      return;
    }
    setActiveClaimedOrderId(orderId);
    // When the driver accepts, the order status changes to 'on_the_way' (Captains Picked up)
    onUpdateOrderStatus(orderId, 'on_the_way', 66);
  };

  const handleCompleteDelivery = (order: Order) => {
    // 1. Mark order as delivered (status 'delivered', progress 100)
    onUpdateOrderStatus(order.id, 'delivered', 100);

    // 2. Add delivery fee to driver's wallet
    const feeEarned = order.deliveryFee || 20; // default to 20 if none
    setEarnings((prev) => prev + feeEarned);
    setDeliveriesCount((prev) => prev + 1);

    // 3. Clear claimed order
    setActiveClaimedOrderId(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl">
            🏍️
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">بوابة كباتن فرشوط (الطيار)</h2>
          <p className="text-xs text-slate-400">سجل دخولك لبدء استقبال طلبات التوصيل وزيادة أرباحك اليومية بفرشوط</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>اسم المستخدم للطيار</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="مثال: driver"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-red-400 bg-slate-50/50"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" />
              <span>كلمة المرور</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="مثال: driver"
                className="w-full rounded-xl border border-slate-200 pl-11 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-red-400 bg-slate-50/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {loginError && (
            <div className="flex items-start gap-2 bg-red-50 text-red-500 p-3 rounded-xl text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-900 text-white rounded-xl py-3 text-sm font-bold shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
          >
            تسجيل الدخول ككابتن توصيل
          </button>
        </form>

        {onExitPortal && (
          <button
            type="button"
            onClick={onExitPortal}
            className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>⬅️</span>
            <span>الرجوع لشاشة اختيار البوابة الرئيسية</span>
          </button>
        )}

        <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <span>💡</span>
            <span>بيانات تجربة حساب الطيار / الكابتن:</span>
          </p>
          <div className="font-mono text-[11px] text-amber-700/90 flex flex-col gap-0.5 mt-1.5 bg-white/50 p-2 rounded-lg border border-amber-50">
            <div>اسم المستخدم: <span className="font-bold select-all bg-amber-100/50 px-1 rounded">driver</span></div>
            <div>كلمة المرور: <span className="font-bold select-all bg-amber-100/50 px-1 rounded">driver</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Driver Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-3xl">
            🏍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="font-extrabold text-lg text-slate-800 bg-transparent border-b border-dashed border-slate-200 focus:outline-none focus:border-slate-500 py-0.5"
                title="اضغط لتغيير اسم الكابتن"
              />
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">
                كابتن نشط 🟢
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">تتبع المسارات، استلام الطلبات، توصيل فوري بمركز فرشوط</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-3 py-2 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100/80 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 self-end md:self-auto"
        >
          <LogOut className="h-4 w-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>

      {/* Driver Stats/Wallet Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat 1: Wallet Balance */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block">المحفظة / أرباح التوصيل اليومية</span>
            <span className="text-2xl font-black text-white mt-1 block">{earnings} ج.م</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center text-2xl">
            💵
          </div>
        </div>

        {/* Stat 2: Deliveries Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block">إجمالي الرحلات المكتملة</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{deliveriesCount} رحلة</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center text-xl">
            🏁
          </div>
        </div>

        {/* Stat 3: Speed Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 block">تقييم الكابتن وسرعة القيادة</span>
            <span className="text-2xl font-black text-yellow-500 mt-1 block">4.9 ★★★★★</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-yellow-50 text-yellow-500 flex items-center justify-center text-xl">
            ⚡
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Main Active Delivery Column */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-red-500 animate-bounce" />
            <span>الطلب النشط الجاري توصيله</span>
          </h3>

          {claimedOrder ? (
            <div className="bg-white rounded-3xl border-2 border-slate-950 p-6 space-y-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 font-bold block">رقم طلب التوصيل</span>
                  <span className="font-black text-base text-slate-800">#{claimedOrder.id}</span>
                </div>
                <div className="bg-orange-50 text-orange-600 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
                  <span>جاري التوصيل الآن للعميل</span>
                </div>
              </div>

              {/* Delivery Locations */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 block">خريطة ومسار التوصيل الموصى به:</span>
                <div className="relative pr-5 border-r-2 border-dashed border-slate-200 space-y-5">
                  {/* Point A: Merchant */}
                  <div className="relative">
                    <span className="absolute -right-[27px] top-1 h-3.5 w-3.5 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">A</span>
                    <h4 className="font-bold text-xs text-slate-500">نقطة الاستلام (المتجر):</h4>
                    <p className="font-extrabold text-sm text-slate-800 mt-0.5">{claimedOrder.shopName}</p>
                    <p className="text-xs text-slate-400">فرشوط - محافظة قنا</p>
                  </div>

                  {/* Point B: Customer Address */}
                  <div className="relative">
                    <span className="absolute -right-[27px] top-1 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">B</span>
                    <h4 className="font-bold text-xs text-slate-500">نقطة التسليم (العميل):</h4>
                    <p className="font-extrabold text-sm text-slate-800 mt-0.5">{claimedOrder.address}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <a
                        href={`tel:${claimedOrder.phone}`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        <span>اتصال بالعميل: {claimedOrder.phone}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes or items info */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="font-bold">المطلوب تحصيله من العميل:</span>
                  <span className="font-black text-slate-900 text-sm">{claimedOrder.total} ج.م</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span className="font-bold">أجرتك للتوصيل (تضاف لمحفظتك):</span>
                  <span className="font-black text-emerald-600 text-sm">+{claimedOrder.deliveryFee} ج.م</span>
                </div>
                {claimedOrder.notes && (
                  <div className="pt-2 border-t border-slate-100 flex gap-1.5 text-xs text-red-500 font-bold">
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span>ملاحظة مهمة: {claimedOrder.notes}</span>
                  </div>
                )}
              </div>

              {/* Complete Delivery Button */}
              <button
                onClick={() => handleCompleteDelivery(claimedOrder)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl py-3.5 text-sm font-extrabold shadow-md shadow-emerald-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="h-5 w-5 bg-white/20 rounded-full p-0.5" />
                <span>✅ تم تسليم الوجبة بنجاح وتحصيل المبلغ</span>
              </button>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 text-center py-16 rounded-3xl p-6">
              <span className="text-4xl block mb-4">🛵</span>
              <h4 className="font-bold text-slate-700 text-sm">لا يوجد لديك أي طلب جاري توصيله حالياً</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                اختر طلباً من قائمة "الطلبات المتاحة بفرشوط" في العمود المجاور لتبدأ مسار التوصيل وكسب أجر التوصيل!
              </p>
            </div>
          )}
        </div>

        {/* Right/Available Requests Feed Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
              <Bike className="h-5 w-5 text-slate-700" />
              <span>الطلبات المتاحة للتوصيل بفرشوط ({availableOrders.length})</span>
            </h3>
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
              محدث فوراً
            </span>
          </div>

          {availableOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center py-12">
              <span className="text-3xl block mb-3">🏁</span>
              <h4 className="font-bold text-slate-700 text-sm">لا توجد طلبات معلقة بفرشوط حالياً</h4>
              <p className="text-xs text-slate-400 mt-1">تظهر طلبات المطاعم والبقالات بمجرد قيام العملاء بالشراء في فرشوط.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {availableOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-50 text-xs">
                    <div>
                      <span className="font-extrabold text-slate-800">طلب #{order.id}</span>
                      <span className="text-slate-400 block text-[10px]">{order.date}</span>
                    </div>
                    <span className="font-black text-red-500 font-mono">أجرة التوصيل: {order.deliveryFee} ج.م</span>
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-600">
                    <div>
                      <span className="font-bold text-slate-400">من:</span> <span className="font-extrabold text-slate-700">{order.shopName}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400">إلى:</span> <span className="font-bold text-slate-700">{order.address}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleClaimOrder(order.id)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>🎯 قبول توصيل الطلب واستلامه</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
