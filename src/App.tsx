import { SHOPS, MENU_ITEMS } from './data';
import { Shop, MenuItem, CartItem, Order, CategoryType, OrderStatus, PromoCode, InAppNotification } from './types';
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
import WhatsAppLogin from './components/WhatsAppLogin';
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
  LogOut,
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  ShieldCheck,
  CreditCard,
  Bell,
  BellRing,
  Trash2,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function App() { 
  const [customers, setCustomers] = useState<any[]>([]);
  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch('/api/customers/all');
        if (res.ok) {
          const data = await res.json();
          setCustomers(data);
          console.log("تم تحميل العملاء بنجاح:", data);
        }
      } catch (error) {
        console.error("خطأ أثناء جلب العملاء:", error);
      }
    }
    loadCustomers();
  }, []);
}
e
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
  const [customerAccount, setCustomerAccount] = useState<{ name: string; phone: string; address: string; password?: string; mobileWalletNumber?: string; mobileWalletProvider?: string } | null>(() => {
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

  // Shops and Menu Item
const [shops, setShops] = useState<Shop[]>([]);
const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
const [customers, setCustomers] = useState<any[]>([]); // أضفته هنا


  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Premium Flexible UI Modes & States
  const [isFullScreen, setIsFullScreen] = useState<boolean>(() => localStorage.getItem('is_full_screen') === 'true');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('talabat_favorites') || '[]');
    } catch {
      return [];
    }
  });
  const [shopFilter, setShopFilter] = useState<'all' | 'featured' | 'rating' | 'fastest' | 'favorites'>('all');

  // Wallet States & Types
  interface WalletTransaction {
    id: string;
    type: 'deposit' | 'withdrawal';
    amount: number;
    description: string;
    date: string;
  }

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem('talabat_wallet_balance');
    return saved !== null ? Number(saved) : 150; // default 150 EGP gift
  });

  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('talabat_wallet_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: 't-init',
        type: 'deposit',
        amount: 150,
        description: 'هدية ترحيبية مجانية بمناسبة تفعيل المحفظة 🎉🎁',
        date: new Date().toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Wallet Recharge interactive simulator states
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('100');
  const [rechargeMethod, setRechargeMethod] = useState<'vodafone' | 'card' | 'fawry'>('vodafone');
  const [rechargePhone, setRechargePhone] = useState('');
  const [rechargeStep, setRechargeStep] = useState<'input' | 'otp' | 'success'>('input');
  const [rechargeOtp, setRechargeOtp] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Update Notification States
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [checkingForUpdates, setCheckingForUpdates] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isSimulatedUpdate, setIsSimulatedUpdate] = useState(false);
  const [showAppInstalledModal, setShowAppInstalledModal] = useState(false);
  const [showPCInstallModal, setShowPCInstallModal] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return 'Notification' in window ? Notification.permission : 'default';
  });

  const sendSystemNotification = (title: string, body: string, iconUrl?: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: iconUrl || '/pwa_icon.jpg',
            badge: '/pwa_icon.jpg',
            vibrate: [200, 100, 200],
            dir: 'rtl',
            tag: 'order-status',
            renotify: true,
          } as any);
        }).catch(() => {
          new Notification(title, {
            body,
            icon: iconUrl || '/pwa_icon.jpg',
            dir: 'rtl'
          });
        });
      } else {
        new Notification(title, {
          body,
          icon: iconUrl || '/pwa_icon.jpg',
          dir: 'rtl'
        });
      }
    } catch (e) {
      console.error('Failed to show notification:', e);
    }
  };

  const handleRequestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      showToast('⚠️ متصفحك أو هاتفك لا يدعم نظام الإشعارات المباشرة.', 'info');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        showToast('🔔 ممتاز! تم تفعيل إشعارات الهاتف بنجاح. ستتلقى تحديثات مباشرة بحالة طلبك حتى لو كان التطبيق مغلقاً.', 'success');
        sendSystemNotification('تم تفعيل الإشعارات بنجاح 🎉', 'شكراً لك على تفعيل إشعارات طلبات فرشوط! ستصلك هنا تحديثات طلبك خطوة بخطوة.');
      } else {
        showToast('⚠️ لم يتم منح صلاحية الإشعارات. يرجى تفعيلها من إعدادات المتصفح لتتبع طلباتك.', 'info');
      }
    } catch (err) {
      console.error('Error requesting notifications:', err);
      showToast('⚠️ حدث خطأ أثناء محاولة تفعيل الإشعارات.', 'error');
    }
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPromptBanner, setShowInstallPromptBanner] = useState<boolean>(() => {
    return sessionStorage.getItem('dismiss_install_banner') !== 'true';
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (sessionStorage.getItem('dismiss_install_banner') !== 'true') {
        setShowInstallPromptBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowInstallPromptBanner(false);
      showToast('🎉 شكراً لك على تنزيل وتثبيت تطبيق طلبات فرشوط على هاتفك!', 'success');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('🔄 جاري تثبيت تطبيق طلبات فرشوط على هاتفك...', 'success');
        }
        setDeferredPrompt(null);
        setShowInstallPromptBanner(false);
      } catch (err) {
        console.error('Error triggering PWA installation:', err);
        setShowAppInstalledModal(true);
      }
    } else {
      setShowAppInstalledModal(true);
    }
  };

  // In-app Notifications State
  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem('talabat_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'n-welcome',
        orderId: '',
        title: 'مرحباً بك في طلبات فرشوط 🎉',
        message: 'تم تفعيل نظام الإشعارات الذكي لتتبع حالة طلباتك فوراً لحظة بلحظة!',
        type: 'system',
        read: false,
        date: new Date().toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNotificationsMuted, setIsNotificationsMuted] = useState(() => {
    return localStorage.getItem('notifications_muted') === 'true';
  });
  const [activeNotificationPopup, setActiveNotificationPopup] = useState<InAppNotification | null>(null);

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem('talabat_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Sync sound muted preference
  useEffect(() => {
    localStorage.setItem('notifications_muted', isNotificationsMuted ? 'true' : 'false');
  }, [isNotificationsMuted]);

  // Sound Synth Chime
  const playNotificationSound = () => {
    try {
      if (isNotificationsMuted) return;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      playTone(523.25, now, 0.3); // C5
      playTone(659.25, now + 0.12, 0.4); // E5
    } catch (error) {
      console.warn('Audio context failed or not allowed:', error);
    }
  };

  // Automatically dismiss floating notification alert after 7 seconds
  useEffect(() => {
    if (activeNotificationPopup) {
      const timer = setTimeout(() => {
        setActiveNotificationPopup(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeNotificationPopup]);

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

  const downloadPCUrlShortcut = () => {
    const currentUrl = window.location.origin;
    const fileContent = `[InternetShortcut]\nURL=${currentUrl}\nIconIndex=0\nIconFile=chrome.exe\n`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = 'طلبات_فرشوط.url';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('📥 تم تحميل اختصار سطح المكتب بنجاح! اسحبه لسطح المكتب وافتحه لتصفح التطبيق كبرنامج مستقل.', 'success');
  };

  const downloadPCInstallerBat = () => {
    const currentUrl = window.location.origin;
    const fileContent = `@echo off\r\n` +
      `chcp 65001 > nul\r\n` +
      `title تثبيت تطبيق طلبات فرشوط على الكمبيوتر\r\n` +
      `echo ====================================================\r\n` +
      `echo      تثبيت تطبيق طلبات فرشوط - مركز فرشوط 🛵\r\n` +
      `echo ====================================================\r\n` +
      `echo.\r\n` +
      `echo جاري إنشاء اختصار للتطبيق على سطح المكتب الخاص بك...\r\n` +
      `echo.\r\n` +
      `set "SCRIPT_DIR=%temp%"\r\n` +
      `set "VBS_FILE=%SCRIPT_DIR%\\CreateShortcut.vbs"\r\n` +
      `\r\n` +
      `(\r\n` +
      `echo Set oWS = CreateObject^("WScript.Shell"^)\r\n` +
      `echo sLinkFile = oWS.SpecialFolders^("Desktop"^)^ & "\\\\طلبات فرشوط.lnk"\r\n` +
      `echo Set oLink = oWS.CreateShortcut^(sLinkFile^)\r\n` +
      `echo oLink.TargetPath = "${currentUrl}"\r\n` +
      `echo oLink.Description = "طلبات فرشوط - دليفري مطاعم وبقالة بمركز فرشوط"\r\n` +
      `echo oLink.IconLocation = "chrome.exe,0"\r\n` +
      `echo oLink.Save\r\n` +
      `) > "%VBS_FILE%"\r\n` +
      `\r\n` +
      `cscript /nologo "%VBS_FILE%"\r\n` +
      `del "%VBS_FILE%"\r\n` +
      `\r\n` +
      `echo ====================================================\r\n` +
      `echo 🎉 تم إنشاء اختصار "طلبات فرشوط" بنجاح على سطح المكتب!\r\n` +
      `echo يمكنك الآن فتح التطبيق مباشرة من سطح المكتب في أي وقت.\r\n` +
      `echo ====================================================\r\n` +
      `echo.\r\n` +
      `pause\r\n`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = 'تثبيت_طلبات_فرشوط.bat';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('📥 تم تحميل مثبت الكمبيوتر السريع (.BAT) بنجاح! قم بتشغيل الملف لإنشاء اختصار مباشر على سطح المكتب.', 'success');
  };

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

  // Toggle favorite shops
  const handleToggleFavorite = (shopId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(shopId) ? prev.filter((id) => id !== shopId) : [...prev, shopId];
      localStorage.setItem('talabat_favorites', JSON.stringify(next));
      showToast(prev.includes(shopId) ? '💔 تم إزالة المتجر من المفضلة بفرشوط' : '❤️ تم إضافة المتجر للمفضلة بفرشوط!', 'success');
      return next;
    });
  };

  // Toggle mockup / full screen mode
  const handleToggleFullScreen = () => {
    const nextVal = !isFullScreen;
    setIsFullScreen(nextVal);
    localStorage.setItem('is_full_screen', nextVal.toString());
    showToast(nextVal ? '🖥️ تم تفعيل وضع ملء الشاشة الكامل' : '📱 تم الرجوع لوضع محاكاة الهاتف الذكي', 'info');
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

  // Wallet Complete Recharge Handler
  const handleCompleteRecharge = (amount: number, methodLabel: string) => {
    const newBalance = Math.round((walletBalance + amount) * 100) / 100;
    setWalletBalance(newBalance);
    localStorage.setItem('talabat_wallet_balance', newBalance.toString());

    const newTx: WalletTransaction = {
      id: `t-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'deposit',
      amount: amount,
      description: `شحن رصيد المحفظة عبر ${methodLabel} 🔌💳`,
      date: new Date().toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    const updatedTxs = [newTx, ...walletTransactions];
    setWalletTransactions(updatedTxs);
    localStorage.setItem('talabat_wallet_transactions', JSON.stringify(updatedTxs));
    
    setRechargeStep('success');
    showToast(`تم شحن ${amount} ج.م بنجاح عبر ${methodLabel}! 🎉`, 'success');
  };

  const handleSaveDefaultAddressAndPhone = (addr: string, ph: string, walletNum?: string, walletProv?: string) => {
    const updated = { 
      ...(customerAccount || { name: 'عميل طلبات فرشوط', phone: '', address: '' }), 
      address: addr, 
      phone: ph,
      ...(walletNum ? { mobileWalletNumber: walletNum } : {}),
      ...(walletProv ? { mobileWalletProvider: walletProv } : {})
    };
    setCustomerAccount(updated);
    localStorage.setItem('customer_account_data', JSON.stringify(updated));
    showToast('تم تحديث عنوان التوصيل ورقم الهاتف ومحفظتك الافتراضية بنجاح بملفك الشخصي! 💾', 'success');
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

    if (paymentMethod === 'wallet') {
      const newBalance = Math.round((walletBalance - total) * 100) / 100;
      setWalletBalance(newBalance);
      localStorage.setItem('talabat_wallet_balance', newBalance.toString());

      const newTx: WalletTransaction = {
        id: `t-${Math.floor(100000 + Math.random() * 900000)}`,
        type: 'withdrawal',
        amount: total,
        description: `شراء طلب مأكولات رقم #${newOrder.id} 🍔`,
        date: new Date().toLocaleDateString('ar-EG', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
      const updatedTxs = [newTx, ...walletTransactions];
      setWalletTransactions(updatedTxs);
      localStorage.setItem('talabat_wallet_transactions', JSON.stringify(updatedTxs));
    }

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    setActiveOrderId(newOrder.id);
    setCart([]); // Clear Cart
    setActiveTab('tracking'); // Auto jump to live tracking!
    if (paymentMethod === 'wallet') {
      const remaining = Math.round((walletBalance - total) * 100) / 100;
      showToast(`تم خصم ${total} ج.م من محفظتك الإلكترونية بنجاح! الرصيد المتبقي: ${remaining} ج.م 💳`, 'success');
    } else if (isScheduled) {
      showToast(`تمت جدولة طلبك بنجاح ليوم ${scheduledDate} الساعة ${scheduledTime}! 📅`, 'success');
    } else {
      showToast('تم تقديم طلبك بنجاح! جاري التوصيل 🛵', 'success');
    }
  };

  // Track order state updates by ID
  const handleUpdateOrderStatusById = (orderId: string, status: OrderStatus, progress: number) => {
    setOrders((prevOrders) => {
      const order = prevOrders.find((o) => o.id === orderId);
      if (order && order.status !== status) {
        // Build beautiful notification titles and messages in Arabic
        let statusTitle = '';
        let statusDesc = '';
        
        switch (status) {
          case 'received':
            statusTitle = 'تم استلام طلبك 📋';
            statusDesc = `المطعم (${order.shopName}) استلم طلبك وهو قيد المراجعة والتحضير الآن.`;
            break;
          case 'preparing':
            statusTitle = 'جاري تحضير طلبك 🍳';
            statusDesc = `طلبك رقم #${orderId.slice(-4)} قيد التجهيز الآن في مطبخ ${order.shopName}.`;
            break;
          case 'on_the_way':
            statusTitle = 'الطلب في الطريق 🛵';
            statusDesc = `خرج طلبك مع كابتن التوصيل وهو في طريقه إليك الآن!`;
            break;
          case 'delivered':
            statusTitle = 'تم توصيل طلبك 🎉';
            statusDesc = `تم تسليم طلبك بنجاح من ${order.shopName}! بالهنا والشفا لك.`;
            break;
        }

        if (statusTitle) {
          const newNotification: InAppNotification = {
            id: `n-${Date.now()}`,
            orderId,
            title: statusTitle,
            message: statusDesc,
            type: 'status_change',
            status,
            read: false,
            date: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date().toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' }),
            shopName: order.shopName,
          };

          // Update notifications state
          setNotifications((prev) => [newNotification, ...prev]);
          
          // Trigger floating popup animation/alert
          setActiveNotificationPopup(newNotification);
          
          // Trigger PWA/Phone System Web Notification
          sendSystemNotification(statusTitle, statusDesc, order.shopImage || '/pwa_icon.jpg');
          
          // Play synth chime!
          setTimeout(() => {
            playNotificationSound();
          }, 50);
        }
      }

      return prevOrders.map((o) =>
        o.id === orderId
          ? { ...o, status, trackingProgress: progress }
          : o
      );
    });
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

  // Filtering Shops based on search, tab, and extra filters
  const filteredShops = shops.filter((shop) => {
    const matchesCategory = shop.category === selectedCategory;
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // filter by favorites
    const matchesFavorites = shopFilter === 'favorites' ? favorites.includes(shop.id) : true;
    
    // filter by featured
    const matchesFeatured = shopFilter === 'featured' ? shop.isFeatured : true;
    
    return matchesCategory && matchesSearch && matchesFavorites && matchesFeatured;
  }).sort((a, b) => {
    if (shopFilter === 'rating') {
      return b.rating - a.rating;
    }
    if (shopFilter === 'fastest') {
      const timeA = parseInt(a.deliveryTime) || 30;
      const timeB = parseInt(b.deliveryTime) || 30;
      return timeA - timeB;
    }
    return 0; // default order
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative" dir="rtl">

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-4 right-4 md:left-auto md:right-6 md:w-[380px] z-[9999] flex items-center gap-2.5 rounded-2xl bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 shadow-2xl border border-white/10 animate-bounce">
          <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-emerald-400 animate-pulse' : toast.type === 'info' ? 'bg-sky-400' : 'bg-red-400'}`} />
          <span className="text-[11px] font-bold leading-none">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-white/40 hover:text-white mr-auto cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Dynamic Floating In-App Notification Alert */}
      {activeNotificationPopup && (
        <div 
          className="fixed top-20 left-4 right-4 md:left-auto md:right-6 md:w-[420px] z-[9999] bg-white text-slate-900 rounded-[24px] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col gap-3 animate-in slide-in-from-top-4 duration-300"
          dir="rtl"
        >
          <div className="flex items-start gap-3">
            <div className={`h-11 w-11 rounded-2xl shrink-0 flex items-center justify-center text-xl shadow-md ${
              activeNotificationPopup.status === 'received' 
                ? 'bg-blue-50 text-blue-600'
                : activeNotificationPopup.status === 'preparing'
                  ? 'bg-amber-50 text-amber-600'
                  : activeNotificationPopup.status === 'on_the_way'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-emerald-50 text-emerald-600'
            }`}>
              {activeNotificationPopup.status === 'received' ? '📋' : activeNotificationPopup.status === 'preparing' ? '🍳' : activeNotificationPopup.status === 'on_the_way' ? '🛵' : '🎉'}
            </div>
            <div className="text-right flex-grow">
              <span className="text-[10px] bg-slate-100 text-slate-500 font-black px-2 py-0.5 rounded-md">تحديث مباشر لحالة طلبك ⚡</span>
              <h4 className="font-black text-xs text-slate-900 mt-1">{activeNotificationPopup.title}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 font-semibold leading-relaxed">{activeNotificationPopup.message}</p>
            </div>
            <button 
              onClick={() => setActiveNotificationPopup(null)} 
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50 cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-slate-50 pt-2.5 mt-1">
            <button
              onClick={() => {
                if (activeNotificationPopup.orderId) {
                  setActiveOrderId(activeNotificationPopup.orderId);
                  setActiveTab('tracking');
                  setSelectedShopId(null);
                }
                setActiveNotificationPopup(null);
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-black text-[10px] px-4 py-1.5 rounded-xl transition-all shadow-md shadow-red-500/10 active:scale-95 cursor-pointer"
            >
              تتبع الطلب الآن 🛵
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-slate-400 font-bold">{activeNotificationPopup.date}</span>
              <button
                onClick={() => setIsNotificationsMuted(!isNotificationsMuted)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                title={isNotificationsMuted ? "تفعيل الصوت" : "كتم الصوت"}
              >
                {isNotificationsMuted ? <VolumeX className="h-3.5 w-3.5 text-red-500" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <RegisterModal
            onClose={() => {
              setIsRegisterModalOpen(false);
              setPendingCheckoutData(null);
            }}
            onRegister={handleRegisterUser}
            pendingAddress={pendingCheckoutData?.address}
            pendingPhone={pendingCheckoutData?.phone}
          />
        </div>
      )}

      {isSupportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <SupportModal onClose={() => setIsSupportModalOpen(false)} />
        </div>
      )}

      {isRechargeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100/80 animate-in fade-in zoom-in duration-200 text-right">
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white relative">
              <button 
                onClick={() => setIsRechargeModalOpen(false)}
                className="absolute top-6 left-6 text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center text-xl border border-red-500/30">
                  ⚡
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">شاحن المحفظة الإلكترونية السريع</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">شحن آمن وفوري بمركز فرشوط 🔒</p>
                </div>
              </div>
            </div>

            {/* Step 1: Input Amount and Method */}
            {rechargeStep === 'input' && (
              <div className="p-6 space-y-5">
                {/* Balance Summary */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">رصيدك الحالي بالمحفظة:</span>
                  <span className="text-sm font-black text-slate-800">{walletBalance.toFixed(2)} ج.م</span>
                </div>

                {/* Amount Choice */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500">اختر أو اكتب مبلغ الشحن (ج.م)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['50', '100', '200', '500'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRechargeAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                          rechargeAmount === amt
                            ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/15'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {amt} ج.م
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black text-slate-700 outline-none focus:border-red-500 text-center mt-2"
                    placeholder="مبلغ مخصص (مثال: 150)"
                  />
                </div>

                {/* Recharge Method Option */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-500">طريقة شحن الرصيد</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRechargeMethod('vodafone')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        rechargeMethod === 'vodafone'
                          ? 'border-red-500 bg-red-50/50 text-red-600 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Smartphone className="h-5 w-5 mb-1.5 shrink-0 text-red-500" />
                      <span className="text-[10px] font-black">كاش (محفظة هاتف)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRechargeMethod('card')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        rechargeMethod === 'card'
                          ? 'border-red-500 bg-red-50/50 text-red-600 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard className="h-5 w-5 mb-1.5 shrink-0 text-indigo-500" />
                      <span className="text-[10px] font-black">بطاقة بنكية (فيزا)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRechargeMethod('fawry')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        rechargeMethod === 'fawry'
                          ? 'border-red-500 bg-red-50/50 text-red-600 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-base mb-1 shrink-0">🏪</span>
                      <span className="text-[10px] font-black">منفذ فوري</span>
                    </button>
                  </div>
                </div>

                {/* Gateway Detail Panel */}
                <div className="border-t border-slate-100 pt-4">
                  {rechargeMethod === 'vodafone' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-1">
                        <label className="text-[10px] font-bold text-slate-400">رقم المحفظة (فودافون كاش / اتصالات / أورانج)</label>
                        <input
                          type="text"
                          maxLength={11}
                          value={rechargePhone}
                          onChange={(e) => setRechargePhone(e.target.value)}
                          placeholder="مثال: 01012345678"
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-500 text-left animate-none"
                          dir="ltr"
                        />
                        <p className="text-[9px] text-slate-400 mt-0.5 text-right">سيتم إرسال رمز OTP للمحاكاة وتأكيد السحب الفوري من محفظتك بفرشوط.</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!/^01[0125]\d{8}$/.test(rechargePhone.trim())) {
                            showToast('الرجاء إدخال رقم هاتف مصري صحيح مكون من 11 رقماً يبدأ بـ 01', 'error');
                            return;
                          }
                          if (!rechargeAmount || Number(rechargeAmount) <= 0) {
                            showToast('الرجاء تحديد مبلغ شحن صحيح أكبر من صفر', 'error');
                            return;
                          }
                          setRechargeOtp('');
                          setRechargeStep('otp');
                        }}
                        className="w-full bg-red-500 text-white rounded-xl py-2.5 text-center font-bold text-xs shadow-md hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        طلب كود السداد والمتابعة
                      </button>
                    </div>
                  )}

                  {rechargeMethod === 'card' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-1">
                        <label className="text-[10px] font-bold text-slate-400 text-right">اسم حامل البطاقة (بالعربية أو الإنجليزية)</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="مثال: أحمد محمود علي"
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-500 text-right"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-1">
                        <label className="text-[10px] font-bold text-slate-400 text-right">رقم البطاقة البنكية</label>
                        <input
                          type="text"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                            setCardNumber(val);
                          }}
                          placeholder="4000 1234 5678 9010"
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-500 text-left"
                          dir="ltr"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="grid grid-cols-1 gap-1">
                          <label className="text-[10px] font-bold text-slate-400 text-right">تاريخ الانتهاء</label>
                          <input
                            type="text"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-500 text-center"
                            dir="ltr"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-1">
                          <label className="text-[10px] font-bold text-slate-400 text-right">كود الأمان CVV</label>
                          <input
                            type="password"
                            maxLength={3}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="***"
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-red-500 text-center"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (!cardName.trim() || cardNumber.replace(/\s/g, '').length < 16) {
                            showToast('الرجاء إدخال بيانات بطاقة بنكية صحيحة لمحاكاة الشحن', 'error');
                            return;
                          }
                          const amt = Number(rechargeAmount) || 100;
                          handleCompleteRecharge(amt, 'البطاقة البنكية فيزا 💳');
                        }}
                        className="w-full bg-slate-900 text-white rounded-xl py-2.5 text-center font-bold text-xs shadow-md hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Lock className="h-3.5 w-3.5 text-red-500" />
                        <span>تأكيد خصم الرصيد بفرشوط</span>
                      </button>
                    </div>
                  )}

                  {rechargeMethod === 'fawry' && (
                    <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-2xl text-amber-950 space-y-4">
                      <div className="text-center">
                        <span className="text-[10px] font-bold text-amber-800 block mb-1">كود الخدمة لمنفذ فوري 🏪</span>
                        <div className="bg-white border border-amber-200 py-2.5 rounded-xl font-black text-lg text-slate-800 tracking-wider">
                          78909873
                        </div>
                        <p className="text-[9px] text-amber-700/80 mt-1.5 leading-relaxed text-right">
                          توجه لأي تاجر بفرشوط يمتلك ماكينة فوري وأخبره بالسداد على كود الخدمة هذا.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const amt = Number(rechargeAmount) || 100;
                          handleCompleteRecharge(amt, 'فوري كود 🏪');
                        }}
                        className="w-full bg-amber-500 text-white hover:bg-amber-600 rounded-xl py-2.5 text-center font-bold text-xs transition-colors cursor-pointer"
                      >
                        محاكاة سداد تاجر فوري وتفعيل الرصيد
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: OTP (Vodafone Cash verification) */}
            {rechargeStep === 'otp' && (
              <div className="p-6 space-y-5 text-center">
                <div className="h-12 w-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto text-xl">
                  💬
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-800 text-sm">رمز التحقق لمرة واحدة OTP</h4>
                  <p className="text-[10px] text-slate-400">تم إرسال رمز التحقق في رسالة نصية قصيرة إلى {rechargePhone} (محاكاة)</p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    maxLength={4}
                    value={rechargeOtp}
                    onChange={(e) => setRechargeOtp(e.target.value)}
                    placeholder="- - - -"
                    className="w-32 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-lg font-black tracking-widest text-slate-800 outline-none focus:border-red-500 text-center mx-auto block"
                    dir="ltr"
                  />
                  <p className="text-[9px] text-slate-400 font-bold">يمكنك كتابة أي 4 أرقام للمتابعة بنجاح (الكود التجريبي: 1234)</p>
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const amt = Number(rechargeAmount) || 100;
                      handleCompleteRecharge(amt, `محفظة كاش (${rechargePhone}) 📱`);
                    }}
                    className="flex-grow bg-red-500 text-white rounded-xl py-2.5 font-bold text-xs shadow-md hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    تأكيد الدفع الآن
                  </button>
                  <button
                    type="button"
                    onClick={() => setRechargeStep('input')}
                    className="flex-grow bg-slate-100 text-slate-600 rounded-xl py-2.5 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    رجوع وتعديل البيانات
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success Screen */}
            {rechargeStep === 'success' && (
              <div className="p-8 text-center space-y-5">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center mx-auto text-3xl animate-bounce">
                  ✨
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-slate-800 text-base">تمت عملية الشحن بنجاح!</h4>
                  <p className="text-xs text-slate-500 leading-relaxed px-4 text-center">
                    تم إيداع مبلغ <span className="text-emerald-600 font-black">{Number(rechargeAmount).toFixed(2)} ج.م</span> بنجاح داخل محفظتك الرقمية مسبقة الدفع.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl flex justify-between items-center max-w-xs mx-auto text-xs">
                  <span className="font-bold text-slate-400">رصيد المحفظة الإجمالي الحالي:</span>
                  <span className="font-black text-emerald-600">{walletBalance.toFixed(2)} ج.م</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRechargeModalOpen(false)}
                  className="w-full bg-slate-950 text-white rounded-xl py-3 text-center font-bold text-xs shadow-md hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  العودة لتصفح حسابي
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Update Notification Ribbon / Banner */}
      {isUpdateAvailable && !showUpdateModal && (
        <div 
          onClick={() => setShowUpdateModal(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl px-5 py-3.5 shadow-2xl border border-red-500/20 flex items-center justify-between gap-4 animate-pulse cursor-pointer hover:brightness-110 transition-all max-w-sm"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🚀</span>
            <div className="text-right">
              <h5 className="text-[10px] font-black tracking-tight text-white/90">يتوفر إصدار جديد لبرنامج طلبات فرشوط</h5>
              <p className="text-[9px] text-red-50/85 font-bold">انقر هنا لتحديث التطبيق مجاناً فوراً v1.1.0</p>
            </div>
          </div>
          <span className="text-xs font-black bg-white/20 px-2 py-1 rounded-lg shrink-0">تحديث 🔄</span>
        </div>
      )}

        {/* System Update Details & Simulation Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" dir="rtl">
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

        {/* PC Installation Guide & File Creator Modal */}
        {showPCInstallModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" dir="rtl">
            <div className="bg-white rounded-[32px] w-full max-w-[420px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92%] animate-slide-up">
              
              {/* Header */}
              <div className="bg-gradient-to-tr from-slate-900 to-slate-800 p-6 text-center text-white relative shrink-0">
                <button 
                  onClick={() => setShowPCInstallModal(false)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="text-3xl block mb-2">💻</span>
                <h3 className="font-black text-base">تثبيت طلبات فرشوط على الكمبيوتر</h3>
                <p className="text-[11px] text-red-400 font-extrabold mt-1">تصفح واطلب من الكمبيوتر مباشرة كبرنامج مستقل</p>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-right font-sans">
                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                  يمكنك تشغيل وتثبيت <b>طلبات فرشوط</b> على جهاز الكمبيوتر الشخصي أو المحمول (PC / Laptop / Mac) ليعمل كبرنامج مثبت على نظام التشغيل الخاص بك بدون متصفح وبسرعة فائقة.
                </p>

                {/* Option 1: Chrome/Edge Native Installation (Recommended) */}
                <div className="bg-red-50/40 p-4 rounded-2xl border border-red-100/60 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs font-black">1</span>
                    <h4 className="font-extrabold text-xs text-slate-800">التثبيت الذكي عبر المتصفح (موصى به)</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 font-bold leading-relaxed pr-8">
                    إذا كنت تستخدم متصفح <b>Google Chrome</b> أو <b>Microsoft Edge</b>:
                  </p>
                  <ul className="space-y-1.5 text-[10px] text-slate-600 font-bold pr-8 list-disc list-inside">
                    <li>ابحث عن أيقونة <b>"شاشة مع سهم للأسفل"</b> أو علامة <b>(+)</b> في شريط العنوان بالأعلى بجوار المفضلة.</li>
                    <li>اضغط عليها ثم اختر <b>"تثبيت" (Install)</b>.</li>
                    <li>سيظهر التطبيق كبرنامج مستقل على سطح المكتب وقائمة ابدأ فوراً مع الأيقونة الرسمية!</li>
                  </ul>
                </div>

                {/* Option 2: Download Installation Files */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black">2</span>
                    <h4 className="font-extrabold text-xs text-slate-800">تحميل ملفات التشغيل والاختصار المباشر</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed pr-8">
                    إذا كنت تريد ملفاً قابلاً للتشغيل المباشر من سطح المكتب، اختر أحد الملفين بالأسفل:
                  </p>

                  <div className="grid grid-cols-1 gap-2.5 pt-1.5">
                    {/* .URL Shortcut */}
                    <button
                      onClick={downloadPCUrlShortcut}
                      className="w-full bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50/20 text-slate-700 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">🔗</span>
                        <div className="text-right">
                          <p className="font-black text-xs text-slate-800">تحميل اختصار سطح المكتب المباشر</p>
                          <p className="text-[9px] text-slate-400 font-bold">ملف طلبات_فرشوط.url (آمن ويدعم Mac / Windows)</p>
                        </div>
                      </span>
                      <ArrowDownLeft className="h-4 w-4 text-slate-400 animate-bounce" />
                    </button>

                    {/* .BAT Installer */}
                    <button
                      onClick={downloadPCInstallerBat}
                      className="w-full bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50/20 text-slate-700 px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm">⚙️</span>
                        <div className="text-right">
                          <p className="font-black text-xs text-slate-800">تحميل مثبت سطح المكتب التلقائي</p>
                          <p className="text-[9px] text-slate-400 font-bold">ملف تثبيت_طلبات_فرشوط.bat (خاص بويندوز فقط)</p>
                        </div>
                      </span>
                      <ArrowDownLeft className="h-4 w-4 text-slate-400 animate-bounce" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
                <button
                  onClick={() => setShowPCInstallModal(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-3 rounded-2xl transition-all cursor-pointer text-center"
                >
                  حسناً، إغلاق النافذة
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Main Application Container */}
        <div className="flex-grow flex flex-col relative bg-slate-50">
          
          {!isLoggedIn ? (
            /* Unified Landing & Login Selector Gateway */
            <div className="flex-grow flex flex-col justify-between bg-slate-50 p-6 overflow-y-auto">
              <div className="space-y-6 pt-6">
                
                {/* Logo and Greeting */}
                <div className="text-center space-y-4 pt-2">
                  <div className="relative mx-auto h-22 w-22">
                    {/* Glowing outer backdrop ring */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-red-500 to-amber-500 rounded-[30px] blur-md opacity-30 animate-pulse" />
                    <div className="relative h-22 w-22 rounded-[28px] bg-white border-2 border-slate-100 shadow-[0_10px_25px_rgba(239,68,68,0.15)] overflow-hidden flex items-center justify-center transform hover:rotate-6 transition-transform duration-500">
                      <img
                        src={localStorage.getItem('android_app_icon') || '/pwa_icon.jpg'}
                        alt="شعار طلبات فرشوط"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">طلبات فرشوط</h2>
                    <p className="text-xs text-slate-500 font-extrabold px-4 leading-normal">المنصة الشاملة والموحدة لتوصيل الطلبات بمركز فرشوط 🇪🇬</p>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 text-red-600 rounded-full py-1.5 px-5 text-[10px] font-black inline-block border border-red-100/60 shadow-sm">
                    أهلاً بك في تطبيق الهاتف المطور 👋
                  </div>
                </div>

                {/* Portals Selection */}
                <div className="space-y-3.5 pt-3">
                  <span className="text-[11px] font-black text-slate-400 block pb-1 pr-1">الرجاء اختيار نوع الحساب للمتابعة:</span>
                  
                  {/* Customer Portal Card */}
                  <button
                    onClick={() => {
                      setCurrentRole('customer');
                      setIsLoggedIn(true);
                      localStorage.setItem('portal_role', 'customer');
                      localStorage.setItem('talabat_is_logged_in', 'true');
                      setActiveTab('explore');
                    }}
                    className="w-full text-right bg-white hover:bg-red-50/10 border border-slate-100/80 hover:border-red-200/80 p-5 rounded-[24px] transition-all duration-300 shadow-sm hover:shadow-[0_8px_20px_rgba(239,68,68,0.06)] flex items-center justify-between group cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-red-500 to-rose-500 text-white flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 shadow-[0_4px_12px_rgba(239,68,68,0.2)] transition-transform duration-300">
                        🧑‍💼
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-800 group-hover:text-red-600 transition-colors">الدخول كعميل لتسوق المنتجات</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-bold leading-normal">اطلب مأكولاتك، البقالة والحلويات المفضلة بفرشوط</p>
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:translate-x-[-4px] group-hover:text-red-500 transition-all shrink-0" />
                  </button>

                  {/* Merchant Portal Card */}
                  <button
                    onClick={() => {
                      setCurrentRole('merchant');
                      setIsLoggedIn(true);
                      localStorage.setItem('portal_role', 'merchant');
                      localStorage.setItem('talabat_is_logged_in', 'true');
                    }}
                    className="w-full text-right bg-white hover:bg-amber-50/10 border border-slate-100/80 hover:border-amber-200/80 p-5 rounded-[24px] transition-all duration-300 shadow-sm hover:shadow-[0_8px_20px_rgba(245,158,11,0.06)] flex items-center justify-between group cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 shadow-[0_4px_12px_rgba(245,158,11,0.2)] transition-transform duration-300">
                        🏪
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-800 group-hover:text-amber-600 transition-colors">بوابة شركاء فرشوط (المطاعم)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-bold leading-normal">إدارة الأصناف والأسعار واستقبال طلبات الزبائن فورياً</p>
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:translate-x-[-4px] group-hover:text-amber-500 transition-all shrink-0" />
                  </button>

                  {/* Driver Portal Card */}
                  <button
                    onClick={() => {
                      setCurrentRole('driver');
                      setIsLoggedIn(true);
                      localStorage.setItem('portal_role', 'driver');
                      localStorage.setItem('talabat_is_logged_in', 'true');
                    }}
                    className="w-full text-right bg-white hover:bg-slate-50 border border-slate-100/80 hover:border-slate-300 p-5 rounded-[24px] transition-all duration-300 shadow-sm hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)] flex items-center justify-between group cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center text-xl shrink-0 group-hover:scale-105 shadow-[0_4px_12px_rgba(15,23,42,0.2)] transition-transform duration-300">
                        🏍️
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-800 group-hover:text-slate-900 transition-colors">بوابة كباتن التوصيل (الطيار)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-bold leading-normal">توصيل الطلبيات بفرشوط وتتبع الأرباح والمستحقات</p>
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:translate-x-[-4px] group-hover:text-slate-900 transition-all shrink-0" />
                  </button>

                  {/* Admin Portal Card */}
                  <button
                    onClick={() => {
                      setCurrentRole('admin');
                      setIsLoggedIn(true);
                      localStorage.setItem('portal_role', 'admin');
                      localStorage.setItem('talabat_is_logged_in', 'true');
                    }}
                    className="w-full text-right bg-white hover:bg-emerald-50/10 border border-slate-100/80 hover:border-emerald-200/80 p-5 rounded-[24px] transition-all duration-300 shadow-sm hover:shadow-[0_8px_20px_rgba(16,185,129,0.06)] flex items-center justify-between group cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center text-xl shrink-0 group-hover:scale-105 shadow-[0_4px_12px_rgba(16,185,129,0.2)] transition-transform duration-300">
                        ⚙️
                      </div>
                      <div>
                        <h4 className="font-black text-xs text-slate-800 group-hover:text-emerald-600 transition-colors">لوحة الإدارة والنظام</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-bold leading-normal">تعديل المطاعم والأصناف والتحكم الشامل بطلبك</p>
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:translate-x-[-4px] group-hover:text-emerald-500 transition-all shrink-0" />
                  </button>
                </div>

                {/* Direct Support shortcut in login screen */}
                <div className="pt-2">
                  <button 
                    onClick={() => setIsSupportModalOpen(true)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-2xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>☎️</span>
                    <span>الاتصال المباشر بالدعم والمساعدة (إدارة طلبات فرشوط)</span>
                  </button>
                </div>
              </div>

              <div className="pt-6 text-center space-y-1 pb-4">
                <span className="text-[9px] text-slate-400 block font-bold">تطبيق طلبات فرشوط المطور © 2026</span>
                <span className="text-[8px] text-slate-300 block font-bold">تصميم وبرمجة مهندسي طلبات فرشوط 🇪🇬</span>
              </div>
            </div>
          ) : (
            /* Logged-In Portal Dashboard */
            <>
              {currentRole === 'customer' && !customerAccount ? (
                <WhatsAppLogin
                  onLoginSuccess={(account) => {
                    setCustomerAccount(account);
                    localStorage.setItem('customer_account_data', JSON.stringify(account));
                    showToast('تم تفعيل حسابك بنجاح عبر الواتساب وتسجيل الدخول! 🎉', 'success');
                  }}
                />
              ) : (
                <>
                  {/* Premium Unified Responsive Header for PC and Mobile */}
                  <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] shrink-0">
                <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => { setSelectedShopId(null); setActiveTab('explore'); }}>
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-md shadow-red-500/10">
                    <span className="text-lg">🛵</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm sm:text-base text-slate-900 block tracking-tight">طلبات فرشوط</span>
                    <span className="text-[10px] text-slate-400 font-bold block -mt-0.5">المنصة الموحدة لمركز فرشوط 📍</span>
                  </div>
                </div>

                {/* Center Section: Navigation or Active Portal Details */}
                <div className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200/60 px-4 py-1.5 rounded-full text-xs font-black text-slate-700">
                  <span>📍 المركز: فرشوط البلد</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-red-600 font-bold">
                    {currentRole === 'admin' 
                      ? 'بوابة الإدارة العامة 🛠️' 
                      : currentRole === 'merchant' 
                        ? 'لوحة إدارة المتجر 🏪' 
                        : currentRole === 'driver' 
                          ? 'بوابة كابتن التوصيل 🏍️' 
                          : 'بوابة العميل التجريبية 🧑‍💼'}
                  </span>
                </div>

                {/* Left Section: Support & Logout controls */}
                <div className="flex items-center gap-2.5">
                  <span className="hidden sm:inline-flex text-[10px] bg-red-50 border border-red-100 text-red-600 font-extrabold px-3 py-1.5 rounded-xl">
                    خصم 30% كود: MASR30 ✨
                  </span>
                  
                  <button
                    onClick={() => setIsSupportModalOpen(true)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[11px] px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-slate-200/50"
                  >
                    <span>💬 الدعم</span>
                  </button>

                  {/* Notification Bell with Badge & Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className={`relative p-2 rounded-xl transition-all cursor-pointer border flex items-center justify-center h-8.5 w-8.5 ${
                        isNotificationsOpen 
                          ? 'bg-red-50 text-red-600 border-red-200' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/50'
                      }`}
                      title="الإشعارات والتنبيهات"
                    >
                      {unreadCount > 0 ? (
                        <BellRing className="h-4 w-4 text-red-600 animate-pulse" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                      
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-red-600 text-white rounded-full text-[8px] font-black flex items-center justify-center animate-pulse shadow-md shadow-red-500/30">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Center Dropdown Portal */}
                    {isNotificationsOpen && (
                      <div className="absolute left-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-50 overflow-hidden text-right animate-in fade-in slide-in-from-top-2 duration-200" dir="rtl">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-xs text-slate-900">مركز الإشعارات الذكي</h4>
                            <span className="text-[8px] bg-red-100 text-red-600 font-extrabold px-1.5 py-0.5 rounded-full">تحديث مباشر</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <button 
                                onClick={() => {
                                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                                  showToast('تم تحديد جميع الإشعارات كمقروءة ✓', 'info');
                                }}
                                className="text-[10px] text-red-500 hover:text-red-600 font-bold transition-colors cursor-pointer"
                              >
                                قراءة الكل
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setNotifications([]);
                                showToast('تم مسح سجل الإشعارات بنجاح 🗑️', 'info');
                              }}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              title="مسح السجل"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setIsNotificationsMuted(!isNotificationsMuted)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              title={isNotificationsMuted ? "تفعيل الصوت" : "كتم الصوت"}
                            >
                              {isNotificationsMuted ? <VolumeX className="h-3.5 w-3.5 text-red-500" /> : <Volume2 className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* List container */}
                        <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-50">
                          {notifications.length === 0 ? (
                            <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2">
                              <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                🔔
                              </div>
                              <p className="text-slate-400 text-[10px] font-bold">لا توجد إشعارات حالياً</p>
                              <p className="text-slate-300 text-[9px]">سيتم تنبيهك بتحديثات حالة الطلب فور حدوثها!</p>
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div 
                                key={notification.id}
                                onClick={() => {
                                  // Mark as read
                                  setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
                                  if (notification.orderId) {
                                    setActiveOrderId(notification.orderId);
                                    setActiveTab('tracking');
                                    setSelectedShopId(null);
                                    setIsNotificationsOpen(false);
                                  }
                                }}
                                className={`p-3.5 text-right transition-colors cursor-pointer flex gap-3 items-start hover:bg-slate-50 ${
                                  !notification.read ? 'bg-red-50/20' : ''
                                }`}
                              >
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-sm shadow-sm ${
                                  notification.status === 'received' 
                                    ? 'bg-blue-50 text-blue-500' 
                                    : notification.status === 'preparing'
                                      ? 'bg-amber-50 text-amber-500'
                                      : notification.status === 'on_the_way'
                                        ? 'bg-red-50 text-red-500'
                                        : notification.status === 'delivered'
                                          ? 'bg-emerald-50 text-emerald-500'
                                          : 'bg-slate-50 text-slate-500'
                                }`}>
                                  {notification.status === 'received' ? '📋' : notification.status === 'preparing' ? '🍳' : notification.status === 'on_the_way' ? '🛵' : notification.status === 'delivered' ? '🎉' : '🔔'}
                                </div>
                                
                                <div className="flex-grow">
                                  <div className="flex items-center justify-between gap-2">
                                    <h5 className={`text-[11px] font-black ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                                      {notification.title}
                                    </h5>
                                    <span className="text-[8px] text-slate-400 shrink-0 font-bold">{notification.date}</span>
                                  </div>
                                  <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">{notification.message}</p>
                                  
                                  {notification.orderId && (
                                    <span className="inline-flex items-center gap-1 text-[8px] text-red-500 font-extrabold mt-1.5 hover:underline">
                                      <span>انقر للتتبع الحي 🛵</span>
                                      <span>رقم الأوردر: #{notification.orderId.slice(-4)}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {notifications.length > 0 && (
                          <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center text-[9px] text-slate-400 font-bold">
                            المنصة الذكية الموحدة لمركز فرشوط 📍
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      localStorage.removeItem('talabat_is_logged_in');
                      setToast({ message: 'تم تسجيل الخروج بنجاح 👋', type: 'info' });
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-black text-[11px] px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-red-500/10"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline">تسجيل الخروج</span>
                  </button>
                </div>
              </header>

              {/* Main Container */}
              <main className={`flex-grow w-full p-4 pb-24 overflow-y-auto bg-slate-50 ${isFullScreen ? 'max-w-7xl mx-auto' : ''}`}>
        
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
                      <p className="text-slate-400 font-bold mb-2">عذراً، لم نجد أي متجر يطابق هذا البحث والتصفية</p>
                      <p className="text-xs text-slate-400">جرب تغيير الفلتر أو البحث بكلمات أخرى</p>
                    </div>
                  ) : (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${isFullScreen ? 'md:grid-cols-3 lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
                      {filteredShops.map((shop) => (
                        <ShopCard
                          key={shop.id}
                          shop={shop}
                          onClick={() => setSelectedShopId(shop.id)}
                          isFavorite={favorites.includes(shop.id)}
                          onToggleFavorite={() => handleToggleFavorite(shop.id)}
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
              initialAddress={customerAccount?.address || ''}
              initialPhone={customerAccount?.phone || ''}
              initialWalletNumber={customerAccount?.mobileWalletNumber || ''}
              initialWalletProvider={customerAccount?.mobileWalletProvider || 'vodafone'}
              onSaveDefaultAddressAndPhone={handleSaveDefaultAddressAndPhone}
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

              {/* WhatsApp Verification Status Card */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg shrink-0">💬</span>
                  <div className="text-right">
                    <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                      <span>تم تفعيل الحساب وتوثيقه بالواتساب</span>
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">رقم التفعيل المسجل: {customerAccount?.phone || 'غير مسجل'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCustomerAccount(null);
                    localStorage.removeItem('customer_account_data');
                    showToast('يرجى تسجيل الدخول أو تأكيد حسابك الجديد بالواتساب 💬', 'info');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer self-stretch sm:self-auto"
                >
                  <span>تسجيل دخول / حساب جديد</span>
                </button>
              </div>

              {/* Mobile Wallet Settings & Quick Payment Section */}
              <div className="bg-gradient-to-l from-slate-900 via-slate-850 to-slate-900 rounded-[28px] p-5 text-white shadow-xl relative overflow-hidden border border-white/10">
                {/* Background decorative patterns */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                      <Wallet className="h-4 w-4 text-red-400" />
                    </div>
                    <span className="text-xs font-black tracking-wide text-slate-200">محفظة الهاتف الذكي الافتراضية 📱</span>
                  </div>
                  <span className="text-[9px] bg-red-500/20 border border-red-500/30 text-red-300 px-2 py-0.5 rounded-full font-black">كاش / إنستاباي</span>
                </div>

                <div className="space-y-3 mt-1 text-right">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-1">نوع المحفظة</label>
                      <select
                        value={customerAccount?.mobileWalletProvider || 'vodafone'}
                        onChange={(e) => {
                          const updated = { 
                            ...(customerAccount || { name: 'عميل طلبات فرشوط', phone: '', address: '' }), 
                            mobileWalletProvider: e.target.value 
                          };
                          setCustomerAccount(updated);
                          localStorage.setItem('customer_account_data', JSON.stringify(updated));
                          showToast('تم تحديث نوع محفظة كاش! 💾', 'info');
                        }}
                        className="w-full rounded-xl border border-white/10 px-2.5 py-1.5 text-xs text-white bg-white/5 focus:outline-none focus:border-red-400 font-bold cursor-pointer"
                      >
                        <option value="vodafone" className="text-slate-900">فودافون كاش 🔴</option>
                        <option value="orange" className="text-slate-900">أورنج كاش 🟠</option>
                        <option value="etisalat" className="text-slate-900">اتصالات كاش 🟢</option>
                        <option value="we" className="text-slate-900">وي كاش 🟣</option>
                        <option value="instapay" className="text-slate-900">إنستاباي (InstaPay) ⚡</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] text-slate-400 font-bold mb-1">رقم المحفظة الافتراضي</label>
                      <input
                        type="text"
                        value={customerAccount?.mobileWalletNumber || ''}
                        onChange={(e) => {
                          const updated = { 
                            ...(customerAccount || { name: 'عميل طلبات فرشوط', phone: '', address: '' }), 
                            mobileWalletNumber: e.target.value 
                          };
                          setCustomerAccount(updated);
                          localStorage.setItem('customer_account_data', JSON.stringify(updated));
                        }}
                        placeholder="مثال: 010XXXXXXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white outline-none focus:border-red-400 text-left"
                      />
                    </div>
                  </div>

                  {/* Subtitle / Note */}
                  <p className="text-[10px] text-slate-300 font-bold mt-2 leading-relaxed border-t border-white/5 pt-3">
                    💡 سيتم استخدام هذا الرقم ونوع المحفظة وتعبئتهما تلقائياً كخيار الدفع الافتراضي في حقيبة التسوق عند الدفع عبر محفظة الهاتف الذكي، لتسريع عملية الطلب بفرشوط!
                  </p>
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
                      value={customerAccount?.name || ""}
                      placeholder="لم يتم إدخال الاسم"
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
                      value={customerAccount?.phone || ""}
                      placeholder="01XXXXXXXXX"
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
                      value={customerAccount?.address || ""}
                      placeholder="مثال: قنا، مركز فرشوط، شارع الفارابي"
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
                    onClick={() => setShowPCInstallModal(true)}
                    className="w-full text-right hover:bg-red-50/50 hover:text-red-700 border border-dashed border-red-200/60 bg-red-50/10 px-3 py-2.5 rounded-xl text-xs font-black text-red-600 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🖥️</span>
                      <span>إنشاء وتنزيل ملف تثبيت للكمبيوتر (PC / Mac)</span>
                    </span>
                    <span className="text-[10px] bg-red-500 text-white px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 animate-pulse">
                      <span>تثبيت الآن</span>
                    </span>
                  </button>

                  <button 
                    onClick={handleRequestNotificationPermission}
                    className="w-full text-right hover:bg-slate-50 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">🔔</span>
                      <span>إشعارات الهاتف المباشرة بحالات الطلبات</span>
                    </span>
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1 ${
                      notificationPermission === 'granted' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : notificationPermission === 'denied'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-red-500 text-white animate-pulse'
                    }`}>
                      {notificationPermission === 'granted' && <span>نشطة ومفعّلة</span>}
                      {notificationPermission === 'denied' && <span>مرفوضة بالمتصفح</span>}
                      {notificationPermission === 'default' && <span>تفعيل الآن</span>}
                    </span>
                  </button>

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
              {currentRole === 'customer' && customerAccount && (
                <div className="fixed bottom-0 left-0 right-0 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md md:rounded-2xl md:border md:border-slate-200/80 bg-white/95 backdrop-blur-md border-t border-slate-100 h-16 flex items-center justify-around px-2 z-40 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05),0_10px_30px_rgba(0,0,0,0.08)]">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


     
