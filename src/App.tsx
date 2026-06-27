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
import RegisterModal from './components/RegisterModal';
import SupportModal from './components/SupportModal';

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
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

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
    isScheduled?: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
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

  // Update Notification States
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [checkingForUpdates, setCheckingForUpdates] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isSimulatedUpdate, setIsSimulatedUpdate] = useState(false);
  const [showAppInstalledModal, setShowAppInstalledModal] = useState(false);

  useEffect(() => {
    const handleUpdateEvent = () => {
      setIsUpdateAvailable(true);
      setIsSimulatedUpdate(false);
      showToast('🚀 يتوفر تحديث جديد لـ طلبات فرشوط! انقر لعرض تفاصيل التحديث والتثبيت المباشر.', 'info');
    };

    window.addEventListener('sw-update-available', handleUpdateEvent);
    return () => {
      window.removeEventListener('sw-update-available', handleUpdateEvent);
    };
  }, []);

  const handleCheckForUpdates = () => {
    setCheckingForUpdates(true);
    
    // Attempt real Service Worker update check
    const reg = (window as any).swRegistration;
    if (reg) {
      reg.update().catch((err: any) => console.log('SW manual update check failed:', err));
    }

    setTimeout(() => {
      setCheckingForUpdates(false);
      
      // Open the Update Modal. If a real SW update is waiting, it will be handled as real,
      // otherwise we allow them to test/simulate the update notification in the UI.
      setShowUpdateModal(true);
    }, 1500);
  };

  const triggerSimulatedUpdate = () => {
    setIsUpdateAvailable(true);
    setIsSimulatedUpdate(true);
    setShowUpdateModal(true);
    showToast('🚀 تم استلام إشعار بوجود تحديث جديد (محاكاة)!', 'success');
  };

  const handleApplyUpdate = () => {
    showToast('🔄 جاري تثبيت التحديث وإعادة تشغيل التطبيق...', 'success');
    setTimeout(() => {
      // Clear service worker cache if not simulated
      if (!isSimulatedUpdate) {
        if ('caches' in window) {
          caches.keys().then((names) => {
            for (let name of names) caches.delete(name);
          });
        }
      }
      window.location.reload();
    }, 1500);
  };

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

      // Apply dynamic app launcher icon if set
      const savedIcon = localStorage.getItem('android_app_icon');
      if (savedIcon) {
        const iconLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
        if (iconLink) iconLink.href = savedIcon;
        const iconFavicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        if (iconFavicon) {
          iconFavicon.href = savedIcon;
        } else {
          const newFav = document.createElement('link');
          newFav.rel = 'icon';
          newFav.href = savedIcon;
          document.head.appendChild(newFav);
        }
      }
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
          data.discountAmount,
          data.isScheduled,
          data.scheduledDate,
          data.scheduledTime
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
    discountAmount?: number,
    isScheduled?: boolean,
    scheduledDate?: string,
    scheduledTime?: string
  ) => {
    // Intercept checkout if not registered yet!
    if (!customerAccount) {
      setPendingCheckoutData({
        address,
        phone,
        paymentMethod,
        notes,
        appliedPromo,
        discountAmount,
        isScheduled,
        scheduledDate,
        scheduledTime
      });
      setIsRegisterModalOpen(true);
      return;
    }

    executeOrderCheckout(
      address,
      phone,
      paymentMethod,
      notes,
      appliedPromo,
      discountAmount,
      isScheduled,
      scheduledDate,
      scheduledTime
    );
  };

  // Core execution of Checkout
  const executeOrderCheckout = (
    address: string,
    phone: string,
    paymentMethod: string,
    notes: string,
    appliedPromo?: PromoCode,
    discountAmount?: number,
    isScheduled?: boolean,
    scheduledDate?: string,
    scheduledTime?: string
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
      isScheduled,
      scheduledDate,
      scheduledTime,
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    setActiveOrderId(newOrder.id);
    setCart([]); // Clear Cart
    setActiveTab('tracking'); // Auto jump to live tracking!
    if (isScheduled) {
      showToast(`تمت جدولة طلبك بنجاح ليوم ${scheduledDate} الساعة ${scheduledTime}! 📅`, 'success');
    } else {
      showToast('تم تقديم طلبك بنجاح! جاري التوصيل 🛵', 'success');
    }
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

  const handleUpdateOrderRatings = (
    orderId: string,
    restaurantRating: number,
    restaurantReview: string,
    driverRating: number,
    driverReview: string
  ) => {
    setOrders((prevOrders) =>
      prevOrders.map((o) =>
        o.id === orderId
          ? { ...o, restaurantRating, restaurantReview, driverRating, driverReview }
          : o
      )
    );
    showToast('شكراً لتقييمك! تم حفظ آرائك لدعم كباتن التوصيل والمطاعم 🌟', 'success');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row items-center justify-center font-sans md:py-6 relative overflow-hidden" dir="rtl">
      
      {/* Premium ambient light glow effects for luxury feel */}
      <div className="hidden lg:block absolute top-1/4 left-[12%] w-[450px] h-[450px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="hidden lg:block absolute bottom-1/4 right-[5%] w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Desktop Background Panel with branding - hidden on mobile */}
      <div className="hidden lg:flex fixed top-0 right-0 bottom-0 left-[430px] p-12 flex-col justify-between select-none z-10">
        <div className="space-y-8 max-w-xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-[0_8px_24px_rgba(239,68,68,0.4)] text-3xl transform hover:rotate-12 transition-transform duration-300">
              🛵
            </div>
            <div>
              <h1 className="font-extrabold text-3xl text-white tracking-tight bg-gradient-to-l from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">طلبات فرشوط</h1>
              <p className="text-xs text-red-400/80 font-bold -mt-0.5 tracking-wide">تطبيق المأكولات والبقالة المتكامل بمركز فرشوط 🇪🇬</p>
            </div>
          </div>

          <div className="space-y-5 bg-slate-900/40 backdrop-blur-xl p-7 rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
            
            <span className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 px-3.5 py-1.5 rounded-full text-[11px] font-black">
              <Smartphone className="h-3.5 w-3.5" />
              <span>تطبيق هاتف ذكي مستقل جاهز للتنزيل والعمل</span>
            </span>
            
            <h2 className="text-2xl font-black text-white leading-tight">
              واجهة تفاعلية ذكية ومستقلة لكل مستخدم بفرشوط!
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              تم تطوير هذا الإصدار ليعمل بكفاءة فائقة على الهواتف الذكية. تصفح المتاجر، تتبع طلبياتك محلياً بمركز فرشوط، وأدر حسابك بكل سلاسة.
            </p>

            <div className="border-t border-slate-800 pt-5 space-y-4">
              <h4 className="font-bold text-xs text-red-400 flex items-center gap-1.5">
                <span>💡</span>
                <span>كيفية تجربة الدورة الكاملة (العميل 🧑‍💼 ➔ المطعم 🏪 ➔ الطيار 🏍️):</span>
              </h4>
              <ol className="text-[11px] text-slate-300 space-y-2.5 list-decimal list-inside pr-1 font-medium leading-relaxed">
                <li>ادخل كـ <strong className="text-red-400 font-bold">"عميل"</strong> لتصفح المنيوهات وإجراء طلب تجريبي بفرشوط.</li>
                <li>سجل الخروج من <strong className="text-slate-100">"حسابي"</strong> ثم ادخل كـ <strong className="text-red-400 font-bold">"المطعم"</strong> لرؤية الطلب والبدء بتحضيره (كلمة المرور: <code className="bg-slate-800 border border-slate-700/50 px-1.5 py-0.5 rounded font-mono font-bold text-slate-200 text-[10px]">merchant</code>).</li>
                <li>سجل الخروج وادخل كـ <strong className="text-red-400 font-bold">"طيار"</strong> لقبول الطلب وتوصيله (كلمة المرور: <code className="bg-slate-800 border border-slate-700/50 px-1.5 py-0.5 rounded font-mono font-bold text-slate-200 text-[10px]">driver</code>).</li>
                <li>راقب التحديثات اللحظية والتغيرات المباشرة فوراً!</li>
              </ol>

              <div className="pt-3 border-t border-slate-800/60 space-y-3">
                <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-extrabold block">الدعم الفني والشكاوى لـ طلبات فرشوط:</span>
                    <div className="text-[11px] font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <span>🟢 متاح المتابعة والمساعدة الفورية عبر الواتساب</span>
                    </div>
                  </div>
                  <span className="text-xl animate-pulse">💬</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-500 font-medium">
          <p className="text-slate-400">تطبيق طلبات فرشوط - جميع حقوق النشر محفوظة باسم حسن الدربي © 2026</p>
          <p className="text-[10px] text-slate-500">مطاعم بقالة وكافيهات • جمهورية مصر العربية 🇪🇬 • هاتف ذكي مطور</p>
        </div>
      </div>

      {/* Realistic Android Phone Mockup container */}
      <div className="w-full min-h-screen md:min-h-0 md:h-[840px] md:w-[390px] md:rounded-[48px] md:border-[12px] md:border-slate-900 md:shadow-[0_25px_60px_-15px_rgba(239,68,68,0.15),0_30px_70px_rgba(15,23,42,0.6)] md:relative md:overflow-hidden md:flex md:flex-col bg-slate-50 select-none md:scale-[0.98] lg:scale-100 transition-all duration-500 md:ring-8 md:ring-slate-900/15 z-20">
        
        {/* Android Punch Hole Camera Bezel - Hidden on mobile */}
        <div className="hidden md:flex absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5.5 bg-slate-900 rounded-full z-50 items-center justify-between px-3 shadow-inner border border-white/5">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
          <div className="h-2 w-2 rounded-full bg-blue-900/60 shadow" />
        </div>

        {/* Android Status Bar (Fixed at top) */}
        <div className="bg-white border-b border-slate-100 text-slate-700 text-[10px] font-extrabold px-5 py-3 flex items-center justify-between z-40 shrink-0">
          <span className="font-mono tracking-wide">{statusBarTime}</span>
          <div className="flex items-center gap-1.5">
            <span>📶 4G</span>
            <span>🛜</span>
            <span>🔋 98%</span>
          </div>
        </div>

        {/* Toast Notification (Scoped inside Mockup) */}
        {toast && (
          <div className="absolute top-14 left-4 right-4 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 shadow-2xl border border-white/10 animate-bounce">
            <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-emerald-400 animate-pulse' : toast.type === 'info' ? 'bg-sky-400' : 'bg-red-400'}`} />
            <span className="text-[11px] font-bold leading-none">{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-white/40 hover:text-white mr-auto cursor-pointer">
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

        {isSupportModalOpen && (
          <SupportModal onClose={() => setIsSupportModalOpen(false)} />
        )}

        {/* Update Notification Ribbon / Banner */}
        {isUpdateAvailable && !showUpdateModal && (
          <div 
            onClick={() => setShowUpdateModal(true)}
            className="absolute top-14 left-4 right-4 z-40 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl px-4 py-3 shadow-xl border border-red-500/20 flex items-center justify-between gap-3 animate-pulse cursor-pointer hover:brightness-110 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🚀</span>
              <div className="text-right">
                <h5 className="text-[10px] font-black tracking-tight text-white/90">يتوفر إصدار جديد لبرنامج طلبات فرشوط</h5>
                <p className="text-[9px] text-red-50/85 font-bold">انقر هنا لتحديث التطبيق مجاناً فوراً v1.1.0</p>
              </div>
            </div>
            <span className="text-xs font-black bg-white/20 px-2 py-0.5 rounded-lg shrink-0">تحديث 🔄</span>
          </div>
        )}

        {/* System Update Details & Simulation Modal */}
        {showUpdateModal && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] w-full max-w-[340px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90%]">
              
              {/* Header with App Logo */}
              <div className="bg-gradient-to-tr from-red-600 to-red-500 p-6 text-center text-white relative shrink-0">
                <button 
                  onClick={() => setShowUpdateModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer bg-black/10 hover:bg-black/20 p-1.5 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mx-auto h-16 w-16 rounded-[22px] bg-white p-0.5 shadow-xl flex items-center justify-center mb-3">
                  <img
                    src="/pwa_icon.jpg"
                    alt="شعار طلبات فرشوط"
                    className="h-full w-full object-cover rounded-[20px]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-black text-sm">تحديثات تطبيق طلبات فرشوط</h3>
                <p className="text-[9px] text-red-100 font-bold mt-0.5">مركز تحديثات النظام والـ PWA المباشر</p>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-slate-700">
                {isUpdateAvailable ? (
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <span className="inline-block bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-100 animate-pulse">
                        🎉 يتوفر إصدار جديد بالكامل (v1.1.0)
                      </span>
                      <p className="text-[11px] text-slate-500 font-bold pt-1">
                        نوصي بالتحديث فوراً للحصول على أداء أسرع وأكثر استقراراً بمركز فرشوط.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-extrabold text-[10px] text-slate-400">ما الجديد في هذا التحديث؟</h4>
                      <div className="space-y-2 text-right">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                          <span className="text-base shrink-0 animate-bounce">⚡</span>
                          <div>
                            <h5 className="text-[10px] font-black text-slate-800">تحسين تتبع الكباتن</h5>
                            <p className="text-[9px] text-slate-500 font-bold">دقة أعلى وتحديث لحظي لموقع كابتن التوصيل لطلبك بفرشوط.</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                          <span className="text-base shrink-0">🎨</span>
                          <div>
                            <h5 className="text-[10px] font-black text-slate-800">واجهات وقوائم طعام متطورة</h5>
                            <p className="text-[9px] text-slate-500 font-bold">سرعة تصفح فائقة وقوائم مطاعم متجاوبة تدعم البحث الذكي.</p>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                          <span className="text-base shrink-0">🔒</span>
                          <div>
                            <h5 className="text-[10px] font-black text-slate-800">أمان وحماية محسّنة</h5>
                            <p className="text-[9px] text-slate-500 font-bold">نظام تشفير فائق الأمان لحسابات العملاء وكوبونات الخصم والخصومات.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-xl">
                      ✓
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-xs text-slate-800">تطبيقك محدث بالكامل!</h4>
                      <p className="text-[10px] text-slate-400 font-bold">أنت تستخدم أحدث إصدار متوفر حالياً (v1.0.0)</p>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3 text-right space-y-1.5">
                      <h5 className="text-[9px] font-black text-amber-800 flex items-center gap-1">
                        <span>💡</span>
                        <span>ميزة اختبار ومحاكاة التحديث:</span>
                      </h5>
                      <p className="text-[9px] text-slate-600 font-bold leading-relaxed">
                        بما أن هذا تطبيق تجريبي متكامل، يمكنك الضغط على الزر أدناه لمحاكاة وصول إشعار تحديث جديد v1.1.0 لتجربة المظهر وتفاعل الإشعارات التلقائية للمستخدمين.
                      </p>
                      <button
                        onClick={triggerSimulatedUpdate}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] py-2 px-3 rounded-xl transition-all cursor-pointer text-center"
                      >
                        محاكاة استلام تحديث جديد v1.1.0 🚀
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 shrink-0">
                {isUpdateAvailable ? (
                  <>
                    <button
                      onClick={handleApplyUpdate}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black text-xs py-3 rounded-2xl shadow-md shadow-red-100 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>تحديث الآن وإعادة التشغيل 🔄</span>
                    </button>
                    <button
                      onClick={() => setShowUpdateModal(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-xs px-4 py-3 rounded-2xl transition-all cursor-pointer text-center"
                    >
                      لاحقاً
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black text-xs py-3 rounded-2xl shadow-md transition-all text-center cursor-pointer"
                  >
                    حسناً، إغلاق النافذة
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* App Installed Representation / Mockup Modal */}
        {showAppInstalledModal && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-[32px] w-full max-w-[340px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92%] animate-slide-up">
              
              {/* Header */}
              <div className="bg-gradient-to-tr from-slate-900 to-slate-800 p-5 text-center text-white relative shrink-0">
                <button 
                  onClick={() => setShowAppInstalledModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="text-2xl block mb-2">📱</span>
                <h3 className="font-black text-sm">تطبيق طلبات فرشوط على هاتفك</h3>
                <p className="text-[10px] text-red-400 font-extrabold mt-0.5">محاكاة حية لمظهر الأيقونة بعد التثبيت</p>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-right">
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed text-center">
                  عندما تقوم بتثبيت التطبيق من المتصفح، سيظهر على شاشة هاتفك الرئيسية كبرنامج حقيقي فائق السرعة وبدون استهلاك للإنترنت.
                </p>

                {/* Simulated Android Home Screen Grid */}
                <div className="bg-gradient-to-b from-blue-900 to-indigo-950 rounded-3xl p-4 shadow-inner relative overflow-hidden h-[180px] flex flex-col justify-between border border-white/10">
                  {/* Subtle Wallpaper glow pattern */}
                  <div className="absolute -top-12 -left-12 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
                  
                  {/* Clock & Widget */}
                  <div className="text-center pt-2 relative z-10">
                    <span className="font-mono text-2xl font-black text-white/95 tracking-wide drop-shadow">12:30</span>
                    <p className="text-[8px] text-white/60 font-black mt-0.5">السبت، 27 يونيو 📍 فرشوط</p>
                  </div>

                  {/* Icon Row */}
                  <div className="grid grid-cols-4 gap-2 text-center pb-2 relative z-10">
                    
                    {/* Mock App 1 */}
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="h-10 w-10 rounded-[14px] bg-emerald-500 flex items-center justify-center text-lg shadow-md border border-white/5 cursor-not-allowed">
                        💬
                      </div>
                      <span className="text-[8px] text-white/80 font-bold tracking-tight">واتساب</span>
                    </div>

                    {/* OUR STAR APP: Talabat Farshoot */}
                    <div className="space-y-1 flex flex-col items-center relative scale-110">
                      {/* Active notification bubble */}
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[7px] px-1 py-0.5 rounded-full leading-none z-20 shadow animate-pulse border border-white/20">
                        طلب
                      </span>
                      <div className="h-10 w-10 rounded-[14px] bg-white p-0.5 shadow-[0_4px_12px_rgba(239,68,68,0.4)] border-2 border-red-500 flex items-center justify-center overflow-hidden">
                        <img 
                          src="/pwa_icon.jpg" 
                          alt="طلبات فرشوط" 
                          className="h-full w-full object-cover rounded-[11px]"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="text-[8px] text-red-300 font-extrabold tracking-tight drop-shadow-sm">طلبات فرشوط</span>
                    </div>

                    {/* Mock App 2 */}
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="h-10 w-10 rounded-[14px] bg-blue-600 flex items-center justify-center text-lg shadow-md border border-white/5 cursor-not-allowed">
                        👥
                      </div>
                      <span className="text-[8px] text-white/80 font-bold tracking-tight">فيسبوك</span>
                    </div>

                    {/* Mock App 3 */}
                    <div className="space-y-1 flex flex-col items-center">
                      <div className="h-10 w-10 rounded-[14px] bg-sky-500 flex items-center justify-center text-lg shadow-md border border-white/5 cursor-not-allowed">
                        📞
                      </div>
                      <span className="text-[8px] text-white/80 font-bold tracking-tight">الهاتف</span>
                    </div>

                  </div>
                </div>

                {/* Quick Steps Instructions */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <h4 className="font-extrabold text-[10px] text-slate-400">💡 كيف تقوم بتثبيت التطبيق الآن؟</h4>
                  <ul className="space-y-1.5 text-[10px] text-slate-600 font-bold">
                    <li className="flex items-start gap-1.5">
                      <span className="text-red-500">1.</span>
                      <span>إذا كنت تستخدم هاتف <b>أندرويد</b>: انقر على الثلاث نقاط بأعلى المتصفح ثم اختر <b>"إضافة إلى الشاشة الرئيسية"</b> أو <b>"تثبيت التطبيق"</b>.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-red-500">2.</span>
                      <span>إذا كنت تستخدم هاتف <b>آيفون (iOS)</b>: انقر على زر مشاركة السفاري <span className="inline-block px-1 bg-slate-200 rounded">📤</span> بالأسفل ثم اختر <b>"إضافة إلى الشاشة الرئيسية"</b>.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
                <button
                  onClick={() => setShowAppInstalledModal(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 rounded-2xl transition-all cursor-pointer text-center"
                >
                  حسناً، فهمت ذلك
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Scrollable Container inside Phone Mockup */}
        <div className="flex-grow overflow-y-auto flex flex-col relative bg-slate-50" style={{ height: 'calc(100% - 32px)' }}>
          
          {!isLoggedIn ? (
            /* Unified Landing & Login Selector Gateway */
            <div className="flex-grow flex flex-col justify-between bg-slate-50 p-6 overflow-y-auto">
              <div className="space-y-6 pt-6">
                
                {/* Logo and Greeting */}
                <div className="text-center space-y-3">
                  <div className="mx-auto h-20 w-20 rounded-[28px] bg-white border border-slate-100 shadow-xl overflow-hidden flex items-center justify-center animate-pulse">
                    <img
                      src={localStorage.getItem('android_app_icon') || '/pwa_icon.jpg'}
                      alt="شعار طلبات فرشوط"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">طلبات فرشوط</h2>
                    <p className="text-xs text-slate-400 font-bold">تطبيق الدليفري والخدمات الموحد بمركز فرشوط 🇪🇬</p>
                  </div>
                  <div className="bg-red-50 text-red-600 rounded-full py-1.5 px-4 text-[10px] font-black inline-block border border-red-100">
                    أهلاً بك في تطبيق الهاتف المحدث 👋
                  </div>
                </div>

                {/* Portals Selection */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-black text-slate-400 block pb-1">اختر نوع الحساب للدخول الآمن:</span>
                  
                  {/* Customer Portal Card */}
                  <button
                    onClick={() => {
                      setCurrentRole('customer');
                      setIsLoggedIn(true);
                      localStorage.setItem('portal_role', 'customer');
                      localStorage.setItem('talabat_is_logged_in', 'true');
                      setActiveTab('explore');
                    }}
                    className="w-full text-right bg-white hover:bg-red-50/10 border border-slate-100 hover:border-red-200 p-4.5 rounded-[22px] transition-all duration-300 shadow-sm hover:shadow flex items-center justify-between group cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-red-100 text-red-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform duration-300">
                        🧑‍💼
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">الدخول كعميل للتسوق</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-normal">اطلب طعامك المفضل، البقالة، والحلويات بفرشوط</p>
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
                    className="w-full text-right bg-white hover:bg-amber-50/10 border border-slate-100 hover:border-amber-200 p-4.5 rounded-[22px] transition-all duration-300 shadow-sm hover:shadow flex items-center justify-between group cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform duration-300">
                        🏪
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">بوابة شركاء فرشوط (المطاعم)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-normal">إدارة الأصناف، الأسعار، واستلام الطلبات المباشرة</p>
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
                    className="w-full text-right bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-300 p-4.5 rounded-[22px] transition-all duration-300 shadow-sm hover:shadow flex items-center justify-between group cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform duration-300">
                        🏍️
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">بوابة كباتن التوصيل (الطيار)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-normal">استلام الطلبات الجاهزة لتوصيلها وكسب أرباح فورية</p>
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
                    className="w-full text-right bg-white hover:bg-red-50/10 border border-slate-100 hover:border-red-200 p-4.5 rounded-[22px] transition-all duration-300 shadow-sm hover:shadow flex items-center justify-between group cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-red-100 text-red-500 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform duration-300">
                        ⚙️
                      </div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800">لوحة الإدارة والنظام</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-normal">إضافة المطاعم، إدارة المنتجات، ومراقبة العمليات</p>
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:translate-x-[-4px] transition-transform shrink-0" />
                  </button>
                </div>

                {/* Direct Support shortcut in login screen */}
                <div className="pt-2">
                  <button 
                    onClick={() => setIsSupportModalOpen(true)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-2xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>☎️</span>
                    <span>الاتصال المباشر بالدعم والمساعدة (حسن الدربي)</span>
                  </button>
                </div>
              </div>

              <div className="pt-6 text-center space-y-1 pb-4">
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
              onUpdateRatings={handleUpdateOrderRatings}
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
                  <button className="w-full text-right hover:bg-slate-50 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between transition-colors">
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🎫</span>
                      <span>كوبونات الخصم النشطة بفرشوط</span>
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-bold">1 متاح</span>
                  </button>

                  <button 
                    onClick={handleCheckForUpdates}
                    disabled={checkingForUpdates}
                    className="w-full text-right hover:bg-slate-50 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🔄</span>
                      <span>{checkingForUpdates ? 'جاري التحقق من وجود تحديثات...' : 'التحقق من وجود تحديثات جديدة'}</span>
                    </span>
                    <span className="text-[10px] bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                      {checkingForUpdates && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />}
                      <span>v1.0.0</span>
                    </span>
                  </button>

                  <button 
                    onClick={() => setShowAppInstalledModal(true)}
                    className="w-full text-right hover:bg-red-50/50 hover:text-red-700 border border-dashed border-red-200/60 bg-red-50/10 px-3 py-2.5 rounded-xl text-xs font-black text-red-600 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">📱</span>
                      <span>شكل أيقونة التطبيق مثبت على الهاتف</span>
                    </span>
                    <span className="text-[10px] bg-red-500 text-white px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      <span>شاهد الآن</span>
                    </span>
                  </button>

                  <button 
                    onClick={() => setIsSupportModalOpen(true)}
                    className="w-full text-right hover:bg-slate-50 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between transition-colors cursor-pointer"
                  >
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
