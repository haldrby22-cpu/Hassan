import React, { useState } from 'react';
import { Smartphone, User, MapPin, Lock, CheckCircle, X, ShieldAlert } from 'lucide-react';

interface RegisterModalProps {
  onClose: () => void;
  onRegister: (name: string, phone: string, address: string, password?: string) => void;
  pendingAddress?: string;
  pendingPhone?: string;
}

export default function RegisterModal({ onClose, onRegister, pendingAddress = '', pendingPhone = '' }: RegisterModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(pendingPhone);
  const [address, setAddress] = useState(pendingAddress);
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = 'الرجاء إدخال الاسم الكامل ثنائياً على الأقل';
    } else if (name.trim().length < 5) {
      errors.name = 'الاسم الكامل يجب أن يكون أكثر من 5 أحرف لضمان كتابة الاسم الصحيح';
    }

    if (!phone.trim()) {
      errors.phone = 'الرجاء إدخال رقم الهاتف للتواصل';
    } else if (!/^(010|011|012|015)\d{8}$/.test(phone.trim())) {
      errors.phone = 'يجب إدخال رقم هاتف مصري صحيح (11 رقماً يبدأ بـ 010، 011، 012، أو 015)';
    }

    if (!address.trim()) {
      errors.address = 'الرجاء كتابة عنوان التوصيل بالتفصيل بمركز فرشوط';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    onRegister(name.trim(), phone.trim(), address.trim(), password.trim() || undefined);
  };

  return (
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center p-4">
      <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-6 max-h-[92%] overflow-y-auto animate-slide-up relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-2xl animate-pulse">
            📱
          </div>
          <h3 className="font-extrabold text-slate-800 text-sm">تسجيل حساب عميل جديد بفرشوط</h3>
          <p className="text-[10px] text-slate-400 font-bold max-w-xs mx-auto leading-normal">
            خطوة واحدة متبقية! يرجى تسجيل حسابك لتأكيد الطلب وحفظ عنوان التوصيل ونقاط الهدايا بفرشوط.
          </p>
        </div>

        {/* Alert note */}
        <div className="bg-red-50/70 border border-red-100 p-3 rounded-2xl flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[9px] text-red-600 font-black leading-relaxed">
            أنظمة دليفري طلبات فرشوط تتطلب التحقق من رقم الهاتف للتأكد من جدية الطلب ومنع الطلبات الوهمية للمطاعم.
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400">الاسم الكامل (الاسم واللقب) *</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: محمد أحمد محمود"
                className={`w-full bg-slate-50 border rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-red-500 ${formErrors.name ? 'border-red-400 bg-red-50/5' : 'border-slate-100'}`}
              />
            </div>
            {formErrors.name && (
              <p className="text-[9px] text-red-500 font-bold mt-0.5">{formErrors.name}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400">رقم الهاتف للتواصل والتحقق *</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                <Smartphone className="h-4 w-4" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 01012345678"
                className={`w-full bg-slate-50 border rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-red-500 text-left ${formErrors.phone ? 'border-red-400 bg-red-50/5' : 'border-slate-100'}`}
                style={{ direction: 'ltr' }}
              />
            </div>
            {formErrors.phone && (
              <p className="text-[9px] text-red-500 font-bold mt-0.5">{formErrors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400">عنوان التوصيل التفصيلي بفرشوط *</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                <MapPin className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: شارع الفارابي - بجوار مسجد الرحمن - الطابق الثاني"
                className={`w-full bg-slate-50 border rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-red-500 ${formErrors.address ? 'border-red-400 bg-red-50/5' : 'border-slate-100'}`}
              />
            </div>
            {formErrors.address && (
              <p className="text-[9px] text-red-500 font-bold mt-0.5">{formErrors.address}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400">كلمة المرور للحساب (اختياري)</label>
            <div className="relative">
              <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة مرور لحماية حسابك"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl pr-10 pl-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-red-500"
              />
            </div>
            <p className="text-[8px] text-slate-400 font-semibold">تسهل عليك تسجيل الدخول في المرات القادمة بفرشوط.</p>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-2xl py-3 text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer transform hover:scale-[1.01] active:scale-95"
            >
              <CheckCircle className="h-4 w-4" />
              <span>تسجيل وتأكيد الأوردر 🚀</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl py-3 text-xs font-black transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
