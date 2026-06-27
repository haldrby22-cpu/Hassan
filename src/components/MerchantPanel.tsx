import React, { useState } from 'react';
import { Shop, MenuItem, Order, OrderStatus } from '../types';
import {
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Package,
  Check,
  Utensils,
  MapPin,
  Phone,
  MessageSquare
} from 'lucide-react';

interface MerchantPanelProps {
  shops: Shop[];
  orders: Order[];
  menuItems: MenuItem[];
  onAddMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, progress: number) => void;
  onUpdateShop: (shop: Shop) => void;
  onExitPortal?: () => void;
}

export default function MerchantPanel({
  shops,
  orders,
  menuItems,
  onAddMenuItem,
  onDeleteMenuItem,
  onUpdateOrderStatus,
  onUpdateShop,
  onExitPortal,
}: MerchantPanelProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('merchant_authenticated') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Isolation State
  const [isIsolatedMode, setIsIsolatedMode] = useState(() => {
    const saved = localStorage.getItem('merchant_is_isolated');
    if (saved === 'true') return true;
    
    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    return params.has('shopId');
  });

  // Login Tabs & Selected shop for login
  const [loginTab, setLoginTab] = useState<'general' | 'specific'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('shopId') ? 'specific' : 'general';
  });

  const [loginShopId, setLoginShopId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlShopId = params.get('shopId');
    return urlShopId || (shops[0]?.id || '');
  });

  // Selected Shop to Manage
  const [selectedShopId, setSelectedShopId] = useState<string>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlShopId = urlParams.get('shopId');
    if (urlShopId) {
      return urlShopId;
    }
    const saved = localStorage.getItem('merchant_selected_shop_id');
    return saved || (shops[0]?.id || '');
  });

  // Save selected shop ID when changed
  const handleSelectShop = (shopId: string) => {
    setSelectedShopId(shopId);
    localStorage.setItem('merchant_selected_shop_id', shopId);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginTab === 'general') {
      if (username.trim() === 'merchant' && password.trim() === 'merchant') {
        setIsAuthenticated(true);
        setIsIsolatedMode(false);
        localStorage.setItem('merchant_authenticated', 'true');
        localStorage.setItem('merchant_is_isolated', 'false');
        setLoginError('');
      } else {
        setLoginError('اسم المستخدم أو كلمة المرور للمشرف غير صحيحة!');
      }
    } else {
      const matchedShop = shops.find((s) => s.id === loginShopId);
      if (!matchedShop) {
        setLoginError('المطعم المحدد غير موجود!');
        return;
      }

      const cleanPassword = password.trim();
      const isCorrectPassword = 
        cleanPassword === '123456' || 
        cleanPassword === 'merchant' || 
        cleanPassword === matchedShop.name ||
        (matchedShop.password && cleanPassword === matchedShop.password.trim());

      if (isCorrectPassword) {
        setIsAuthenticated(true);
        setIsIsolatedMode(true);
        setSelectedShopId(loginShopId);
        
        localStorage.setItem('merchant_authenticated', 'true');
        localStorage.setItem('merchant_is_isolated', 'true');
        localStorage.setItem('merchant_selected_shop_id', loginShopId);
        setLoginError('');
      } else {
        setLoginError('كلمة المرور غير صحيحة! يرجى التأكد من البيانات المدخلة.');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsIsolatedMode(false);
    localStorage.removeItem('merchant_authenticated');
    localStorage.removeItem('merchant_is_isolated');
    setUsername('');
    setPassword('');
  };

  // Get active managed shop
  const activeShop = shops.find((s) => s.id === selectedShopId) || shops[0];

  // Forms state for adding products
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemRating, setItemRating] = useState('4.8');
  const [isPopular, setIsPopular] = useState(false);
  const [itemError, setItemError] = useState('');
  const [itemSuccess, setItemSuccess] = useState('');

  // Filter orders and products for the selected shop
  const shopOrders = orders.filter((o) => o.shopId === activeShop?.id);
  const shopProducts = menuItems.filter((m) => m.shopId === activeShop?.id);

  // Stats
  const completedOrders = shopOrders.filter((o) => o.status === 'delivered');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total - o.deliveryFee), 0);
  const pendingOrders = shopOrders.filter((o) => o.status !== 'delivered');

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    setItemError('');
    setItemSuccess('');

    if (!activeShop) {
      setItemError('الرجاء اختيار أو إنشاء متجر أولاً');
      return;
    }
    if (!itemName.trim()) {
      setItemError('الرجاء إدخال اسم المنتج');
      return;
    }
    if (!itemPrice.trim() || isNaN(parseFloat(itemPrice))) {
      setItemError('الرجاء إدخال سعر صحيح للمنتج');
      return;
    }

    const imgUrl = itemImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      shopId: activeShop.id,
      name: itemName.trim(),
      description: itemDescription.trim() || 'مكونات طازجة ومحضرة بعناية فائقة عند الطلب بفرشوط.',
      price: parseFloat(itemPrice),
      image: imgUrl,
      rating: parseFloat(itemRating) || 4.8,
      popular: isPopular,
    };

    onAddMenuItem(newItem);
    setItemSuccess(`تمت إضافة منتج "${newItem.name}" بنجاح!`);

    // Reset Form
    setItemName('');
    setItemDescription('');
    setItemPrice('');
    setItemImage('');
    setIsPopular(false);
  };

  // Toggle open / closed shop status
  const handleToggleShopStatus = () => {
    if (!activeShop) return;
    // We can simulate an open/closed toggle using tags or we can store status.
    // Let's add a dynamic property or customize distance/rating.
    // But better yet, let's toggle a tag like 'closed' or manage status on the shop!
    // Since we added onUpdateShop, let's change a simulated property on shop.
    // Let's add 'isOpen' tag or modify tags list.
    const isCurrentlyClosed = activeShop.tags.includes('مغلق_مؤقتا');
    let updatedTags = [...activeShop.tags];
    if (isCurrentlyClosed) {
      updatedTags = updatedTags.filter(t => t !== 'مغلق_مؤقتا');
    } else {
      updatedTags.push('مغلق_مؤقتا');
    }

    const updatedShop: Shop = {
      ...activeShop,
      tags: updatedTags,
    };
    onUpdateShop(updatedShop);
  };

  const isClosed = activeShop?.tags.includes('مغلق_مؤقتا') || false;

  if (!isAuthenticated) {
    const isDeepLink = new URLSearchParams(window.location.search).has('shopId');
    const matchedDeepLinkShop = shops.find(s => s.id === loginShopId);

    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-3xl">
            🏪
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">بوابة شركاء فرشوط (المطاعم)</h2>
          <p className="text-xs text-slate-400">سجل دخولك الآن لإدارة متجرك، وتلقي الطلبات وتحضيرها فوراً</p>
        </div>

        {/* Deep Link Notice or Tab Switcher */}
        {isDeepLink && matchedDeepLinkShop ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-xs text-red-800 space-y-1 text-center">
            <p className="font-bold flex items-center justify-center gap-1.5">
              <span>🔗</span>
              <span>رابط دخول مباشر للمطعم:</span>
            </p>
            <p className="font-extrabold text-sm text-red-600 mt-1">{matchedDeepLinkShop.name}</p>
            <p className="text-[10px] text-slate-400">تم تفعيل الدخول المنفصل لهذا المطعم فقط.</p>
          </div>
        ) : (
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                setLoginTab('general');
                setLoginError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                loginTab === 'general'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              💼 حساب رئيسي (كل الفروع)
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginTab('specific');
                setLoginError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                loginTab === 'specific'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              🏪 مطعم محدد منفصل
            </button>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {loginTab === 'general' ? (
            /* General Merchant Login */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>اسم المستخدم للمشرف</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم للمشرف"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-red-400 bg-slate-50/50"
                  required
                />
              </div>
            </div>
          ) : (
            /* Specific Restaurant Login */
            <div className="space-y-4">
              {!isDeepLink && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Store className="h-3.5 w-3.5 text-red-500" />
                    <span>اختر المطعم المراد إدارته</span>
                  </label>
                  <select
                    value={loginShopId}
                    onChange={(e) => setLoginShopId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 bg-slate-50/50 focus:outline-none focus:border-red-400"
                  >
                    {shops.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Password field */}
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
                placeholder="أدخل كلمة المرور"
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
            className="w-full bg-red-500 text-white rounded-xl py-3 text-sm font-bold shadow-md hover:bg-red-600 transition-colors cursor-pointer"
          >
            تسجيل الدخول الآمن للمتجر
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
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-2xl bg-red-500 text-white flex items-center justify-center text-3xl">
            🏪
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">بوابة التاجر وإدارة المطاعم</h2>
            <p className="text-xs text-slate-400 mt-1">تحكّم بمتجرك، استقبل طلبات زبائن فرشوط وحضّرها بكل سهولة</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {isIsolatedMode ? (
            <div className="bg-red-50 text-red-600 text-xs font-extrabold px-3.5 py-2 rounded-xl border border-red-100 flex items-center gap-1">
              <span>🏪 فرع منفصل:</span>
              <span className="underline">{activeShop?.name}</span>
            </div>
          ) : (
            /* Shop Selector Dropdown */
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">المتجر الحالي:</span>
              <select
                value={selectedShopId}
                onChange={(e) => handleSelectShop(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-red-400"
              >
                {shops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="px-3 py-2 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100/80 rounded-xl transition-all cursor-pointer flex items-center gap-1"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {activeShop ? (
        <div className="space-y-8">
          {/* Direct Link Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-lg shrink-0">
                  🔗
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">رابط الدخول المباشر لإدارة هذا المطعم</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">انسخ هذا الرابط وشاركه مع كاشير أو مدير المطعم للدخول الآمن والمباشر لفرعه فقط دون إمكانية التبديل للمطاعم الأخرى.</p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border border-white/5">
              <span className="font-mono text-xs select-all truncate text-slate-300 px-1 pt-1 text-left" style={{ direction: 'ltr' }}>
                {window.location.origin + window.location.pathname}?role=merchant&shopId={activeShop.id}
              </span>
              <button
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}?role=merchant&shopId=${activeShop.id}`;
                  navigator.clipboard.writeText(url);
                  alert('تم نسخ الرابط المباشر للمطعم بنجاح! يمكنك مشاركته الآن.');
                }}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 text-center"
              >
                نسخ الرابط المباشر
              </button>
            </div>
          </div>

          {/* Shop Control Card & Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Shop Toggle */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 block">حالة استقبال الطلبات</span>
                <span className={`text-base font-extrabold mt-1 block ${isClosed ? 'text-red-500' : 'text-emerald-500'}`}>
                  {isClosed ? '🔴 مغلق مؤقتاً' : '🟢 مفتوح ويستقبل طلبات'}
                </span>
              </div>
              <button
                onClick={handleToggleShopStatus}
                className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isClosed
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
                }`}
              >
                {isClosed ? 'فتح استقبال الطلبات' : 'إغلاق مؤقت للمحل'}
              </button>
            </div>

            {/* Stat 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl shrink-0">
                ⌛
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block">طلبات قيد التجهيز</span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">{pendingOrders.length} طلب</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl shrink-0">
                ✅
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block">الطلبات المكتملة</span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">{completedOrders.length} طلب</span>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center text-xl shrink-0">
                💰
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 block">صافي مبيعات المتجر</span>
                <span className="text-xl font-extrabold text-slate-800 mt-1 block">{totalRevenue} ج.م</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Live Orders Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                  <Package className="h-5 w-5 text-red-500" />
                  <span>الطلبات الحالية لـ ({activeShop.name})</span>
                </h3>
                <span className="bg-red-50 text-red-500 text-xs px-2.5 py-1 rounded-full font-bold">
                  تحديث مباشر
                </span>
              </div>

              {shopOrders.length === 0 ? (
                <div className="bg-white text-center py-12 rounded-3xl border border-slate-100 shadow-sm p-6">
                  <span className="text-4xl block mb-3">📭</span>
                  <h4 className="font-bold text-slate-700 text-sm">لا توجد طلبات واردة لهذا المتجر حالياً</h4>
                  <p className="text-xs text-slate-400 mt-1">عندما يقوم العميل بطلب وجبة من متجرك، ستظهر تفاصيل الطلب هنا لتجهيزها فوراً.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shopOrders.map((order) => {
                    const stepIndex = order.status === 'received' ? 0 : order.status === 'preparing' ? 1 : order.status === 'on_the_way' ? 2 : 3;

                    return (
                      <div key={order.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        {/* Order Header */}
                        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-xs text-slate-400 font-bold block">رقم الطلب</span>
                            <span className="font-extrabold text-sm text-slate-800">#{order.id}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 font-bold block">وقت الطلب</span>
                            <span className="font-bold text-xs text-slate-600">{order.date}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400 font-bold block">الحالة الحالية</span>
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full mt-0.5 ${
                              order.status === 'received' ? 'bg-amber-50 text-amber-600' :
                              order.status === 'preparing' ? 'bg-blue-50 text-blue-600' :
                              order.status === 'on_the_way' ? 'bg-orange-50 text-orange-600' :
                              'bg-emerald-50 text-emerald-600'
                            }`}>
                              <span>{
                                order.status === 'received' ? '🔔 طلب جديد' :
                                order.status === 'preparing' ? '🍳 قيد التحضير' :
                                order.status === 'on_the_way' ? '🛵 مع الكابتن' :
                                '🎁 تم التسليم'
                              }</span>
                            </span>
                          </div>
                        </div>

                        {/* Order Contents */}
                        <div className="p-6 space-y-4">
                          {/* Items List */}
                          <div className="divide-y divide-slate-100">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="h-6 w-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                                    {item.quantity}x
                                  </span>
                                  <span className="font-bold text-slate-700">{item.name}</span>
                                </div>
                                <span className="font-mono text-slate-500">{item.price * item.quantity} ج.م</span>
                              </div>
                            ))}
                          </div>

                          {/* Client & Delivery Info */}
                          <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="font-bold">عنوان التوصيل:</span>
                              <span className="text-slate-500">{order.address}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="font-bold">رقم الهاتف:</span>
                              <span className="text-slate-500 font-mono">{order.phone}</span>
                            </div>
                            {order.notes && (
                              <div className="flex items-start gap-1.5">
                                <MessageSquare className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span className="font-bold">ملاحظات العميل:</span>
                                <span className="text-red-500 font-medium">{order.notes}</span>
                              </div>
                            )}
                          </div>

                          {/* Order Price Summary */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="text-xs font-bold text-slate-500">مجموع الوجبات (مبيعاتك):</span>
                            <span className="font-extrabold text-sm text-slate-800">{order.subtotal - order.discount} ج.م</span>
                          </div>

                          {/* Control Actions */}
                          {order.status === 'received' && (
                            <div className="pt-4 flex gap-2">
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, 'preparing', 33)}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-50"
                              >
                                <Utensils className="h-4 w-4" />
                                <span>👨‍🍳 قبول الطلب وبدء التجهيز</span>
                              </button>
                            </div>
                          )}

                          {order.status === 'preparing' && (
                            <div className="pt-4 bg-amber-50 rounded-2xl p-4 text-xs text-amber-800 font-bold flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                                <span>الوجبة قيد التحضير الآن!</span>
                              </span>
                              <span className="text-[11px] text-amber-600 font-medium">بانتظار قبول التوصيل من كابتن طيار 🛵</span>
                            </div>
                          )}

                          {order.status === 'on_the_way' && (
                            <div className="pt-4 bg-orange-50 rounded-2xl p-4 text-xs text-orange-800 font-bold flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <span>🛵</span>
                                <span>الطلب مع كابتن التوصيل في الطريق للعميل</span>
                              </span>
                            </div>
                          )}

                          {order.status === 'delivered' && (
                            <div className="pt-2 flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                              <Check className="h-4 w-4 shrink-0 bg-emerald-100 rounded-full p-0.5" />
                              <span>اكتمل التوصيل بنجاح وتم تحصيل {order.subtotal - order.discount} ج.م مبيعات!</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Menu Management Column */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                <Utensils className="h-5 w-5 text-red-500" />
                <span>إضافة وتعديل منتجات المتجر</span>
              </h3>

              {/* Add Product Form */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h4 className="font-extrabold text-sm text-slate-700 flex items-center gap-1.5">
                  <Plus className="h-4 w-4 text-red-500" />
                  <span>إضافة وجبة / منتج جديد</span>
                </h4>

                <form onSubmit={handleCreateMenuItem} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">اسم المنتج/الوجبة *</label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="مثال: بيتزا الفصول الأربعة"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-400 bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">السعر (ج.م) *</label>
                      <input
                        type="text"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        placeholder="مثال: 120"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-400 bg-white font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500">التقييم المقدر</label>
                      <input
                        type="text"
                        value={itemRating}
                        onChange={(e) => setItemRating(e.target.value)}
                        placeholder="4.8"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-400 bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">رابط صورة الوجبة (اختياري)</label>
                    <input
                      type="url"
                      value={itemImage}
                      onChange={(e) => setItemImage(e.target.value)}
                      placeholder="رابط الصورة المباشر من الإنترنت"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-400 bg-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">وصف المكونات</label>
                    <textarea
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      placeholder="اكتب تفاصيل ومكونات الوجبة لجذب الزبائن..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-400 bg-white h-16 resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                      className="rounded border-slate-300 text-red-500 focus:ring-red-400"
                    />
                    <label htmlFor="isPopular" className="text-xs font-bold text-slate-600 cursor-pointer">
                      تمييز هذا المنتج كـ "أكثر طلباً 🔥"
                    </label>
                  </div>

                  {itemError && (
                    <p className="text-[11px] text-red-500 font-bold bg-red-50 p-2 rounded-lg">{itemError}</p>
                  )}
                  {itemSuccess && (
                    <p className="text-[11px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded-lg">{itemSuccess}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    إضافة المنتج لقائمة المتجر
                  </button>
                </form>
              </div>

              {/* Menu List & Deletion */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <h4 className="font-extrabold text-sm text-slate-800">قائمة منتجات المتجر الحالية ({shopProducts.length})</h4>
                {shopProducts.length === 0 ? (
                  <p className="text-xs text-slate-400">لا يوجد منتجات في قائمة المتجر بعد، أضف أول وجبة من النموذج أعلاه!</p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                    {shopProducts.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-slate-700 block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{item.price} ج.م</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteMenuItem(item.id)}
                          className="h-8 w-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                          title="حذف المنتج"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white text-center py-12 rounded-3xl border border-slate-100 shadow-sm p-6 max-w-md mx-auto">
          <span className="text-4xl block mb-2">🏪</span>
          <h4 className="font-bold text-slate-700">لا توجد متاجر لإدارتها</h4>
          <p className="text-xs text-slate-400 mt-1">يرجى الذهاب للوحة التحكم أولاً لإضافة متجر جديد بفرشوط.</p>
        </div>
      )}
    </div>
  );
}
