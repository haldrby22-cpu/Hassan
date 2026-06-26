import React, { useState } from 'react';
import { Shop, MenuItem, CategoryType } from '../types';
import { Plus, Trash2, Store, Utensils, Coffee, ShieldCheck, Image, FileText, DollarSign, Clock, MapPin, Tag, Lock, User, Eye, EyeOff, AlertCircle, LogOut } from 'lucide-react';

interface AdminPanelProps {
  shops: Shop[];
  menuItems: MenuItem[];
  onAddShop: (shop: Shop) => void;
  onDeleteShop: (shopId: string) => void;
  onAddMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onUpdateShop: (shop: Shop) => void;
  onExitPortal?: () => void;
}

export default function AdminPanel({
  shops,
  menuItems,
  onAddShop,
  onDeleteShop,
  onAddMenuItem,
  onDeleteMenuItem,
  onUpdateShop,
  onExitPortal,
}: AdminPanelProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('admin_authenticated') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Admin Credentials (stored in localStorage)
  const [adminUsername, setAdminUsername] = useState(() => {
    return localStorage.getItem('admin_username') || 'admin';
  });
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('admin_password') || 'admin';
  });

  // Settings Credentials Form State
  const [newAdminUsername, setNewAdminUsername] = useState(() => {
    return localStorage.getItem('admin_username') || 'admin';
  });
  const [newAdminPassword, setNewAdminPassword] = useState(() => {
    return localStorage.getItem('admin_password') || 'admin';
  });
  const [credError, setCredError] = useState('');
  const [credSuccess, setCredSuccess] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === adminUsername && password.trim() === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      setLoginError('');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة! يرجى التأكد من البيانات المدخلة.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    setUsername('');
    setPassword('');
  };

  // New Shop Form State
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState<CategoryType>('restaurants');
  const [shopImage, setShopImage] = useState('');
  const [shopRating, setShopRating] = useState('4.5');
  const [shopDeliveryTime, setShopDeliveryTime] = useState('30');
  const [shopDeliveryFee, setShopDeliveryFee] = useState('10');
  const [shopMinOrder, setShopMinOrder] = useState('20');
  const [shopDistance, setShopDistance] = useState('1.5');
  const [shopTagsInput, setShopTagsInput] = useState('');
  const [shopPassword, setShopPassword] = useState('');

  // New MenuItem Form State
  const [selectedShopId, setSelectedShopId] = useState(shops[0]?.id || '');
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemRating, setItemRating] = useState('4.8');
  const [isPopular, setIsPopular] = useState(false);

  // Form validations
  const [shopError, setShopError] = useState('');
  const [itemError, setItemError] = useState('');
  const [shopSuccess, setShopSuccess] = useState('');
  const [itemSuccess, setItemSuccess] = useState('');

  const handleCreateShop = (e: React.FormEvent) => {
    e.preventDefault();
    setShopError('');
    setShopSuccess('');

    if (!shopName.trim()) {
      setShopError('الرجاء إدخال اسم المتجر');
      return;
    }

    // Default image if empty
    const imgUrl = shopImage.trim() || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';
    const tags = shopTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newShop: Shop = {
      id: `shop-${Date.now()}`,
      name: shopName.trim(),
      category: shopCategory,
      image: imgUrl,
      rating: parseFloat(shopRating) || 4.5,
      reviewsCount: Math.floor(50 + Math.random() * 450),
      deliveryTime: parseInt(shopDeliveryTime) || 30,
      deliveryFee: parseInt(shopDeliveryFee) || 0,
      minOrder: parseInt(shopMinOrder) || 15,
      distance: parseFloat(shopDistance) || 1.2,
      tags: tags.length > 0 ? tags : ['جديد', 'موصى به'],
      featured: true,
      password: shopPassword.trim() || '123456',
    };

    onAddShop(newShop);
    setShopSuccess(`تمت إضافة المتجر "${newShop.name}" بنجاح!`);
    
    // Reset
    setShopName('');
    setShopImage('');
    setShopTagsInput('');
    setShopPassword('');
    if (!selectedShopId) {
      setSelectedShopId(newShop.id);
    }
  };

  const handleCreateMenuItem = (e: React.FormEvent) => {
    e.preventDefault();
    setItemError('');
    setItemSuccess('');

    const targetShopId = selectedShopId || (shops[0]?.id || '');

    if (!targetShopId) {
      setItemError('الرجاء اختيار متجر أولاً أو إضافة متجر جديد');
      return;
    }
    if (!itemName.trim()) {
      setItemError('الرجاء إدخال اسم الوجبة/المنتج');
      return;
    }
    if (!itemPrice.trim() || isNaN(parseFloat(itemPrice))) {
      setItemError('الرجاء إدخال سعر صحيح للمنتج');
      return;
    }

    const imgUrl = itemImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80';

    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      shopId: targetShopId,
      name: itemName.trim(),
      description: itemDescription.trim() || 'مكونات طازجة ومحضرة بعناية فائقة عند الطلب.',
      price: parseFloat(itemPrice),
      image: imgUrl,
      rating: parseFloat(itemRating) || 4.8,
      popular: isPopular,
    };

    onAddMenuItem(newItem);
    setItemSuccess(`تمت إضافة المنتج "${newItem.name}" بنجاح!`);

    // Reset
    setItemName('');
    setItemDescription('');
    setItemPrice('');
    setItemImage('');
    setIsPopular(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-3xl">
            🔒
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">تسجيل الدخول للوحة التحكم</h2>
          <p className="text-xs text-slate-400">يرجى إدخال اسم المستخدم وكلمة المرور للمتابعة</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <span>اسم المستخدم</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="مثال: admin"
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
                placeholder="مثال: admin"
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
            تسجيل الدخول
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
            <span>بيانات الدخول الحالية للوحة الإدارة:</span>
          </p>
          <div className="font-mono text-[11px] text-amber-700/90 flex flex-col gap-0.5 mt-1.5 bg-white/50 p-2 rounded-lg border border-amber-50">
            <div>اسم المستخدم: <span className="font-bold select-all bg-amber-100/50 px-1 rounded">{adminUsername}</span></div>
            <div>كلمة المرور: <span className="font-bold select-all bg-amber-100/50 px-1 rounded">{adminPassword}</span></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">يمكنك تغيير هذه البيانات في أي وقت من داخل لوحة التحكم بعد تسجيل الدخول.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl">
          ⚙️
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-extrabold text-slate-800">لوحة التحكم وإدارة التطبيق</h2>
          <p className="text-xs text-slate-400 mt-1">تعديل المتاجر، إضافة مطاعم، بقالات، كافيهات، أو منتجات جديدة فوراً</p>
        </div>
        <button
          onClick={handleLogout}
          className="mr-auto px-4 py-2 text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100/80 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="h-4 w-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Create New Shop Form */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Change Admin Credentials Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-[24px] p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-extrabold text-xs text-slate-100 flex items-center gap-2 pb-2 border-b border-white/10">
              <ShieldCheck className="h-4.5 w-4.5 text-red-500 animate-pulse" />
              <span>إعدادات حماية لوحة التحكم (تغيير اسم المستخدم والرقم السري)</span>
            </h3>
            
            <p className="text-[10.5px] text-slate-300 leading-relaxed font-semibold">
              قم بتعديل بيانات الدخول الافتراضية لحماية لوحة الإدارة من الوصول غير المصرح به. سيتم حفظ البيانات فورياً في ذاكرة الهاتف/المتصفح الآمنة.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              setCredError('');
              setCredSuccess('');
              const u = newAdminUsername.trim();
              const p = newAdminPassword.trim();
              if (!u) {
                setCredError('اسم المستخدم لا يمكن أن يكون فارغاً!');
                return;
              }
              if (p.length < 4) {
                setCredError('كلمة المرور يجب أن تكون 4 خانات على الأقل!');
                return;
              }
              setAdminUsername(u);
              setAdminPassword(p);
              localStorage.setItem('admin_username', u);
              localStorage.setItem('admin_password', p);
              setCredSuccess('تم حفظ اسم المستخدم وكلمة المرور الجديدة بنجاح! 🎉');
            }} className="space-y-3.5">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block">اسم المستخدم الجديد:</label>
                  <input
                    type="text"
                    value={newAdminUsername}
                    onChange={(e) => setNewAdminUsername(e.target.value)}
                    placeholder="اسم المستخدم الجديد"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700/85 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block">كلمة المرور الجديدة:</label>
                  <input
                    type="text"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="كلمة المرور الجديدة"
                    className="w-full rounded-xl bg-slate-800 border border-slate-700/85 px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>
              </div>

              {credError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-xl text-[10px] font-bold">
                  ⚠️ {credError}
                </div>
              )}

              {credSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-xl text-[10px] font-bold">
                  ✅ {credSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:brightness-110 text-white font-black text-[11px] py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer transform active:scale-95"
              >
                حفظ بيانات الحماية الجديدة 🔒
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-800 mb-4 pb-2 border-b border-slate-50 flex items-center gap-2">
              <Plus className="h-5 w-5 text-red-500" />
              <span>إضافة متجر جديد (مطعم، بقالة، كافيه)</span>
            </h3>

            <form onSubmit={handleCreateShop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">اسم المتجر *</label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="مثال: شاورما كرم الشام، سوبرماركت سعودي"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400 placeholder-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">النوع / القسم *</label>
                  <select
                    value={shopCategory}
                    onChange={(e) => setShopCategory(e.target.value as CategoryType)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400 bg-white"
                  >
                    <option value="restaurants">🍔 مطعم</option>
                    <option value="grocery">🥦 بقالة وسوبرماركت</option>
                    <option value="cafes">☕ كافيه وحلويات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">التقييم الافتراضي</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={shopRating}
                    onChange={(e) => setShopRating(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">رابط صورة المتجر (اختياري)</label>
                <input
                  type="url"
                  value={shopImage}
                  onChange={(e) => setShopImage(e.target.value)}
                  placeholder="رابط الصورة (إن وجد) أو سيتم اختيار صورة تلقائية"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400 placeholder-slate-300 text-left"
                  style={{ direction: 'ltr' }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5">وقت التوصيل (دقيقة)</label>
                  <input
                    type="number"
                    value={shopDeliveryTime}
                    onChange={(e) => setShopDeliveryTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5">رسوم التوصيل (ج.م)</label>
                  <input
                    type="number"
                    value={shopDeliveryFee}
                    onChange={(e) => setShopDeliveryFee(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5">حد أدنى للطلب (ج.م)</label>
                  <input
                    type="number"
                    value={shopMinOrder}
                    onChange={(e) => setShopMinOrder(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">المسافة كم</label>
                  <input
                    type="number"
                    step="0.1"
                    value={shopDistance}
                    onChange={(e) => setShopDistance(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">الوسوم (مفصولة بفاصلة)</label>
                  <input
                    type="text"
                    value={shopTagsInput}
                    onChange={(e) => setShopTagsInput(e.target.value)}
                    placeholder="كشري, مصري, لذيذ"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400 placeholder-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-red-500" />
                  <span>كلمة مرور لوحة التاجر للمطعم (اختياري - الافتراضي: 123456)</span>
                </label>
                <input
                  type="text"
                  value={shopPassword}
                  onChange={(e) => setShopPassword(e.target.value)}
                  placeholder="مثال: 123456"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400 placeholder-slate-300 text-left"
                  style={{ direction: 'ltr' }}
                />
              </div>

              {shopError && <p className="text-xs text-red-500 font-semibold">{shopError}</p>}
              {shopSuccess && <p className="text-xs text-emerald-600 font-semibold">{shopSuccess}</p>}

              <button
                type="submit"
                className="w-full bg-red-500 text-white font-bold rounded-xl py-3 hover:bg-red-600 transition-colors cursor-pointer"
              >
                إضافة المتجر الآن
              </button>
            </form>
          </div>

          {/* Add Menu Item Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-800 mb-4 pb-2 border-b border-slate-50 flex items-center gap-2">
              <Plus className="h-5 w-5 text-red-500" />
              <span>إضافة منتج أو وجبة لمتجر</span>
            </h3>

            <form onSubmit={handleCreateMenuItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">اختر المتجر التابع له المنتج *</label>
                <select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400 bg-white"
                >
                  <option value="">-- اختر المتجر --</option>
                  {shops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category === 'restaurants' ? 'مطعم' : s.category === 'grocery' ? 'بقالة' : 'كافيه'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">اسم الوجبة/المنتج *</label>
                  <input
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="مثال: دبل تشيز برجر بيف"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400 placeholder-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">السعر ج.م *</label>
                  <input
                    type="number"
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="15"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400 placeholder-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">وصف المكونات / المنتج</label>
                <textarea
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="مكون من لحم بقري طازج، جبن شيدر، خس طازج وصوص خاص"
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400 placeholder-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">رابط الصورة (اختياري)</label>
                  <input
                    type="url"
                    value={itemImage}
                    onChange={(e) => setItemImage(e.target.value)}
                    placeholder="رابط صورة الوجبة"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400 placeholder-slate-300 text-left"
                    style={{ direction: 'ltr' }}
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded text-red-500 focus:ring-red-400"
                  />
                  <label htmlFor="isPopular" className="text-xs font-bold text-slate-600 cursor-pointer">
                    تمييز كـ "شائع 🔥"
                  </label>
                </div>
              </div>

              {itemError && <p className="text-xs text-red-500 font-semibold">{itemError}</p>}
              {itemSuccess && <p className="text-xs text-emerald-600 font-semibold">{itemSuccess}</p>}

              <button
                type="submit"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl py-3 transition-colors cursor-pointer"
              >
                إضافة المنتج للقائمة
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Existing Shops List & Delete Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-800 mb-2 pb-2 border-b border-slate-50 flex items-center gap-2">
              <Store className="h-5 w-5 text-red-500" />
              <span>المتاجر النشطة حالياً ({shops.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-medium">يمكنك تعديل رمز دخول (كلمة مرور) أي مطعم مباشرة من الحقل المخصص له، أو حذف المتجر لإزالته تماماً من التطبيق.</p>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {shops.map((shop) => {
                const shopItemsCount = menuItems.filter((i) => i.shopId === shop.id).length;
                return (
                  <div
                    key={shop.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-red-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={shop.image}
                        alt={shop.name}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 object-cover rounded-xl bg-white border border-slate-100 animate-pulse-once"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{shop.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-bold">
                          <span>
                            {shop.category === 'restaurants' ? '🍔 مطعم' : shop.category === 'grocery' ? '🥦 بقالة' : '☕ كافيه'}
                          </span>
                          <span>•</span>
                          <span>{shopItemsCount} منتج</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1 bg-white border border-slate-100 rounded-lg px-2 py-0.5 shadow-sm max-w-max">
                          <Lock className="h-3 w-3 text-red-500" />
                          <span className="text-[9px] text-slate-400 font-bold">كلمة المرور:</span>
                          <input
                            type="text"
                            value={shop.password || '123456'}
                            onChange={(e) => {
                              onUpdateShop({
                                ...shop,
                                password: e.target.value,
                              });
                            }}
                            className="w-16 text-[10px] font-extrabold text-slate-700 bg-transparent focus:outline-none border-b border-dashed border-slate-300 focus:border-red-400 text-center px-0.5"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const directUrl = `${window.location.origin}${window.location.pathname}?role=merchant&shopId=${shop.id}`;
                          navigator.clipboard.writeText(directUrl);
                          alert(`تم نسخ رابط الدخول لـ (${shop.name}) بنجاح!\n\nيمكنك إرساله للمطعم لتسجيل الدخول مباشرة لفرعهم.\nالرابط: ${directUrl}`);
                        }}
                        className="text-xs text-red-500 bg-red-50 hover:bg-red-500 hover:text-white px-2.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 font-bold"
                        title="نسخ رابط الدخول المباشر للتاجر"
                      >
                        <span className="text-[10px]">🔗 نسخ رابط التاجر</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف المتجر "${shop.name}" وجميع وجباته بالكامل؟`)) {
                            onDeleteShop(shop.id);
                          }
                        }}
                        className="text-xs text-slate-400 hover:text-white hover:bg-red-500 p-2 rounded-xl transition-all cursor-pointer"
                        title="حذف المتجر"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Products list to delete products */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-800 mb-2 pb-2 border-b border-slate-50 flex items-center gap-2">
              <Utensils className="h-5 w-5 text-red-500" />
              <span>إدارة المنتجات النشطة ({menuItems.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-medium">قائمة بالمنتجات المتاحة حالياً عبر المتاجر.</p>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {menuItems.map((item) => {
                const shopName = shops.find((s) => s.id === item.shopId)?.name || 'متجر غير معروف';
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-red-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 object-cover rounded-xl bg-white border border-slate-100"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-bold">
                          <span className="text-red-500 font-extrabold">{item.price} ج.م</span>
                          <span>•</span>
                          <span>التابع لـ: {shopName}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل تريد حذف وجبة "${item.name}"؟`)) {
                          onDeleteMenuItem(item.id);
                        }
                      }}
                      className="text-xs text-slate-400 hover:text-white hover:bg-red-500 p-2 rounded-xl transition-all cursor-pointer"
                      title="حذف المنتج"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
