import React, { useState } from 'react';
import { User, Store, Utensils } from 'lucide-react';

// تأكد من استيراد الأنواع (Types) الخاصة بك هنا إذا كنت تستخدم ملف types.ts
// import { Shop, MenuItem } from '../types'; 

interface AdminPanelProps {
  shops: any[];
  menuItems: any[];
  customers: any[];
  onAddShop: (shop: any) => void;
  onDeleteShop: (shopId: string) => void;
  onAddMenuItem: (item: any) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onUpdateShop: (shop: any) => void;
}

export default function AdminPanel({
  shops,
  menuItems,
  customers,
  onAddShop,
  onDeleteShop,
  onAddMenuItem,
  onDeleteMenuItem,
  onUpdateShop,
}: AdminPanelProps) {
  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold">لوحة التحكم</h2>

      {/* قسم العملاء - المربوط بقاعدة البيانات */}
      <div className="bg-white rounded-3xl p-6 border shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <User className="text-blue-500" />
          العملاء المسجلون ({customers?.length || 0})
        </h3>
        <div className="space-y-3">
          {customers && customers.length > 0 ? (
            customers.map((c: any) => (
              <div key={c.id} className="p-3 border-b flex justify-between">
                <span className="font-semibold">{c.name}</span>
                <span className="text-gray-500">{c.phone}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">لا توجد بيانات عملاء حالياً</p>
          )}
        </div>
      </div>

      {/* يمكنك إضافة قسم المتاجر والمنتجات هنا لاحقاً */}
    </div>
  );
}
