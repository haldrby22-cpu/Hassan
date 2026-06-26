import { useState, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  History,
  TrendingUp,
  MapPin,
  Compass,
  ArrowRight,
  Sparkles,
  Utensils,
  Coffee,
  Store,
  ChevronLeft,
  Check,
  Clock,
  Heart,
  X,
  User,
  Smartphone,
  Download,
  Share2,
  LogOut
} from 'lucide-react';

import { SHOPS, MENU_ITEMS } from './data';
import { Shop, MenuItem, CartItem, Order, CategoryType, OrderStatus, PromoCode } from './types';
import ShopCard from './components/ShopCard';
import ItemCard from './components/ItemCard';
import Cart from './components/Cart';
import OrderTracker from './components/OrderTracker';
import OrderHistory from './components/OrderHistory';
import AdminPanel from './components/AdminPanel';
import MerchantPanel from './components/MerchantPanel';
import DriverPanel from './components/DriverPanel';
import AndroidBuilder from './components/AndroidBuilder';
import RegisterModal from './components/RegisterModal';

export default function App() {
  // Authentication & Portal selection state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role');
    if (urlRole === 'customer' || urlRole === 'merchant' || urlRole === 'driver' || urlRole === 'admin') {
      localStorage.setItem('portal_role', urlRole);
      localStorage.setItem('talabat_is_logged_in', 'true');
      return true;
    }
    return localStorage.getItem('talabat_is_logged_in') === 'true';
  });

  // Portal Roles: 'customer' | 'merchant' | 'driver' | 'admin'
  const [currentRole, setCurrentRole] = useState<'customer' | 'merchant' | 'driver' | 'admin'>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role');
    if (urlRole === 'customer' || urlRole === 'merchant' || urlRole === 'driver' || urlRole === 'admin') {
      localStorage.setItem('portal_role', urlRole);
      return urlRole;
    }
    return (localStorage.getItem('portal_role') as 'customer' | 'merchant' | 'driver' | 'admin') || 'customer';
  });

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<'explore' | 'cart' | 'history' | 'tracking' | 'account'>('explore');
  const [isAndroidBuilderOpen, setIsAndroidBuilderOpen] = useState(false);

  // Customer registration/account verification states
  const [customerAccount, setCustomerAccount] = useState<{ name: string; phone: string; address: string; password?: string } | null>(() => {
    const saved = localStorage.getItem('customer_account_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [pendingCheckoutData, setPendingCheckoutData] = useState<{
    address: string;
    phone: string;
    paymentMethod: string;
    notes: string;
    appliedPromo?: PromoCode;
    discountAmount?: number;
  } | null>(null);

  // Live clock for Android status bar simulation
  const [statusBarTime, setStatusBarTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setStatusBarTime(`${hours % 12 || 12}:${minutes} ${hours >= 12 ? 'م' : 'ص'}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('restaurants');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);

  // Shops and Menu Items
  const [shops, setShops] = useState<Shop[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const savedShops = localStorage.getItem('talabat_shops');
      if (savedShops) {
        setShops(JSON.parse(savedShops));
      } else {
        setShops(SHOPS);
      }

      const savedMenuItems = localStorage.getItem('talabat_menu_items');
      if (savedMenuItems) {
        setMenuItems(JSON.parse(savedMenuItems));
      } else {
        setMenuItems(MENU_ITEMS);
      }

      const savedCart = localStorage.getItem('talabat_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedOrders = localStorage.getItem('talabat_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedActiveOrderId = localStorage.getItem('talabat_active_order_id');
      if (savedActiveOrderId) setActiveOrderId(savedActiveOrderId);
    } catch (e) {
      console.error('Failed to load local storage state', e);
    }
  }, []);

  // Save state to local storage when changed
  useEffect(() => {
    if (shops.length > 0) {
      localStorage.setItem('talabat_shops', JSON.stringify(shops));
    }
  }, [shops]);

  useEffect(() => {
    if (menuItems.length > 0) {
      localStorage.setItem('talabat_menu_items', JSON.stringify(menuItems));
    }
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('talabat_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('talabat_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('talabat_active_order_id', activeOrderId);
    } else {
      localStorage.removeItem('talabat_active_order_id');
    }
  }, [activeOrderId]);

  // Admin Handlers
  const handleAddShop = (newShop: Shop) => {
    setShops([newShop, ...shops]);
    showToast(`تمت إضافة المتجر "${newShop.name}" بنجاح`, 'success');
  };

  const handleDeleteShop = (shopId: string) => {
    const deletedShop = shops.find((s) => s.id === shopId);
    setShops(shops.filter((s) => s.id !== shopId));
    // Also delete any menu items associated with this shop
    setMenuItems(menuItems.filter((m) => m.shopId !== shopId));
    if (deletedShop) {
      showToast(`تم حذف المتجر "${deletedShop.name}" وجميع منتجاته`, 'info');
    }
    if (selectedShopId === shopId) {
      setSelectedShopId(null);
    }
  };

  const handleAddMenuItem = (newItem: MenuItem) => {
    setMenuItems([newItem, ...menuItems]);
    showToast(`تمت إضافة المنتج "${newItem.name}" بنجاح`, 'success');
  };

  const handleDeleteMenuItem = (itemId: string) => {
    const deletedItem = menuItems.find((m) => m.id === itemId);
    setMenuItems(menuItems.filter((m) => m.id !== itemId));
    if (deletedItem) {
      showToast(`تم حذف المنتج "${deletedItem.name}"`, 'info');
    }
  };

  // Show dynamic toast
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Helper: Get Active Order
  const activeOrder = orders.find((o) => o.id === activeOrderId);

  // Cart Handlers
  const handleAddToCart = (item: MenuItem) => {
    const existing = cart.find((i) => i.item.id === item.id);
    if (existing) {
      setCart(cart.map((i) => (i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    showToast(`تمت إضافة "${item.name}" إلى السلة`);
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    const existing = cart.find((i) => i.item.id === item.id);
    if (!existing) return;

    if (existing.quantity === 1) {
      setCart(cart.filter((i) => i.item.id !== item.id));
      showToast(`تمت إزالة "${item.name}" من السلة`, 'info');
    } else {
      setCart(cart.map((i) => (i.item.id === item.id ? { ...i, quantity: i.quantity - 1 } : i)));
    }
  };

  const handleUpdateCartQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      const itemToRemove = cart.find((i) => i.item.id === itemId);
      setCart(cart.filter((i) => i.item.id !== itemId));
      if (itemToRemove) {
        showToast(`تمت إزالة "${itemToRemove.item.name}" من السلة`, 'info');
      }
    } else {
      setCart(cart.map((i) => (i.item.id === itemId ? { ...i, quantity: newQty } : i)));
    }
  };

  const handleClearCart = () => {
    setCart([]);
    showToast('تم إفراغ السلة بالكامل', 'info');
  };

  // Complete User Registration & execute pending checkout if any
  const handleRegisterUser = (name: string, phone: string, address: string, password?: string) => {
    const newAccount = { name, phone, address, password };
    setCustomerAccount(newAccount);
    localStorage.setItem('customer_account_data', JSON.stringify(newAccount));
    setIsRegisterModalOpen(false);
    
    showToast('تم تسجيل حسابك وتفعيله بنجاح بمركز فرشوط! 🎉', 'success');

    if (pendingCheckoutData) {
      const data = pendingCheckoutData;
      setPendingCheckoutData(null);
      
      // Directly complete the checkout with the newly verified details
      setTimeout(() => {
        // We call helper checkout with registered values
        executeOrderCheckout(
          data.address || address,
          data.phone || phone,
          data.paymentMethod,
          data.notes,
          data.appliedPromo,
          data.discountAmount
        );
      }, 300);
    }
  };

  // Checkout Handler
  const handleCheckout = (
    address: string,
    phone: string,
    paymentMethod: string,
    notes: string,
    appliedPromo?: PromoCode,
    discountAmount?: number
  ) => {
    // Intercept checkout if not registered yet!
    if (!customerAccount) {
      setPendingCheckoutData({ address, phone, paymentMethod, notes, appliedPromo, discountAmount });
      setIsRegisterModalOpen(true);
      return;
    }

    executeOrderCheckout(address, phone, paymentMethod, notes, appliedPromo, discountAmount);
  };

  // Core execution of Checkout
  const executeOrderCheckout = (
    address: string,
    phone: string,
    paymentMethod: string,
    notes: string,
    appliedPromo?: PromoCode,
    discountAmount?: number
  ) => {
    // We assume all items in the cart are from the same shop for delivery logic simplicity.
    // Let's grab the shop of the first item.
    if (cart.length === 0) return;
    const firstItem = cart[0].item;
    const shop = shops.find((s) => s.id === firstItem.shopId) || shops[0];

    const subtotal = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
    const deliveryFee = shop.deliveryFee;
    const actualDiscount = discountAmount || 0;
    const taxableAmount = Math.max(0, subtotal - actualDiscount);
    const vat = Math.round(taxableAmount * 0.14 * 100) / 100;
    const total = Math.round((taxableAmount + deliveryFee + vat) * 100) / 100;

    const newOrder: Order = {
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      date: new Date().toLocaleString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      shopId: shop.id,
      shopName: shop.name,
      shopImage: shop.image,
      items: cart.map((i) => ({
        id: i.item.id,
        name: i.item.name,
        price: i.item.price,
        quantity: i.quantity,
      })),
      subtotal,
      deliveryFee,
      vat,
      discount: actualDiscount,
      total,
      status: 'received',
      address,
      phone,
      paymentMethod,
      notes: notes || undefined,
      trackingProgress: 5,
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    setActiveOrderId(newOrder.id);
    setCart([]); // Clear Cart
    setActiveTab('tracking'); // Auto jump to live tracking!
    showToast('تم تقديم طلبك بنجاح! جاري التوصيل 🛵', 'success');
  };

  // Track order state updates by ID
  const handleUpdateOrderStatusById = (orderId: string, status: OrderStatus, progress: number) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === orderId
          ? { ...o, status, trackingProgress: progress }
          : o
      )
    );
  };

  // Track order state updates (for compatibility with customer OrderTracker)
  const handleUpdateOrderStatus = (status: OrderStatus, progress: number) => {
    if (!activeOrderId) return;
    handleUpdateOrderStatusById(activeOrderId, status, progress);
  };

  // Update a shop's details/status (such as open/close state)
  const handleUpdateShop = (updatedShop: Shop) => {
    setShops((prevShops) =>
      prevShops.map((s) => (s.id === updatedShop.id ? updatedShop : s))
    );
  };

  // Re-order past order handler
  const handleReorder = (pastOrder: Order) => {
    // Clear cart and add everything from the past order
    const itemsToAdd: CartItem[] = [];
    let itemsFoundCount = 0;

    pastOrder.items.forEach((pastItem) => {
      const originalMenuItem = menuItems.find((m) => m.id === pastItem.id);
      if (originalMenuItem) {
        itemsToAdd.push({
          item: originalMenuItem,
          quantity: pastItem.quantity,
        });
        itemsFoundCount++;
      }
    });

    if (itemsToAdd.length > 0) {
      setCart(itemsToAdd);
      setActiveTab('cart');
      showToast(`تمت استعادة ${itemsFoundCount} من منتجات طلبك السابق إلى السلة!`);
    } else {
      showToast('عذراً، لم نعد نوفر هذه السلع حالياً', 'error');
    }
  };

  // Filtering Shops based on search and tab
  const filteredShops = shops.filter((shop) => {
    const matchesCategory = shop.category === selectedCategory;
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Search through all items across shops (allowing direct product searches)
  const matchingItems = searchQuery.trim()
    ? menuItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const currentSelectedShop = shops.find((s) => s.id === selectedShopId);
  const currentShopItems = menuItems.filter((i) => i.shopId === selectedShopId);

  // Delivery fee calculation for active cart
  const currentCartDeliveryFee = cart.length > 0
    ? shops.find((s) => s.id === cart[0].item.shopId)?.deliveryFee || 10
    : 10;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col lg:flex-row items-center justify-center font-sans md:py-6" dir="rtl" style={{ backgroundImage: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' }}>
      
      {/* Desktop Background Panel with branding - hidden on mobile */}
      <div className="hidden lg:flex fixed top-0 right-0 bottom-0 left-[430px] p-12 flex-col justify-between select-none">
        <div className="space-y-6 max-w-xl">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg text-2xl">
              🛵
            </div>
            <div>
              <h1 className="font-black text-2xl text-slate-800 tracking-tight">طلبات فرشوط</h1>
              <p className="text-xs text-slate-400 font-bold -mt-1">تطبيق المأكولات والبقالة المتكامل بمركز فرشوط 🇪🇬</p>
            </div>
          </div>

          <div className="space-y-4 bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white/40 shadow-sm">
            <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-500 px-3 py-1 rounded-full text-xs font-bold">
              <Smartphone className="h-3.5 w-3.5" />
              <span>تطبيق هاتف ذكي مستقل (Android PWA/APK)</span>
            </span>
            <h2 className="text-xl font-black text-slate-800 leading-tight">
              تمت إعادة البرمجة وتعديل الواجهة لتصبح هاتف أندرويد فقط!
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              تم عزل بوابة العميل تماماً عن بوابة المطاعم وبوابة كباتن التوصيل (الطيار) لضمان تجربة حقيقية تشبه التطبيقات المستقلة على الهواتف الذكية.
            </p>

            <div className="border-t border-slate-200/50 pt-4 space-y-3">
              <h4 className="font-bold text-xs text-slate-700 flex items-center gap-1">
                <span>💡</span>
                <span>كيفية تجربة الدورة الكاملة (العميل 🧑‍💼 ➔ المطعم 🏪 ➔ الطيار 🏍️):</span>
              </h4>
              <ol className="text-[11px] text-slate-500 space-y-2 list-decimal list-inside pr-1 font-medium leading-relaxed">
                <li>ادخل كـ <strong className="text-red-500 font-bold">"عميل"</strong> من هاتف الأندرويد المحاكي وقم بتقديم طلب طعام.</li>
                <li>اضغط على <strong className="text-slate-700">"حسابي"</strong> ثم <strong className="text-slate-700">"تسجيل الخروج"</strong> لتنتقل لبوابة <strong className="text-red-500 font-bold">"المطعم"</strong> لرؤية طلبك وتحضيره (كلمة المرور: <code className="bg-slate-200 px-1 rounded font-mono font-bold text-slate-600 text-[10px]">merchant</code>).</li>
                <li>قم بتسجيل الخروج من المطعم وادخل كـ <strong className="text-red-500 font-bold">"كابتن توصيل / طيار"</strong> لقبول الطلب وتوصيله (كلمة المرور: <code className="bg-slate-200 px-1 rounded font-mono font-bold text-slate-600 text-[10px]">driver</code>).</li>
                <li>تابع تحديث حالة الطلب فورياً في تتبع العميل المباشر!</li>
              </ol>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsAndroidBuilderOpen(true)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-black text-xs py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02]"
                >
                  <Smartphone className="h-4.5 w-4.5 animate-pulse" />
                  <span>شغّل أداة بناء الـ APK وتوليد كود الأندرويد 📱</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1 text-xs text-slate-400 font-medium">
          <p>تطبيق طلبات فرشوط - جميع حقوق النشر محفوظة باسم حسن الدربي © 2026</p>
          <p className="text-[10px] text-slate-300">مطاعم بقالة وكافيهات • جمهورية مصر العربية 🇪🇬</p>
        </div>
      </div>

      {/* Realistic Android Phone Mockup container */}
      <div className="w-full min-h-screen md:min-h-0 md:h-[840px] md:w-[390px] md:rounded-[42px] md:border-[10px] md:border-slate-900 md:shadow-2xl md:relative md:overflow-hidden md:flex md:flex-col bg-slate-50 select-none md:scale-95 lg:scale-100 transition-all">
        
        {/* Android Punch Hole Camera Bezel - Hidden on mobile */}
        <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full z-50 flex items-center justify-between px-3">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
          <div className="h-2 w-2 rounded-full bg-blue-900/60" />
        </div>

        {/* Android Status Bar (Fixed at top) */}
        <div className="bg-white border-b border-slate-100 text-slate-700 text-[10px] font-extrabold px-5 py-2.5 flex items-center justify-between z-40 shrink-0">
          <span className="font-mono tracking-wide">{statusBarTime}</span>
          <div className="flex items-center gap-1.5">
            <span>📶 4G</span>
            <span>🛜</span>
            <span>🔋 98%</span>
          </div>
        </div>

        {/* Toast Notification (Scoped inside Mockup) */}
        {toast && (
          <div className="absolute top-14 left-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-slate-900/95 backdrop-blur text-white px-4 py-2.5 shadow-xl border border-white/10 animate-bounce">
            <div className={`h-2.5 w-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : toast.type === 'info' ? 'bg-sky-400' : 'bg-red-400'}`} />
            <span className="text-[11px] font-bold leading-none">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-white/40 hover:text-white mr-auto">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {isRegisterModalOpen && (
          <RegisterModal
            onClose={() => {
              setIsRegisterModalOpen(false);
              setPendingCheckoutData(null);
            }}
            onRegister={handleRegisterUser}
            pendingAddress={pendingCheckoutData?.address}
            pendingPhone={pendingCheckoutData?.phone}
          />
        )}

        {/* Scrollable Container inside Phone Mockup */}
        <div className="flex-grow overflow-y-auto flex flex-col relative bg-slate-50" style={{ height: 'calc(100% - 32px)' }}>
          
          {isAndroidBuilderOpen ? (
            <AndroidBuilder 
              onClose={() => setIsAndroidBuilderOpen(false)}
              appName="طلبات فرشوط"
            />
          ) : !isLoggedIn ? (
            /* Unified Landing & Login Selector Gateway */
            <div className="flex-grow flex flex-col justify-between bg-slate-50 p-6 overflow-y-auto">
              <div className="space-y-6 pt-6">
                
                {/* Logo and Greeting */}
                <div className="text-center space-y-3">
                  <div className="mx-auto h-20 w-20 rounded-[28px] bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-xl shadow-red-100 animate-pulse">
                    <span className="text-4xl">🛵</span>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">طلبات فرشوط</h2>
                    <p className="text-xs text-slate-400 font-bold">تطبيق الدليفري والخدمات الموحد بمركز فرشوط 🇪🇬</p>
                  </div>
                  <div className="bg-red-50 text-red-600 rounded-full py-1 px-3 text-[10px] font-black inline-block">
                    أهلاً بك في تطبيق الهاتف المحدث 👋
                  </div>
                </div>

                {/* Portals Selection */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-extrabold text-slate-400 block pb-1">اختر نوع الحساب للدخول الآمن:</span>
                  
                  {/* Customer Portal Card */}
                  <button
                    onClick={() => {
                      setCurrentRole('customer');
                      setIsLoggedIn(true);
                      localStorage.setItem('portal_role', 'customer');
                      localStorage.setItem('talabat_is_logged_in', 'true');
                      setActiveTab('explore');
                    }}
                    className="w-full text-right bg-white hover:bg-red-50/10 border border-slate-100 hover:border-red-200 p-4 rounded-3xl transition-all shadow-sm flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                        🧑‍💼
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">الدخول كعميل للتسوق</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">اطلب طعامك المفضل، البقالة، والحلويات بفرشوط</p>
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:translate-x-[-4px] transition-transform shrink-0" />
                  </button>

                  {/* Merchant Portal Card */}
                  <button
                    onClick={() => {
                      setCurrentRole('merchant');
                      setIsLoggedIn(true);
                      localStorage.setItem('portal_role', 'merchant');
                      localStorage.setItem('talabat_is_logged_in', 'true');
                    }}
                    className="w-full text-right bg-white hover:bg-red-50/10 border border-slate-100 hover:border-red-200 p-4 rounded-3xl transition-all shadow-sm flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-amber-100 text-amber-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                        🏪
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">بوابة شركاء فرشوط (المطاعم)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">إدارة الأصناف، الأسعار، واستلام الطلبات المباشرة</p>
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:translate-x-[-4px] transition-transform shrink-0" />
                  </button>

                  {/* Driver Portal Card */}
                  <button
                    onClick={() => {
                      setCurrentRole('driver');
                      setIsLoggedIn(true);
                      localStorage.setItem('portal_role', 'driver');
                      localStorage.setItem('talabat_is_logged_in', 'true');
                    }}
                    className="w-full text-right bg-white hover:bg-red-50/10 border border-slate-100 hover:border-red-200 p-4 rounded-3xl transition-all shadow-sm flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                        🏍️
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">بوابة كباتن التوصيل (الطيار)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">استلام الطلبات الجاهزة لتوصيلها وكسب أرباح فورية</p>
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:translate-x-[-4px] transition-transform shrink-0" />
                  </button>

                  {/* Admin Portal Card */}
                  <button
                    onClick={() => {
                      setCurrentRole('admin');
                      setIsLoggedIn(true);
                      localStorage.setItem('portal_role', 'admin');
                      localStorage.setItem('talabat_is_logged_in', 'true');
                    }}
                    className="w-full text-right bg-white hover:bg-red-50/10 border border-slate-100 hover:border-red-200 p-4 rounded-3xl transition-all shadow-sm flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                        ⚙️
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">لوحة الإدارة والنظام</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">إضافة المطاعم، إدارة المنتجات، ومراقبة العمليات</p>
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:translate-x-[-4px] transition-transform shrink-0" />
                  </button>
                </div>
              </div>

              <div className="pt-8 text-center space-y-1 pb-4">
                <span className="text-[9px] text-slate-400 block font-bold">تطبيق طلبات فرشوط المطور © 2026</span>
                <span className="text-[8px] text-slate-300 block font-bold">تصميم وبرمجة حسن الدربي 🇪🇬</span>
              </div>
            </div>
          ) : (
            /* Logged-In Portal Dashboard */
            <>
              {/* Compact Mobile Top Header (Customer Role Only) */}
              {currentRole === 'customer' && (
                <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm shrink-0">
                  <div className="flex items-center gap-2" onClick={() => { setSelectedShopId(null); setActiveTab('explore'); }}>
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-md">
                      <span className="text-base">🛵</span>
                    </div>
                    <div>
                      <span className="font-black text-xs text-slate-800 block tracking-tight">طلبات فرشوط</span>
                      <span className="text-[9px] text-slate-400 font-bold block -mt-1">قنا، مركز فرشوط 📍</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-red-50 text-red-500 font-extrabold px-2 py-1 rounded-full">
                      خصم 30% كود: MASR30 ✨
                    </span>
                  </div>
                </header>
              )}

              {/* Main Container */}
              <main className="flex-grow w-full p-4 pb-24 overflow-y-auto bg-slate-50">
        
        {/* ROLE 1: CUSTOMER VIEW */}
        {currentRole === 'customer' && (
          <>
            {/* TAB 1: EXPLORE / HOME PAGE */}
            {activeTab === 'explore' && (
          <div className="space-y-8">
            
            {/* If no specific shop is selected: Show Category selection & Shop grid */}
            {!selectedShopId ? (
              <>
                {/* Immersive Welcome Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
                  {/* Decorative background vectors */}
                  <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-x-12 -translate-y-12" />
                  <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl translate-x-24 translate-y-24" />

                  <div className="relative max-w-xl space-y-4">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>توصيل فائق السرعة بمركز فرشوط خلال 20 دقيقة 🚀</span>
                    </span>
                    <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                      كل ما تحتاجه من وجبات وقهوة يصلك لباب بيتك بفرشوط!
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                      اختر من بين أفضل المحلات والمطاعم في فرشوط، واستمتع بتتبع فوري لطلبك خطوة بخطوة مع كباتن التوصيل السريع.
                    </p>
                  </div>
                </div>

                {/* Live Search and Filters */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Search Bar */}
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث عن وجبات، برجر، فواكه، قهوة مختصة أو اسم المتجر..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-11 pl-4 text-sm text-slate-800 focus:outline-none focus:border-red-400 focus:bg-white placeholder-slate-400 transition-all font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        إلغاء
                      </button>
                    )}
                  </div>

                  {/* Category Filter Tabs */}
                  <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto shrink-0 justify-between">
                    <button
                      onClick={() => {
                        setSelectedCategory('restaurants');
                        setSearchQuery('');
                      }}
                      className={`flex-grow md:flex-grow-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                        selectedCategory === 'restaurants'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Utensils className="h-4 w-4 text-red-500" />
                      <span>🍔 المطاعم</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCategory('grocery');
                        setSearchQuery('');
                      }}
                      className={`flex-grow md:flex-grow-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                        selectedCategory === 'grocery'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Store className="h-4 w-4 text-red-500" />
                      <span>🥦 البقالة والسوبرماركت</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCategory('cafes');
                        setSearchQuery('');
                      }}
                      className={`flex-grow md:flex-grow-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                        selectedCategory === 'cafes'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Coffee className="h-4 w-4 text-red-500" />
                      <span>☕ الكافيهات</span>
                    </button>
                  </div>
                </div>

                {/* If there is a search query and product search results found */}
                {searchQuery.trim() && matchingItems.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-1">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                      <h3 className="font-extrabold text-lg text-slate-800">المنتجات المطابقة للبحث ({matchingItems.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {matchingItems.map((item) => {
                        const cartItem = cart.find((c) => c.item.id === item.id);
                        return (
                          <ItemCard
                            key={item.id}
                            item={item}
                            cartQuantity={cartItem?.quantity || 0}
                            onAdd={() => handleAddToCart(item)}
                            onRemove={() => handleRemoveFromCart(item)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Shops Listings Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                        {selectedCategory === 'restaurants' ? '🍔 المطاعم الموصى بها لك' : selectedCategory === 'grocery' ? '🥦 البقالات والسوبرماركت القريب' : '☕ الكافيهات ومحلات التحلية'}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">توصيل سريع، أسعار ممتازة وجودة مضمونة</p>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-bold">
                      {filteredShops.length} متجر متاح
                    </span>
                  </div>

                  {filteredShops.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <p className="text-slate-400 font-bold mb-2">عذراً، لم نجد أي متجر يطابق هذا البحث</p>
                      <p className="text-xs text-slate-400">جرب البحث بكلمات أخرى أو تصفح الأقسام الرئيسية</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredShops.map((shop) => (
                        <ShopCard
                          key={shop.id}
                          shop={shop}
                          onClick={() => setSelectedShopId(shop.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* IF A SPECIFIC SHOP IS SELECTED: Show Store Menu Page */
              currentSelectedShop && (
                <div className="space-y-6">
                  {/* Back button */}
                  <button
                    onClick={() => {
                      setSelectedShopId(null);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
                  >
                    <ArrowRight className="h-4.5 w-4.5" />
                    <span>العودة إلى قائمة المتاجر</span>
                  </button>

                  {/* Shop Cover Banner */}
                  <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white h-56 sm:h-64 shadow-lg">
                    <img
                      src={currentSelectedShop.image}
                      alt={currentSelectedShop.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 h-full w-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                    <div className="absolute bottom-0 right-0 left-0 p-6 sm:p-8 space-y-3">
                      {currentSelectedShop.featured && (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                          متجر مميز 🔥
                        </span>
                      )}
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{currentSelectedShop.name}</h1>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-200 font-bold">
                        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg">
                          <span>⭐️ {currentSelectedShop.rating}</span>
                          <span className="text-[10px] text-slate-300">({currentSelectedShop.reviewsCount}+ تقييم)</span>
                        </div>
                        <div>• توصيل في {currentSelectedShop.deliveryTime} دقيقة</div>
                        <div>• رسوم التوصيل: {currentSelectedShop.deliveryFee === 0 ? 'مجاني' : `${currentSelectedShop.deliveryFee} ج.م`}</div>
                        <div>• الحد الأدنى: {currentSelectedShop.minOrder} ج.م</div>
                        <div>• المسافة: {currentSelectedShop.distance} كم</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items Grid Header */}
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-lg text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
                      <Compass className="h-5 w-5 text-red-500" />
                      <span>قائمة المنتجات والمأكولات المتوفرة</span>
                    </h3>

                    {currentShopItems.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <p className="text-slate-400 font-bold">عذراً، لا تتوفر منتجات في هذا المتجر حالياً</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentShopItems.map((item) => {
                          const cartItem = cart.find((c) => c.item.id === item.id);
                          return (
                            <ItemCard
                              key={item.id}
                              item={item}
                              cartQuantity={cartItem?.quantity || 0}
                              onAdd={() => handleAddToCart(item)}
                              onRemove={() => handleRemoveFromCart(item)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE CART & CHECKOUT PAGE */}
        {activeTab === 'cart' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">حقيبة المشتريات والطلب</h2>
                <p className="text-xs text-slate-400 mt-1">تأكد من المنتجات واملأ تفاصيل التوصيل لإرسال طلبك فوراً</p>
              </div>
              <button
                onClick={() => setActiveTab('explore')}
                className="text-xs text-red-500 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>متابعة التسوق والطلب</span>
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>

            <Cart
              cartItems={cart}
              onUpdateQuantity={handleUpdateCartQty}
              onClearCart={handleClearCart}
              onCheckout={handleCheckout}
              deliveryFee={currentCartDeliveryFee}
            />
          </div>
        )}

        {/* TAB 3: ORDER HISTORY PAGE */}
        {activeTab === 'history' && (
          <OrderHistory
            orders={orders}
            onReorder={handleReorder}
            onTrack={(order) => {
              setActiveOrderId(order.id);
              setActiveTab('tracking');
            }}
          />
        )}

        {/* TAB 4: ACTIVE TRACKER PAGE */}
        {activeTab === 'tracking' && (
          activeOrderId && activeOrder ? (
            <OrderTracker
              order={activeOrder}
              onClose={() => setActiveTab('history')}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md mx-auto">
              <span className="text-4xl block mb-4">🛵</span>
              <h3 className="font-extrabold text-slate-800 text-base mb-2">لا يوجد أي طلب نشط لتتبعه حالياً</h3>
              <p className="text-xs text-slate-400 mb-6 px-4">عندما تقوم بتقديم طلب جديد، ستظهر خريطة تتبع الكابتن المباشرة هنا لمتابعة طلبك خطوة بخطوة!</p>
              <button
                onClick={() => setActiveTab('explore')}
                className="bg-red-500 text-white rounded-xl px-6 py-2.5 text-sm font-bold shadow hover:bg-red-600 transition-colors cursor-pointer"
              >
                تصفح المطاعم والمتاجر الآن
              </button>
            </div>
          )
        )}

        {/* TAB 5: ACCOUNT PAGE */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
              
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="h-14 w-14 rounded-2xl bg-red-100 text-red-500 flex items-center justify-center text-3xl font-black shrink-0">
                  🧑‍💼
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-800 text-sm">{customerAccount?.name || "عميل طلبات فرشوط"}</h3>
                  <span className="inline-block bg-slate-100 text-slate-500 text-[9px] font-bold px-2.5 py-1 rounded-full">
                    مستكشف مركز فرشوط النشط 📍
                  </span>
                </div>
              </div>

              {/* Editable Profile Information */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-[10px] text-slate-400">معلومات الحساب والتوصيل</h4>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-1">
                    <label className="text-[10px] font-bold text-slate-400">الاسم الكامل</label>
                    <input
                      type="text"
                      value={customerAccount?.name || "حسن الدربي"}
                      onChange={(e) => {
                        const updated = { ...(customerAccount || { name: '', phone: '', address: '' }), name: e.target.value };
                        setCustomerAccount(updated);
                        localStorage.setItem('customer_account_data', JSON.stringify(updated));
                      }}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    <label className="text-[10px] font-bold text-slate-400">رقم الهاتف للاتصال والتحقق</label>
                    <input
                      type="text"
                      value={customerAccount?.phone || "+20 1023456789"}
                      onChange={(e) => {
                        const updated = { ...(customerAccount || { name: '', phone: '', address: '' }), phone: e.target.value };
                        setCustomerAccount(updated);
                        localStorage.setItem('customer_account_data', JSON.stringify(updated));
                      }}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-500 text-left"
                      dir="ltr"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    <label className="text-[10px] font-bold text-slate-400">عنوان التوصيل الافتراضي بفرشوط</label>
                    <textarea
                      value={customerAccount?.address || "قنا، مركز فرشوط - الشارع الجديد بجوار مسجد الرحمن"}
                      onChange={(e) => {
                        const updated = { ...(customerAccount || { name: '', phone: '', address: '' }), address: e.target.value };
                        setCustomerAccount(updated);
                        localStorage.setItem('customer_account_data', JSON.stringify(updated));
                      }}
                      rows={2}
                      className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* App Settings list */}
              <div className="space-y-2 pt-2">
                <h4 className="font-extrabold text-[10px] text-slate-400 pb-1">إعدادات التطبيق الإضافية</h4>
                
                <div className="space-y-1.5">
                  <button 
                    onClick={() => setIsAndroidBuilderOpen(true)}
                    className="w-full text-right bg-gradient-to-r from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 border border-red-100 px-3.5 py-3 rounded-2xl text-xs font-black text-red-600 flex items-center justify-between transition-all cursor-pointer shadow-sm mb-1.5"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm animate-bounce">🤖</span>
                      <span>منشئ ومبرمج تطبيق أندرويد (APK)</span>
                    </span>
                    <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse">جديد 5G</span>
                  </button>

                  <button className="w-full text-right hover:bg-slate-50 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between transition-colors">
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🎫</span>
                      <span>كوبونات الخصم النشطة بفرشوط</span>
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-bold">1 متاح</span>
                  </button>

                  <button className="w-full text-right hover:bg-slate-50 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between transition-colors">
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🛠️</span>
                      <span>اتصل بنا والاتصال المباشر بالدعم</span>
                    </span>
                    <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
                  </button>

                  <button className="w-full text-right hover:bg-slate-50 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between transition-colors">
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🛡️</span>
                      <span>اتفاقية الاستخدام وسياسة الخصوصية</span>
                    </span>
                    <ChevronLeft className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* Log Out to Portal Gate */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setCustomerAccount(null);
                    localStorage.removeItem('talabat_is_logged_in');
                    localStorage.removeItem('customer_account_data');
                    setToast({ type: 'info', message: 'تم الخروج وحذف بيانات الحساب المؤقتة لتسهيل اختبار التسجيل من جديد' });
                  }}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl py-3 text-xs font-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج والرجوع لاختيار الحسابات</span>
                </button>
              </div>

            </div>
          </div>
        )}
          </>
        )}

                {/* ROLE 2: MERCHANT / RESTAURANT PORTAL */}
                {currentRole === 'merchant' && (
                  <MerchantPanel
                    shops={shops}
                    orders={orders}
                    menuItems={menuItems}
                    onAddMenuItem={handleAddMenuItem}
                    onDeleteMenuItem={handleDeleteMenuItem}
                    onUpdateOrderStatus={handleUpdateOrderStatusById}
                    onUpdateShop={handleUpdateShop}
                    onExitPortal={() => {
                      setIsLoggedIn(false);
                      localStorage.removeItem('talabat_is_logged_in');
                    }}
                  />
                )}

                {/* ROLE 3: DRIVER / CAPTAIN PORTAL */}
                {currentRole === 'driver' && (
                  <DriverPanel
                    orders={orders}
                    onUpdateOrderStatus={handleUpdateOrderStatusById}
                    onExitPortal={() => {
                      setIsLoggedIn(false);
                      localStorage.removeItem('talabat_is_logged_in');
                    }}
                  />
                )}

                {/* ROLE 4: SYSTEM ADMIN PORTAL */}
                {currentRole === 'admin' && (
                  <AdminPanel
                    shops={shops}
                    menuItems={menuItems}
                    onAddShop={handleAddShop}
                    onDeleteShop={handleDeleteShop}
                    onAddMenuItem={handleAddMenuItem}
                    onDeleteMenuItem={handleDeleteMenuItem}
                    onUpdateShop={handleUpdateShop}
                    onExitPortal={() => {
                      setIsLoggedIn(false);
                      localStorage.removeItem('talabat_is_logged_in');
                    }}
                  />
                )}

              </main>

              {/* Fixed Customer Bottom Navigation Bar inside mockup screen */}
              {currentRole === 'customer' && (
                <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 h-16 flex items-center justify-around px-2 z-40 shadow-lg shrink-0">
                  <button
                    onClick={() => {
                      setSelectedShopId(null);
                      setActiveTab('explore');
                    }}
                    className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
                      activeTab === 'explore' ? 'text-red-500 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Compass className="h-5 w-5" />
                    <span className="text-[10px] mt-1 font-bold">الرئيسية</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('cart')}
                    className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors relative ${
                      activeTab === 'cart' ? 'text-red-500 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {cart.length > 0 && (
                      <span className="absolute top-0.5 right-6 h-4 w-4 rounded-full bg-red-600 text-white text-[9px] flex items-center justify-center font-bold border border-white">
                        {cart.length}
                      </span>
                    )}
                    <span className="text-[10px] mt-1 font-bold">السلة</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('history')}
                    className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
                      activeTab === 'history' ? 'text-red-500 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <History className="h-4 w-4" />
                    <span className="text-[10px] mt-1 font-bold">طلباتي</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('account')}
                    className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${
                      activeTab === 'account' ? 'text-red-500 font-extrabold' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <User className="h-5 w-5" />
                    <span className="text-[10px] mt-1 font-bold">حسابي</span>
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
