import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, MapPin, Phone, MessageSquare, ShieldCheck, ChevronRight, Play, RefreshCw, Star } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackerProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (status: OrderStatus, progress: number) => void;
}

export default function OrderTracker({ order, onClose, onUpdateStatus }: OrderTrackerProps) {
  // Let's create an auto-simulation for demo purposes
  const [isSimulating, setIsSimulating] = useState(true);

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      if (order.status === 'received') {
        onUpdateStatus('preparing', 33);
      } else if (order.status === 'preparing') {
        onUpdateStatus('on_the_way', 66);
      } else if (order.status === 'on_the_way') {
        onUpdateStatus('delivered', 100);
        setIsSimulating(false);
      }
    }, 12000); // Progress every 12 seconds in auto-simulation

    return () => clearInterval(interval);
  }, [order.status, isSimulating, onUpdateStatus]);

  // Status mapping
  const steps: { key: OrderStatus; label: string; desc: string; icon: string }[] = [
    {
      key: 'received',
      label: 'استلام الطلب',
      desc: 'تأكيد وقبول الطلب من المتجر',
      icon: '🔔',
    },
    {
      key: 'preparing',
      label: 'تحضير وتجهيز',
      desc: 'يتم الآن طهي الوجبة أو تجميع المواد بعناية',
      icon: '🍳',
    },
    {
      key: 'on_the_way',
      label: 'جاري التوصيل',
      desc: 'الكابتن استلم الطلب وهو في الطريق إليك',
      icon: '🛵',
    },
    {
      key: 'delivered',
      label: 'تم التوصيل',
      desc: 'بالعافية عليك! تم توصيل طلبك بنجاح',
      icon: '🎁',
    },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received': return 0;
      case 'preparing': return 1;
      case 'on_the_way': return 2;
      case 'delivered': return 3;
    }
  };

  const currentStepIdx = getStepIndex(order.status);

  // Manual trigger to speed up for testing
  const advanceSimulation = () => {
    if (order.status === 'received') {
      onUpdateStatus('preparing', 33);
    } else if (order.status === 'preparing') {
      onUpdateStatus('on_the_way', 66);
    } else if (order.status === 'on_the_way') {
      onUpdateStatus('delivered', 100);
    }
  };

  const resetSimulation = () => {
    onUpdateStatus('received', 5);
    setIsSimulating(true);
  };

  return (
    <div className="space-y-6">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div>
            <h3 className="font-extrabold text-lg text-slate-800">تتبع الطلب المباشر</h3>
            <p className="text-xs text-slate-400 font-medium">رقم الطلب: #{order.id}</p>
          </div>
        </div>

        {/* Live Pulse Indicator */}
        {order.status !== 'delivered' && (
          <div className="flex items-center gap-2 bg-red-50 text-red-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span>تتبع مباشر</span>
          </div>
        )}
      </div>

      {/* Simulator Quick Testing Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
            🤖
          </div>
          <div>
            <h4 className="font-bold text-sm">لوحة محاكاة وتجربة التوصيل</h4>
            <p className="text-xs text-slate-300">يمكنك تسريع مراحل توصيل الطلب فوراً للمعاينة والاختبار.</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={advanceSimulation}
            disabled={order.status === 'delivered'}
            className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            <span>الخطوة التالية</span>
          </button>
          <button
            onClick={resetSimulation}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>إعادة تشغيل</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Progress Tracker Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Timeline and Steps */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-500" />
              <span>حالة الطلب الحالي من {order.shopName}</span>
            </h4>

            {/* Stepper with custom styles */}
            <div className="relative pr-6 border-r-2 border-slate-100 space-y-8">
              {steps.map((step, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const isUpcoming = idx > currentStepIdx;

                return (
                  <div key={step.key} className="relative flex gap-4 items-start">
                    {/* Circle Indicator on the line */}
                    <div
                      className={`absolute -right-[35px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
                          : isCurrent
                          ? 'bg-red-500 border-red-500 text-white scale-125 ring-4 ring-red-100 animate-pulse'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>

                    {/* Step Content */}
                    <div className="flex gap-3 items-start flex-grow">
                      <div className="text-2xl p-2 rounded-xl bg-slate-50 border border-slate-100">
                        {step.icon}
                      </div>
                      <div className="flex-grow">
                        <h5
                          className={`font-bold text-sm transition-colors ${
                            isCurrent
                              ? 'text-red-500'
                              : isCompleted
                              ? 'text-emerald-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {step.label}
                        </h5>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Driver Info */}
          {order.status !== 'received' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 rounded-full bg-slate-100 border-2 border-red-100 overflow-hidden shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="Driver profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-1.5">
                    <h5 className="font-bold text-slate-800 text-sm">الكابتن: أحمد حسن</h5>
                    <div className="flex items-center text-xs text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-0.5" />
                      <span>4.9</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1">توصيل سريع • دراجة نارية (ط ص ر 9 5 2)</p>
                </div>
                {/* Contact buttons */}
                <div className="flex gap-2">
                  <a
                    href="tel:01011112222"
                    onClick={(e) => e.preventDefault()}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <Phone className="h-4.5 w-4.5" />
                  </a>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map Mockup Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Beautiful interactive CSS/SVG Map */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <span>موقع السائق التقديري</span>
            </h4>

            {/* Map Canvas */}
            <div className="relative h-60 w-full rounded-2xl bg-sky-50 border border-sky-100 overflow-hidden flex items-center justify-center">
              {/* Grid Background to make it feel like a map */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    'radial-gradient(#0284c7 1px, transparent 1px), radial-gradient(#0284c7 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px',
                }}
              />

              {/* Map Streets Visual (SVG lines) */}
              <svg className="absolute inset-0 w-full h-full text-sky-200/60" strokeWidth="6" strokeLinecap="round">
                <line x1="10%" y1="20%" x2="90%" y2="20%" stroke="currentColor" />
                <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="currentColor" />
                <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="currentColor" />
                <line x1="30%" y1="80%" x2="90%" y2="80%" stroke="currentColor" />
              </svg>

              {/* Store Icon Marker */}
              <div className="absolute top-[20%] left-[20%] flex flex-col items-center">
                <div className="h-9 w-9 bg-white shadow-md border-2 border-red-500 rounded-full flex items-center justify-center text-sm z-10 animate-bounce">
                  🏬
                </div>
                <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded shadow mt-1 font-bold">
                  {order.shopName}
                </span>
              </div>

              {/* Home Icon Marker */}
              <div className="absolute bottom-[20%] right-[20%] flex flex-col items-center">
                <div className="h-9 w-9 bg-white shadow-md border-2 border-blue-500 rounded-full flex items-center justify-center text-sm z-10">
                  🏠
                </div>
                <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded shadow mt-1 font-bold">
                  منزلك
                </span>
              </div>

              {/* Driver Bike Marker (Moving based on order progress) */}
              {order.status !== 'received' && order.status !== 'delivered' && (
                <div
                  className="absolute flex flex-col items-center transition-all duration-[1000ms] ease-out z-20"
                  style={{
                    // Let's calculate a path coordinate based on progress
                    top: order.status === 'preparing' ? '30%' : '55%',
                    left: order.status === 'preparing' ? '40%' : '60%',
                  }}
                >
                  <div className="h-10 w-10 bg-red-500 text-white shadow-lg shadow-red-200 rounded-full flex items-center justify-center text-lg border-2 border-white ring-4 ring-red-100">
                    🛵
                  </div>
                  <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-bold mt-1">
                    الكابتن يتحرك
                  </span>
                </div>
              )}

              {/* Status HUD Overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-100 shadow flex items-center justify-between text-xs font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-red-500" />
                  <span>الوقت المتوقع: </span>
                  <span className="text-red-500">
                    {order.status === 'delivered' ? 'وصل طلبك!' : order.status === 'on_the_way' ? '7-12 دقيقة' : '15-20 دقيقة'}
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-100" />
                <div>
                  <span>المسافة: </span>
                  <span className="text-slate-500">
                    {order.status === 'delivered' ? '0 كم' : order.status === 'on_the_way' ? '0.8 كم' : '1.9 كم'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Receipt Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 pb-2 border-b border-slate-50 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-500" />
              <span>ملخص الفاتورة</span>
            </h4>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md text-xs">
                      {item.quantity}x
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{item.price * item.quantity} ج.م</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-50 pt-3 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold">{order.subtotal} ج.م</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>خصم الكود:</span>
                  <span>-{order.discount} ج.م</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>رسوم التوصيل:</span>
                <span className="font-semibold">{order.deliveryFee === 0 ? 'مجانًا' : `${order.deliveryFee} ج.م`}</span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة (14%):</span>
                <span>{order.vat} ج.م</span>
              </div>
              <div className="border-t border-slate-50 pt-3 flex justify-between text-base font-extrabold text-slate-800">
                <span>المجموع النهائي:</span>
                <span className="text-red-500 text-lg">{order.total} ج.م</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5 text-xs text-slate-500">
              <div>
                <span className="font-bold text-slate-700">عنوان التوصيل: </span>
                <span>{order.address}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">رقم الجوال: </span>
                <span style={{ direction: 'ltr' }} className="inline-block">{order.phone}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">طريقة الدفع: </span>
                <span>
                  {order.paymentMethod === 'cash'
                    ? 'الدفع نقداً عند الاستلام'
                    : order.paymentMethod === 'applepay'
                    ? ' Pay (أبل باي)'
                    : 'بطاقة بنكية / فوري'}
                </span>
              </div>
              {order.notes && (
                <div>
                  <span className="font-bold text-slate-700">ملاحظات: </span>
                  <span>"{order.notes}"</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
