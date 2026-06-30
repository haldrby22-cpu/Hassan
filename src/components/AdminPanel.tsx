import React, { useState } from 'react';
import { Plus, Trash2, Store, Utensils, ShieldCheck, Lock, User, Eye, EyeOff, AlertCircle, LogOut, Mail, X } from 'lucide-react';
import { Shop, MenuItem, CategoryType } from '../types';

interface AdminPanelProps {
  shops: Shop[];
  menuItems: MenuItem[];
  customers: any[];
  onAddShop: (shop: Shop) => void;
  onDeleteShop: (shopId: string) => void;
  onAddMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onUpdateShop: (shop: Shop) => void;
}

export default function AdminPanel({
  shops, menuItems, customers, onAddShop, onDeleteShop, onAddMenuItem, onDeleteMenuItem, onUpdateShop
}: AdminPanelProps) {
  
  // States
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('admin_authenticated') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Authentication Logic
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
    } else {
      setLoginError('بيانات الدخول غير صحيحة');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-lg text-right" dir="rtl">
        <h2 className="text-xl font-bold mb-6">تسجيل دخول المدير</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="text" placeholder="اسم المستخدم" className="w-full p-3 border rounded-xl" onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="كلمة المرور" className="w-full p-3 border rounded-xl" onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-slate-900 text-white p-3 rounded-xl">دخول</button>
          {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" dir="rtl">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-extrabold text-slate-800">لوحة تحكم المدير</h2>
        <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('admin_authenticated'); }} className="text-red-500 flex items-center gap-2"><LogOut size={18}/> خروج</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* قسم العملاء (المربوط بقاعدة البيانات) */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-600"><User size={20}/> العملاء المسجلون ({customers?.length})</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {customers?.map((c) => (
              <div key={c.id} className="p-3 bg-blue-50 rounded-xl flex justify-between">
                <span className="font-bold">{c.name}</span>
                <span className="font-mono text-blue-600">{c.phone}</span>
              </div>
            ))}
          </div>
        </div>

        {/* قسم المتاجر */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-red-600"><Store size={20}/> إدارة المتاجر ({shops.length})</h3>
          <div className="space-y-3">
            {shops.map((shop) => (
              <div key={shop.id} className="p-3 border rounded-xl flex justify-between items-center">
                <span>{shop.name}</span>
                <button onClick={() => onDeleteShop(shop.id)} className="text-red-500"><Trash2 size={18}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* قسم المنتجات */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800"><Utensils size={20}/> إدارة المنتجات ({menuItems.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-2xl flex flex-col gap-2">
              <span className="font-bold">{item.name}</span>
              <span className="text-slate-500 text-sm">{item.price} ج.م</span>
              <button onClick={() => onDeleteMenuItem(item.id)} className="text-red-500 text-xs font-bold">حذف المنتج</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
