import { useEffect, useState, useRef } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  ShieldCheck, 
  ChevronRight, 
  Play, 
  RefreshCw, 
  Star, 
  Send, 
  PhoneOff, 
  X, 
  User, 
  Volume2, 
  VolumeX, 
  Navigation,
  ThumbsUp,
  Map
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackerProps {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (status: OrderStatus, progress: number) => void;
}

interface ChatMessage {
  id: string;
  sender: 'customer' | 'driver' | 'system';
  text: string;
  time: string;
}

export default function OrderTracker({ order, onClose, onUpdateStatus }: OrderTrackerProps) {
  // Demo simulation state
  const [isSimulating, setIsSimulating] = useState(true);
  
  // Interactive calling and chatting states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isCallingOpen, setIsCallingOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'system', text: 'تم بدء الدردشة الآمنة مع الكابتن أحمد حسن 🏍️', time: '11:15 م' },
    { id: '2', sender: 'driver', text: 'السلام عليكم يا فندم، أنا استلمت الطلب وبدأ الكيتشن يجهزه وهكون عندك في أسرع وقت بفرشوط إن شاء الله.', time: '11:16 م' }
  ]);

  // Handle call timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallingOpen && callStatus === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isCallingOpen, callStatus]);

  // Simulate call connection
  useEffect(() => {
    let connectTimeout: NodeJS.Timeout;
    if (isCallingOpen && callStatus === 'calling') {
      connectTimeout = setTimeout(() => {
        setCallStatus('connected');
      }, 2500);
    }
    return () => clearTimeout(connectTimeout);
  }, [isCallingOpen, callStatus]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  // Auto-simulation for status steps
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      if (order.status === 'received') {
        onUpdateStatus('preparing', 33);
        // Add a system chat message
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), sender: 'system', text: 'المطعم يقوم بتحضير طلبك الآن 🍳', time: 'الآن' }
        ]);
      } else if (order.status === 'preparing') {
        onUpdateStatus('on_the_way', 66);
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), sender: 'system', text: 'الكابتن أحمد حسن استلم الطلب وهو في الطريق إليك 🏍️', time: 'الآن' },
          { id: (Date.now() + 1).toString(), sender: 'driver', text: 'أنا استلمت الأوردر يا فندم وجايلك في الطريق، عنوانك الشارع الجديد بجوار مسجد الرحمن مظبوط؟', time: 'الآن' }
        ]);
      } else if (order.status === 'on_the_way') {
        onUpdateStatus('delivered', 100);
        setIsSimulating(false);
        setChatMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), sender: 'system', text: 'تم توصيل الطلب بنجاح! بالعافية عليك 🎁', time: 'الآن' },
          { id: (Date.now() + 1).toString(), sender: 'driver', text: 'وصلت عند البيت يا فندم، أنا تحت بالهنا والشفا!', time: 'الآن' }
        ]);
      }
    }, 15000); // Progress every 15 seconds

    return () => clearInterval(interval);
  }, [order.status, isSimulating, onUpdateStatus]);

  // Send message and trigger driver response
  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'customer',
      text: textToSend,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Trigger AI driver response simulation
    setTimeout(() => {
      let driverReplyText = '';
      const textLower = textToSend.toLowerCase();

      if (textLower.includes('سرع') || textLower.includes('تاخر') || textLower.includes('أسرع')) {
        driverReplyText = 'حاضر يا فندم، أنا بقطع الإشارة وبجري بأقصى سرعة، هكون عندك خلال دقايق!';
      } else if (textLower.includes('عنوان') || textLower.includes('مسجد') || textLower.includes('الرحمن') || textLower.includes('فين')) {
        driverReplyText = 'تمام يا فندم، أنا عارف مسجد الرحمن جداً، بوصلك خلال 5 دقايق بالظبط.';
      } else if (textLower.includes('الباب') || textLower.includes('سيب') || textLower.includes('اترك')) {
        driverReplyText = 'حاضر يا غالي، هسيب الأوردر عند الباب زي ما طلبت وهبعتلك رسالة لتأكيد الوصول.';
      } else {
        driverReplyText = 'تمام يا فندم، تحت أمرك. أنا متابع اللوكيشن وهكون عندك فوراً!';
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          sender: 'driver',
          text: driverReplyText,
          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 15000 / 10); // 1.5 seconds reply simulation
  };

  const steps: { key: OrderStatus; label: string; desc: string; icon: string }[] = [
    {
      key: 'received',
      label: 'استلام الطلب',
      desc: 'تأكيد وقبول الطلب من المتجر بفرشوط',
      icon: '🔔',
    },
    {
      key: 'preparing',
      label: 'تحضير وتجهيز',
      desc: 'يتم الآن طهي الوجبة أو تجميع المواد بعناية فائقة',
      icon: '🍳',
    },
    {
      key: 'on_the_way',
      label: 'جاري التوصيل المباشر',
      desc: 'الكابتن استلم الطلب من المتجر وهو في طريقه لعنوانك',
      icon: '🛵',
    },
    {
      key: 'delivered',
      label: 'تم التوصيل بنجاح',
      desc: 'بالهنا والشفا! تم تسليم طلبك بنجاح بفرشوط',
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
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'system', text: 'المطعم يقوم بتحضير طلبك الآن 🍳', time: 'الآن' }
      ]);
    } else if (order.status === 'preparing') {
      onUpdateStatus('on_the_way', 66);
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'system', text: 'الكابتن أحمد حسن استلم الطلب وهو في الطريق إليك 🏍️', time: 'الآن' },
        { id: (Date.now() + 1).toString(), sender: 'driver', text: 'أنا استلمت الأوردر يا فندم وجايلك في الطريق، عنوانك الشارع الجديد بجوار مسجد الرحمن مظبوط؟', time: 'الآن' }
      ]);
    } else if (order.status === 'on_the_way') {
      onUpdateStatus('delivered', 100);
      setIsSimulating(false);
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'system', text: 'تم توصيل الطلب بنجاح! بالعافية عليك 🎁', time: 'الآن' },
        { id: (Date.now() + 1).toString(), sender: 'driver', text: 'وصلت عند البيت يا فندم، أنا تحت بالهنا والشفا!', time: 'الآن' }
      ]);
    }
  };

  const resetSimulation = () => {
    onUpdateStatus('received', 5);
    setIsSimulating(true);
    setChatMessages([
      { id: '1', sender: 'system', text: 'تم بدء الدردشة الآمنة مع الكابتن أحمد حسن 🏍️', time: '11:15 م' },
      { id: '2', sender: 'driver', text: 'السلام عليكم يا فندم، أنا استلمت الطلب وبدأ الكيتشن يجهزه وهكون عندك في أسرع وقت بفرشوط إن شاء الله.', time: '11:16 م' }
    ]);
  };

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 relative">
      
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
            <h3 className="font-extrabold text-sm sm:text-base text-slate-800">تتبع الطلب المباشر</h3>
            <p className="text-[10px] text-slate-400 font-bold">رقم الطلب: #{order.id}</p>
          </div>
        </div>

        {/* Live Pulse Indicator */}
        {order.status !== 'delivered' && (
          <div className="flex items-center gap-1.5 bg-red-50 text-red-500 px-3 py-1 rounded-full text-[10px] font-black animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            <span>تتبع فوري ونشط</span>
          </div>
        )}
      </div>

      {/* Simulator Quick Testing Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-850 text-white rounded-3xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-md border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
            🤖
          </div>
          <div>
            <h4 className="font-bold text-xs">مساعد محاكاة التوصيل الذكي</h4>
            <p className="text-[10px] text-slate-300 font-medium">لتسريع واختبار مراحل الطلب والطيار لفرشوط.</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={advanceSimulation}
            disabled={order.status === 'delivered'}
            className="flex-1 md:flex-initial bg-red-500 hover:bg-red-600 text-white text-[10px] font-black px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5" />
            <span>المرحلة التالية</span>
          </button>
          <button
            onClick={resetSimulation}
            className="flex-1 md:flex-initial bg-white/10 hover:bg-white/20 text-white text-[10px] font-black px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <h4 className="font-black text-xs text-slate-800 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-red-500" />
              <span>حالة طلبك الحالي من: {order.shopName}</span>
            </h4>

            {/* Stepper */}
            <div className="relative pr-6 border-r-2 border-slate-100 space-y-8">
              {steps.map((step, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const isUpcoming = idx > currentStepIdx;

                return (
                  <div key={step.key} className="relative flex gap-4 items-start">
                    {/* Circle Indicator on the line */}
                    <div
                      className={`absolute -right-[35px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-black transition-all duration-300 ${
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
                          className={`font-extrabold text-xs sm:text-sm transition-colors ${
                            isCurrent
                              ? 'text-red-500'
                              : isCompleted
                              ? 'text-emerald-600'
                              : 'text-slate-500'
                          }`}
                        >
                          {step.label}
                        </h5>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-bold leading-relaxed">
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
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-2xl bg-slate-100 border-2 border-red-100 overflow-hidden shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                      alt="Driver profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h5 className="font-black text-xs text-slate-800">الكابتن: أحمد حسن</h5>
                      <div className="flex items-center text-[9px] text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500 ml-0.5" />
                        <span>4.9</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold">دليفري فرشوط المعتمد • دراجة نارية 🏍️</p>
                  </div>
                </div>

                {/* Contact buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsCallingOpen(true);
                      setCallStatus('calling');
                      setCallDuration(0);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setIsChatOpen(true)}
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {order.status === 'on_the_way' && (
                      <span className="absolute -top-1 -left-1 h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">1</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map Mockup Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs text-slate-800 flex items-center gap-2">
                <Navigation className="h-4 w-4 text-red-500 animate-spin" style={{ animationDuration: '3s' }} />
                <span>موقع الكابتن المباشر بمركز فرشوط</span>
              </h4>
              <span className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-bold">حقيقي 5G GPS</span>
            </div>

            {/* Map Canvas */}
            <div className="relative h-64 w-full rounded-2xl bg-sky-50 border border-sky-100 overflow-hidden flex items-center justify-center">
              {/* Dot grid style background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(#0ea5e9 1px, transparent 1px), radial-gradient(#0ea5e9 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px',
                }}
              />

              {/* Animated Glowing Routes */}
              <svg className="absolute inset-0 w-full h-full text-sky-200" strokeWidth="4" strokeLinecap="round">
                {/* Underlay shadow/glow */}
                <path 
                  d="M 50 60 Q 150 120 200 80 T 320 200" 
                  fill="none" 
                  stroke="#fda4af" 
                  strokeWidth="8" 
                  className="opacity-40"
                />
                
                {/* Active dashed path line */}
                <path 
                  d="M 50 60 Q 150 120 200 80 T 320 200" 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth="4" 
                  strokeDasharray="6,6"
                  className="animate-[dash_20s_linear_infinite]"
                  style={{
                    strokeDashoffset: 100,
                  }}
                />
              </svg>

              {/* Store Icon Marker */}
              <div className="absolute top-[60px] left-[50px] flex flex-col items-center">
                <div className="h-8 w-8 bg-white shadow-lg border-2 border-red-500 rounded-full flex items-center justify-center text-sm z-10 animate-bounce">
                  🏬
                </div>
                <span className="text-[8px] bg-slate-900 text-white px-1.5 py-0.5 rounded shadow mt-1 font-bold whitespace-nowrap">
                  {order.shopName}
                </span>
              </div>

              {/* Home Icon Marker */}
              <div className="absolute bottom-[40px] right-[50px] flex flex-col items-center">
                <div className="h-8 w-8 bg-white shadow-lg border-2 border-sky-500 rounded-full flex items-center justify-center text-sm z-10">
                  🏠
                </div>
                <span className="text-[8px] bg-slate-900 text-white px-1.5 py-0.5 rounded shadow mt-1 font-bold whitespace-nowrap">
                  عنوانك بفرشوط
                </span>
              </div>

              {/* Driver Bike Marker (Moving based on order progress) */}
              {order.status !== 'received' && order.status !== 'delivered' ? (
                <div
                  className="absolute flex flex-col items-center transition-all duration-[2000ms] ease-in-out z-20"
                  style={{
                    top: order.status === 'preparing' ? '90px' : '130px',
                    left: order.status === 'preparing' ? '120px' : '220px',
                  }}
                >
                  <div className="h-9 w-9 bg-red-500 text-white shadow-lg shadow-red-200 rounded-full flex items-center justify-center text-base border-2 border-white ring-4 ring-red-100 animate-pulse">
                    🛵
                  </div>
                  <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded-full font-bold mt-1 whitespace-nowrap">
                    أحمد حسن بالطريق
                  </span>
                </div>
              ) : order.status === 'delivered' ? (
                <div className="absolute bottom-[40px] right-[100px] flex flex-col items-center z-20 animate-bounce">
                  <div className="h-8 w-8 bg-emerald-500 text-white shadow-lg rounded-full flex items-center justify-center text-sm border-2 border-white">
                    🛵
                  </div>
                  <span className="text-[8px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-bold mt-1 whitespace-nowrap">
                    وصل الكابتن
                  </span>
                </div>
              ) : null}

              {/* Status HUD Overlay */}
              <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-slate-100 shadow flex items-center justify-between text-[10px] font-bold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-red-500" />
                  <span>الوقت المتوقع: </span>
                  <span className="text-red-500 font-extrabold">
                    {order.status === 'delivered' ? 'وصل طلبك!' : order.status === 'on_the_way' ? '7-10 دقائق' : '15-20 دقيقة'}
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-100" />
                <div>
                  <span>المسافة: </span>
                  <span className="text-slate-500 font-extrabold">
                    {order.status === 'delivered' ? '0 كم' : order.status === 'on_the_way' ? '0.7 كم' : '1.8 كم'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Receipt Summary */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-black text-xs text-slate-800 pb-2 border-b border-slate-50 flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-red-500" />
              <span>ملخص فاتورة الطلب</span>
            </h4>

            <div className="space-y-2.5 max-h-36 overflow-y-auto pr-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-extrabold text-red-500 bg-red-50 px-2 py-0.5 rounded-md text-[10px]">
                      {item.quantity}x
                    </span>
                    <span className="font-bold">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-800">{item.price * item.quantity} ج.م</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-50 pt-3 space-y-2 text-[10px] text-slate-500 font-bold">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-extrabold text-slate-700">{order.subtotal} ج.م</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-black">
                  <span>خصم كود (MASR30):</span>
                  <span>-{order.discount} ج.م</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>رسوم التوصيل لفرشوط:</span>
                <span className="font-extrabold text-slate-700">{order.deliveryFee === 0 ? 'مجانًا' : `${order.deliveryFee} ج.م`}</span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة والخدمات الموحدة:</span>
                <span className="font-extrabold text-slate-700">{order.vat} ج.م</span>
              </div>
              <div className="border-t border-slate-50 pt-3 flex justify-between text-xs font-black text-slate-800">
                <span>المجموع النهائي المطلوب:</span>
                <span className="text-red-500 text-sm font-black">{order.total} ج.م</span>
              </div>
            </div>

            {/* Help / Support Box with direct contact links */}
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-slate-700 block">💬 هل تواجه مشكلة؟ تواصل مع الدعم الفني لفرشوط عبر الواتساب:</span>
              <div className="flex gap-2">
                <a 
                  href="https://wa.me/201060416808"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white hover:bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold text-[10.5px] py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <span>أ. حسن (واتساب) 💬</span>
                </a>
                <a 
                  href="https://wa.me/201065049420"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white hover:bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold text-[10.5px] py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <span>الدعم (واتساب) 💬</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SIMULATED IN-APP CHAT WITH DRIVER OVERLAY --- */}
      {isChatOpen && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-[32px] h-[90%] flex flex-col shadow-2xl overflow-hidden border-t border-slate-100">
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-100 px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-full overflow-hidden border border-red-100">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="Driver profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-800">الدردشة مع: الكابتن أحمد حسن</h4>
                  <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>متصل الآن • بالدراجة النارية</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {chatMessages.map((msg) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="inline-block bg-slate-200/60 text-[9px] text-slate-500 font-black px-2.5 py-1 rounded-full">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isMe = msg.sender === 'customer';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 text-xs shadow-sm font-bold leading-relaxed ${
                        isMe
                          ? 'bg-red-500 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className={`block text-[8px] mt-1 ${isMe ? 'text-white/60 text-left' : 'text-slate-400 text-right'}`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Smart Quick replies chips */}
            <div className="bg-white px-4 pt-3 pb-1 border-t border-slate-50 overflow-x-auto flex gap-1.5 no-scrollbar">
              <button
                onClick={() => handleSendMessage('أنا بانتظارك عند الباب يا كابتن')}
                className="bg-slate-50 hover:bg-red-50 text-[9px] font-black text-slate-600 hover:text-red-500 px-3 py-1.5 rounded-full border border-slate-100 shrink-0 whitespace-nowrap cursor-pointer"
              >
                🚪 أنا بانتظارك عند الباب
              </button>
              <button
                onClick={() => handleSendMessage('أسرع من فضلك، الأكل هيبوخ')}
                className="bg-slate-50 hover:bg-red-50 text-[9px] font-black text-slate-600 hover:text-red-500 px-3 py-1.5 rounded-full border border-slate-100 shrink-0 whitespace-nowrap cursor-pointer"
              >
                🚀 أسرع من فضلك
              </button>
              <button
                onClick={() => handleSendMessage('اترك الأوردر عند الباب وشكراً')}
                className="bg-slate-50 hover:bg-red-50 text-[9px] font-black text-slate-600 hover:text-red-500 px-3 py-1.5 rounded-full border border-slate-100 shrink-0 whitespace-nowrap cursor-pointer"
              >
                🛎️ اترك الأوردر عند الباب
              </button>
              <button
                onClick={() => handleSendMessage('معاك فكة لـ 200 جنيه؟')}
                className="bg-slate-50 hover:bg-red-50 text-[9px] font-black text-slate-600 hover:text-red-500 px-3 py-1.5 rounded-full border border-slate-100 shrink-0 whitespace-nowrap cursor-pointer"
              >
                💵 معاك فكة؟
              </button>
            </div>

            {/* Chat Input form */}
            <div className="bg-white p-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(chatInput);
                }}
                placeholder="اكتب رسالة للكابتن أحمد..."
                className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-red-500 focus:bg-white"
              />
              <button
                onClick={() => handleSendMessage(chatInput)}
                className="bg-red-500 text-white rounded-xl h-9 w-9 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SIMULATED FULLSCREEN PHONE CALL OVERLAY --- */}
      {isCallingOpen && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 z-50 p-6 flex flex-col justify-between text-white select-none">
          {/* Call Header */}
          <div className="text-center pt-10 space-y-1">
            <span className="bg-white/10 text-slate-300 text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 w-max mx-auto">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span>اتصال آمن ومحمي بالكامل 🔒</span>
            </span>
          </div>

          {/* Caller profile / animation */}
          <div className="text-center space-y-4">
            <div className="relative mx-auto h-28 w-28 flex items-center justify-center">
              {/* Pulsing ring animations */}
              {callStatus === 'connected' && (
                <>
                  <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="absolute inset-2 bg-red-500/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                </>
              )}
              <div className="relative h-24 w-24 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl z-10">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Driver Profile Photo"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-white">أحمد حسن (طيار دليفري)</h3>
              <p className="text-xs text-slate-400 font-bold">دراجة نارية (ط ص ر 9 5 2)</p>
            </div>

            {/* Status & timer */}
            <div className="pt-2">
              {callStatus === 'calling' ? (
                <span className="text-xs text-slate-400 font-bold block animate-pulse">جاري الرنين والاتصال بالكابتن...</span>
              ) : callStatus === 'connected' ? (
                <div className="space-y-2">
                  <span className="text-sm font-mono font-bold block text-red-400 tracking-wider">
                    {formatCallTime(callDuration)}
                  </span>
                  {/* Sound Wave simulator */}
                  <div className="flex justify-center items-end gap-1 h-5 pb-1">
                    <span className="bg-red-400 w-1 h-2 rounded animate-[bounce_1s_infinite_100ms]" />
                    <span className="bg-red-400 w-1 h-4 rounded animate-[bounce_1.2s_infinite_300ms]" />
                    <span className="bg-red-400 w-1 h-1 rounded animate-[bounce_0.8s_infinite]" />
                    <span className="bg-red-400 w-1 h-5 rounded animate-[bounce_1.5s_infinite_400ms]" />
                    <span className="bg-red-400 w-1 h-3 rounded animate-[bounce_1.1s_infinite_200ms]" />
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Call Controls and Actions */}
          <div className="space-y-8 pb-10">
            {/* Audio configuration triggers */}
            <div className="flex justify-center gap-8 text-xs font-bold text-slate-300">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </div>
                <span>{isMuted ? 'كتم الصوت' : 'تحدث الآن'}</span>
              </button>

              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isSpeakerOn ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}>
                  📢
                </div>
                <span>{isSpeakerOn ? 'مكبر الصوت' : 'الهاتف العادي'}</span>
              </button>
            </div>

            {/* Red Decline Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setCallStatus('ended');
                  setTimeout(() => setIsCallingOpen(false), 800);
                }}
                className="mx-auto h-16 w-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-900/40 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
              <span className="block text-[10px] text-slate-400 mt-2 font-bold">إنهاء المكالمة</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
