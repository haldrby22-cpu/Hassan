import React, { useState } from 'react';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard, Landmark, Truck, ShieldCheck, Ticket, Calendar, Clock } from 'lucide-react';
import { CartItem, PromoCode } from '../types';
import { PROMO_CODES } from '../data';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onClearCart: () => void;
  onCheckout: (
    address: string,
    phone: string,
    paymentMethod: string,
    notes: string,
    appliedPromo?: PromoCode,
    discountAmount?: number,
    isScheduled?: boolean,
    scheduledDate?: string,
    scheduledTime?: string
  ) => void;
  deliveryFee: number;
}

export default function Cart({ cartItems, onUpdateQuantity, onClearCart, onCheckout, deliveryFee }: CartProps) {
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Form Fields
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [formErrors, setFormErrors] = useState<{ address?: string; phone?: string }>({});

  // Scheduling state
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const date = new Date();
    const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const formattedDate = date.toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' });
    return `اليوم (${formattedDate})`;
  });
  const [scheduledTime, setScheduledTime] = useState('06:00 م - 07:00 م');

  const getNextDays = () => {
    const days = [];
    const weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const label = i === 0 ? 'اليوم' : i === 1 ? 'غداً' : weekdays[date.getDay()];
      const formattedDate = date.toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' });
      days.push({
        value: `${label} (${formattedDate})`,
        label: `${label} - ${formattedDate}`,
      });
    }
    return days;
  };

  const timeSlots = [
    '12:00 م - 01:00 م',
    '01:00 م - 02:00 م',
    '02:00 م - 03:00 م',
    '03:00 م - 04:00 م',
    '04:00 م - 05:00 م',
    '05:00 م - 06:00 م',
    '06:00 م - 07:00 م',
    '07:00 م - 08:00 م',
    '08:00 م - 09:00 م',
    '09:00 م - 10:00 م',
    '10:00 م - 11:00 م',
    '11:00 م - 12:00 ص'
  ];

  const subtotal = cartItems.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  // Apply Promo
  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    const code = promoCodeInput.trim().toUpperCase();

    if (!code) {
      setPromoError('الرجاء إدخال كود خصم');
      return;
    }

    const found = PROMO_CODES.find((p) => p.code === code);
    if (!found) {
      setPromoError('الكود غير صحيح أو منتهي الصلاحية');
      setAppliedPromo(null);
      return;
    }

    if (subtotal < found.minSubtotal) {
      setPromoError(`هذا الكود يتطلب حد أدنى للشراء بقيمة ${found.minSubtotal} ج.م`);
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(found);
    setPromoSuccess(`تم تطبيق كود [${found.code}] بنجاح: ${found.description}`);
  };

  // Calculate prices
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountPercent) {
      discountAmount = Math.round((subtotal * appliedPromo.discountPercent) / 100);
    } else if (appliedPromo.discountFixed) {
      discountAmount = Math.min(appliedPromo.discountFixed, subtotal);
    }
  }

    // VAT 14% (calculated on subtotal - discount + delivery)
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const vat = Math.round(taxableAmount * 0.14 * 100) / 100;
    const grandTotal = Math.round((taxableAmount + deliveryFee + vat) * 100) / 100;

  // Form Validation and Submit
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { address?: string; phone?: string } = {};

    if (!address.trim()) {
      errors.address = 'الرجاء إدخال عنوان التوصيل بالتفصيل بجمهورية مصر العربية';
    }
    if (!phone.trim()) {
      errors.phone = 'الرجاء إدخال رقم الهاتف للتواصل';
    } else if (!/^(010|011|012|015)\d{8}$/.test(phone.trim())) {
      errors.phone = 'رقم الهاتف المصري يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويتكون من 11 رقماً';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // scroll to errors
      return;
    }

    setFormErrors({});
    onCheckout(
      address,
      phone,
      paymentMethod,
      notes,
      appliedPromo || undefined,
      discountAmount,
      isScheduled,
      isScheduled ? scheduledDate : undefined,
      isScheduled ? scheduledTime : undefined
    );
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
          <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-slate-100 text-xs text-slate-500 border border-white flex items-center justify-center font-bold">
            0
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-2">سلة التسوق فارغة</h3>
        <p className="text-sm text-slate-400 text-center max-w-xs leading-relaxed">
          تصفح قائمة المطاعم والكافيهات والبقالات وأضف منتجاتك المفضلة لبدء طلبك الأول!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Items Section */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-50">
            <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-red-500" />
              <span>محتويات السلة ({cartItems.length})</span>
            </h3>
            <button
              onClick={onClearCart}
              className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>تفريغ السلة</span>
            </button>
          </div>

          <div className="divide-y divide-slate-50">
            {cartItems.map((cartItem) => (
              <div key={cartItem.item.id} className="py-4 flex items-center gap-4 group">
                <img
                  src={cartItem.item.image}
                  alt={cartItem.item.name}
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 object-cover rounded-xl bg-slate-50 shrink-0"
                />
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-red-500 transition-colors">
                    {cartItem.item.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-sm font-extrabold text-slate-900">{cartItem.item.price}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">ج.م</span>
                  </div>
                </div>

                {/* Adjust Quantities */}
                <div className="flex items-center gap-2.5 bg-slate-100 p-1 rounded-lg shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                    className="h-6 w-6 rounded bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs font-extrabold text-slate-800 w-4 text-center">
                    {cartItem.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                    className="h-6 w-6 rounded bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Codes */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-red-500" />
            <span>كوبونات الخصم المتاحة</span>
          </h4>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={promoCodeInput}
              onChange={(e) => setPromoCodeInput(e.target.value)}
              placeholder="مثال: MASR30, FREE, EGYPT10"
              className="flex-grow rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-red-400 placeholder-slate-300"
            />
            <button
              type="button"
              onClick={handleApplyPromo}
              className="bg-red-500 text-white rounded-xl px-5 py-2 text-sm font-bold hover:bg-red-600 transition-colors cursor-pointer"
            >
              تطبيق
            </button>
          </div>

          {promoError && <p className="text-xs text-red-500 font-semibold mb-3">{promoError}</p>}
          {promoSuccess && <p className="text-xs text-emerald-600 font-semibold mb-3">{promoSuccess}</p>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2">
            {PROMO_CODES.map((promo) => (
              <button
                key={promo.code}
                type="button"
                onClick={() => {
                  setPromoCodeInput(promo.code);
                  setPromoError('');
                  setPromoSuccess('');
                }}
                className="flex flex-col items-center p-2 rounded-xl border border-dashed border-slate-200 hover:border-red-300 hover:bg-red-50/25 text-center transition-colors"
              >
                <span className="text-xs font-extrabold text-red-500 bg-red-50 px-2 py-0.5 rounded-md mb-1">
                  {promo.code}
                </span>
                <span className="text-[10px] text-slate-500 font-medium line-clamp-1">
                  {promo.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Checkout Form & Pricing */}
      <form onSubmit={handleSubmitOrder} className="lg:col-span-5 space-y-6">
        {/* Delivery Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-extrabold text-lg text-slate-800 mb-4 pb-2 border-b border-slate-50 flex items-center gap-2">
            <Truck className="h-5 w-5 text-red-500" />
            <span>تفاصيل التوصيل والدفع</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">عنوان التوصيل بالتفصيل *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: فرشوط، شارع الجمهورية، بجوار مسجد الشيخ غريب، عمارة 4"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-800 focus:outline-none placeholder-slate-300 ${
                  formErrors.address ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-red-400'
                }`}
              />
              {formErrors.address && (
                <p className="text-xs text-red-500 font-semibold mt-1">{formErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">رقم الجوال للتواصل *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 01012345678"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-800 focus:outline-none text-left placeholder-slate-300 ${
                  formErrors.phone ? 'border-red-400 focus:border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-red-400'
                }`}
                style={{ direction: 'ltr' }}
              />
              {formErrors.phone && (
                <p className="text-xs text-red-500 font-semibold mt-1">{formErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">ملاحظات إضافية (اختياري)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: الباب الخارجي لونه أبيض، يرجى عدم رن الجرس"
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-red-400 placeholder-slate-300"
              />
            </div>

            {/* Scheduling option */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">وقت التوصيل</label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setIsScheduled(false)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    !isScheduled
                      ? 'border-red-500 bg-red-50/50 text-red-600 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Truck className="h-4 w-4" />
                  <span className="text-xs">توصيل فوري (أسرع شيء)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsScheduled(true)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isScheduled
                      ? 'border-red-500 bg-red-50/50 text-red-600 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">جدولة الطلب (وقت لاحق)</span>
                </button>
              </div>

              {isScheduled && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">اختر اليوم</label>
                      <div className="relative">
                        <select
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:border-red-400 appearance-none font-bold"
                        >
                          {getNextDays().map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">اختر موعد الاستلام</label>
                      <div className="relative">
                        <select
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 bg-white focus:outline-none focus:border-red-400 appearance-none font-bold"
                        >
                          {timeSlots.map((slot) => (
                            <option key={slot} value={slot}>
                              {slot}
                            </option>
                          ))}
                        </select>
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-red-500 font-bold leading-normal">
                    💡 سيقوم المتجر بتحضير الطلب وتسليمه للطيار ليتطابق التوصيل مع الموعد المجدد المختار أعلاه بدقة.
                  </p>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">طريقة الدفع</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-red-500 bg-red-50/50 text-red-600 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <Landmark className="h-5 w-5 mb-1.5 shrink-0" />
                  <span className="text-xs">نقداً عند الاستلام</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'card'
                      ? 'border-red-500 bg-red-50/50 text-red-600 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mb-1.5 shrink-0" />
                  <span className="text-xs">بطاقة بنكية / فوري</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('applepay')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    paymentMethod === 'applepay'
                      ? 'border-red-500 bg-red-50/50 text-red-600 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-base font-extrabold tracking-tight mb-1 shrink-0"> Pay</span>
                  <span className="text-xs">أبل باي</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt / Invoice Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 pb-2 border-b border-slate-50">تفاصيل الفاتورة</h4>

          <div className="space-y-2.5 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>قيمة المنتجات:</span>
              <span className="font-semibold text-slate-800">{subtotal} ج.م</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>خصم الكود {appliedPromo ? `(${appliedPromo.code})` : ''}:</span>
                <span className="font-bold">-{discountAmount} ج.م</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>رسوم التوصيل:</span>
              <span className="font-semibold text-slate-800">
                {deliveryFee === 0 ? 'مجاني' : `${deliveryFee} ج.م`}
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-400">
              <span>ضريبة القيمة المضافة (14%):</span>
              <span>{vat} ج.م</span>
            </div>

            <div className="border-t border-slate-50 pt-3 flex justify-between text-base text-slate-800 font-extrabold">
              <span>المجموع الكلي:</span>
              <span className="text-red-500 text-lg">{grandTotal} ج.م</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white rounded-2xl py-3.5 text-center font-bold text-base shadow-lg shadow-red-100 hover:bg-red-600 hover:shadow-red-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="h-5 w-5" />
            <span>تأكيد وإرسال الطلب</span>
          </button>
        </div>
      </form>
    </div>
  );
}
