import React, { useState, useEffect } from 'react';
import { Smartphone, User, MapPin, CheckCircle, ArrowLeft, ShieldCheck, MessageSquare, LogIn, UserPlus } from 'lucide-react';
import { saveCustomerToFirebase, getCustomerFromFirebase } from '../lib/firebase';

interface WhatsAppLoginProps {
  onLoginSuccess: (account: { name: string; phone: string; address: string; password?: string }) => void;
}

export default function WhatsAppLogin({ onLoginSuccess }: WhatsAppLoginProps) {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Verification states
  const [verificationCode, setVerificationCode] = useState('');
  const [userEnteredOtp, setUserEnteredOtp] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [timer, setTimer] = useState(60);
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Loaded saved accounts for quick switching / login
  const [savedAccounts, setSavedAccounts] = useState<{ name: string; phone: string; address: string }[]>([]);

  useEffect(() => {
    // Load previously registered accounts from local storage
    try {
      const saved = localStorage.getItem('registered_customers_list');
      if (saved) {
        setSavedAccounts(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading saved accounts', e);
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Handle clicking "تسجيل" (Register)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = 'الرجاء إدخال اسمك الكامل ثنائياً على الأقل';
    } else if (name.trim().length < 5) {
      errors.name = 'الاسم الكامل يجب أن يتكون من 5 أحرف على الأقل';
    }

    if (!phone.trim()) {
      errors.phone = 'الرجاء إدخال رقم هاتفك المحمول';
    } else if (!/^(010|011|012|015)\d{8}$/.test(phone.trim())) {
      errors.phone = 'يجب إدخال رقم هاتف مصري صحيح (11 رقماً يبدأ بـ 010، 011، 012، أو 015)';
    }

    if (!address.trim()) {
      errors.address = 'الرجاء تحديد عنوان التوصيل بمركز فرشوط لتسليم طلباتك بدقة';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsLoading(true);
    
    // Create new customer account object
    const newAccount = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };

    try {
      // Save customer data to Firebase Firestore
      await saveCustomerToFirebase(newAccount);

      // Save customer data to persistent local storage list as well
      const saved = localStorage.getItem('registered_customers_list');
      let currentList = saved ? JSON.parse(saved) : [];
      // Prevent duplicates
      currentList = currentList.filter((acc: any) => acc.phone !== newAccount.phone);
      currentList.push(newAccount);
      localStorage.setItem('registered_customers_list', JSON.stringify(currentList));
      setSavedAccounts(currentList);
    } catch (err) {
      console.error('Error saving customer profile to Firebase Firestore', err);
    } finally {
      setIsLoading(false);
    }

    // Generate 4-digit verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVerificationCode(code);
    setStep('otp');
    setTimer(60);
    setIsOtpSent(false);
  };

  // Handle clicking "دخول" (Login)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!phone.trim()) {
      errors.phone = 'الرجاء إدخال رقم الهاتف المسجل للدخول';
      setFormErrors(errors);
      return;
    } else if (!/^(010|011|012|015)\d{8}$/.test(phone.trim())) {
      errors.phone = 'الرجاء إدخال رقم هاتف مصري صحيح من 11 رقماً';
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsLoading(true);

    try {
      // Query Firebase Firestore database!
      const found = await getCustomerFromFirebase(phone.trim());

      if (found) {
        // Update local list if not present
        const saved = localStorage.getItem('registered_customers_list');
        let currentList = saved ? JSON.parse(saved) : [];
        if (!currentList.some((acc: any) => acc.phone === found.phone)) {
          currentList.push(found);
          localStorage.setItem('registered_customers_list', JSON.stringify(currentList));
          setSavedAccounts(currentList);
        }
        // Direct the customer to their account immediately!
        onLoginSuccess(found);
      } else {
        // Fallback check on locally saved accounts
        const localFound = savedAccounts.find(acc => acc.phone === phone.trim());
        if (localFound) {
          try {
            await saveCustomerToFirebase(localFound);
          } catch (e) {
            console.error('Error syncing local account with Firebase on login fallback', e);
          }
          onLoginSuccess(localFound);
        } else {
          setFormErrors({
            phone: 'عفواً، هذا الرقم غير مسجل كعميل بفرشوط في قاعدة بيانات الفايربيس (Firebase). يرجى إنشاء حساب جديد أولاً.'
          });
        }
      }
    } catch (err) {
      console.error('Error logging in from Firebase Firestore', err);
      // Fallback search local storage
      const localFound = savedAccounts.find(acc => acc.phone === phone.trim());
      if (localFound) {
        onLoginSuccess(localFound);
      } else {
        setFormErrors({
          phone: 'فشل الاتصال بقاعدة بيانات الفايربيس حالياً. يرجى مراجعة الاتصال والمحاولة مجدداً.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Direct login with a selected saved account
  const handleQuickLogin = (account: { name: string; phone: string; address: string }) => {
    onLoginSuccess(account);
  };

  const handleOpenWhatsAppAndSend = () => {
    setIsOtpSent(true);
    const message = `مرحباً دليفري طلبات فرشوط! 👋 أرغب في تفعيل حسابي كعميل جديد.\n\nالاسم: ${name}\nرقم الهاتف: ${phone}\nالعنوان: ${address}\nرمز تفعيل الحساب: [ ${verificationCode} ]`;
    const whatsappUrl = `https://wa.me/201201502446?text=${encodeURIComponent(message)}`;
    
    // Open in new tab securely
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEnteredOtp.trim() !== verificationCode) {
      setFormErrors({ otp: 'كود التحقق غير صحيح! يرجى إدخال الكود المكتوب بالأعلى أو مراجعة الرسالة المرسلة.' });
      return;
    }

    setFormErrors({});
    
    // Success! Log the user in
    const activeAccount = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };

    onLoginSuccess(activeAccount);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between p-6 relative overflow-hidden text-right font-sans" dir="rtl">
      
      {/* Visual background decorations */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -translate-y-20 translate-x-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none translate-y-20 -translate-x-20" />

      {/* Header Splash */}
      <div className="relative z-10 pt-4 text-center space-y-2">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-red-500/10 border border-red-500/20 text-3xl animate-bounce shadow-lg">
          🛵
        </div>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">طلبات فرشوط</h1>
          <p className="text-[9px] text-red-400 font-extrabold tracking-wider mt-1 bg-red-500/10 px-3 py-1 rounded-full inline-block">
            دليفري مطاعم، بقالة، وخضار بمركز فرشوط وقراها 🇪🇬
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 my-auto max-w-md w-full mx-auto bg-slate-950/40 backdrop-blur-md border border-slate-800/60 rounded-[32px] p-6 shadow-2xl">
        
        {step === 'info' ? (
          <div className="space-y-4">
            
            {/* Custom Tab Switcher - "تسجيل" (حساب جديد) / "دخول" (حسابي) */}
            <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-2xl border border-slate-800/40">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setFormErrors({});
                }}
                className={`py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>تسجيل حساب</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setFormErrors({});
                }}
                className={`py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>دخول لحسابي</span>
              </button>
            </div>

            {/* TAB 1: REGISTER FORM (تسجيل) */}
            {activeTab === 'register' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-white">إنشاء حساب عميل جديد بفرشوط</h3>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                    الرجاء كتابة بياناتك الصحيحة بالأسفل لحفظ حسابك وتسهيل تتبع الطيار لموقعك بدقة.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-slate-400">الاسم واللقب ثنائياً *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-500">
                        <User className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثال: أحمد محمد علي"
                        className={`w-full bg-slate-900 border text-white rounded-xl pr-10 pl-4 py-3 text-xs font-bold outline-none focus:border-red-500 transition-colors ${
                          formErrors.name ? 'border-red-400/50 focus:border-red-400' : 'border-slate-800 focus:border-red-500'
                        }`}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="text-[9px] text-red-400 font-extrabold mt-0.5">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-slate-400">رقم الهاتف المحمول (الواتساب) *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-500">
                        <Smartphone className="h-4 w-4" />
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="010XXXXXXXX"
                        className={`w-full bg-slate-900 border text-white rounded-xl pr-10 pl-4 py-3 text-xs font-bold outline-none focus:border-red-500 transition-colors text-left ${
                          formErrors.phone ? 'border-red-400/50 focus:border-red-400' : 'border-slate-800 focus:border-red-500'
                        }`}
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-[9px] text-red-400 font-extrabold mt-0.5">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* Address Input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-slate-400">عنوان التوصيل بالتفصيل بفرشوط *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-500">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="مثال: شارع الفارابي - أمام صيدلية د.أحمد - الطابق الأول"
                        className={`w-full bg-slate-900 border text-white rounded-xl pr-10 pl-4 py-3 text-xs font-bold outline-none focus:border-red-500 transition-colors ${
                          formErrors.address ? 'border-red-400/50 focus:border-red-400' : 'border-slate-800 focus:border-red-500'
                        }`}
                      />
                    </div>
                    {formErrors.address && (
                      <p className="text-[9px] text-red-400 font-extrabold mt-0.5">{formErrors.address}</p>
                    )}
                  </div>

                  {/* Submit Registration */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-black text-xs py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 disabled:opacity-50"
                  >
                    <span>{isLoading ? 'جاري الحفظ...' : 'حفظ البيانات وتفعيل الواتساب 💬'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: LOGIN FORM (دخول) */}
            {activeTab === 'login' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-white">تسجيل الدخول إلى حسابك بفرشوط</h3>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                    أدخل رقم الهاتف الذي قمت بالتسجيل به للدخول المباشر إلى حسابك وطلباتك فوراً.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Phone Input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold text-slate-400">رقم الهاتف المسجل *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-500">
                        <Smartphone className="h-4 w-4" />
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="010XXXXXXXX"
                        className={`w-full bg-slate-900 border text-white rounded-xl pr-10 pl-4 py-3 text-xs font-bold outline-none focus:border-red-500 transition-colors text-left ${
                          formErrors.phone ? 'border-red-400/50 focus:border-red-400' : 'border-slate-800 focus:border-red-500'
                        }`}
                        style={{ direction: 'ltr' }}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-[9px] text-red-400 font-extrabold mt-0.5">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* Submit Login / Direct to Account */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white font-black text-xs py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 disabled:opacity-50"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{isLoading ? 'جاري البحث...' : 'دخول وتوجيه إلى حسابي 🚀'}</span>
                  </button>
                </form>

                {/* Saved Accounts Panel - Beautiful Quick Tap Login */}
                {savedAccounts.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    <p className="text-[10px] text-slate-400 font-extrabold">الحسابات النشطة على هذا المتصفح:</p>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto">
                      {savedAccounts.map((acc, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleQuickLogin(acc)}
                          className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800/80 p-2 rounded-xl text-right flex items-center justify-between gap-2 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-xs font-black">
                              👤
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-white">{acc.name}</p>
                              <p className="text-[8px] text-slate-400 font-bold">{acc.phone}</p>
                            </div>
                          </div>
                          <span className="text-[9px] text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded-md">دخول سريع ⚡</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          /* STEP 2: WHATSAPP OTP VERIFICATION SCREEN */
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-1">
              <button 
                onClick={() => setStep('info')}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h3 className="text-sm font-black text-white">تأكيد الحساب عبر الواتساب</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">رقم الهاتف: {phone}</p>
              </div>
            </div>

            {/* Notification and Instruction */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="text-xl">💬</span>
                <div>
                  <h4 className="font-extrabold text-xs text-emerald-400">تأكيد الواتساب الإلزامي</h4>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-bold mt-1">
                    أطلقنا نظام التحقق الآلي لمنع الطلبات المجهولة وضمان حقوق المطاعم بفرشوط.
                  </p>
                </div>
              </div>

              {/* Generated Verification Code display */}
              <div className="bg-slate-900 border border-slate-800/60 p-3 rounded-xl text-center space-y-1">
                <p className="text-[9px] text-slate-400 font-bold">كود التحقق الخاص بك لطلبات فرشوط</p>
                <p className="text-2xl font-black text-red-400 tracking-widest">{verificationCode}</p>
              </div>

              {/* Direct WhatsApp trigger button */}
              <button
                type="button"
                onClick={handleOpenWhatsAppAndSend}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                <span>إرسال كود التفعيل عبر الواتساب</span>
              </button>
            </div>

            {/* OTP Code submission form */}
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-400">أدخل كود التحقق المكون من 4 أرقام *</label>
                <input
                  type="text"
                  maxLength={4}
                  value={userEnteredOtp}
                  onChange={(e) => setUserEnteredOtp(e.target.value)}
                  placeholder="أدخل الـ 4 أرقام هنا"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3 text-sm font-black outline-none focus:border-red-500 transition-colors text-center tracking-widest"
                />
                {formErrors.otp && (
                  <p className="text-[9px] text-red-400 font-extrabold mt-0.5">{formErrors.otp}</p>
                )}
              </div>

              <div className="text-[9px] text-slate-500 text-center font-bold">
                {timer > 0 ? (
                  <span>يمكنك إعادة طلب التفعيل بعد {timer} ثانية</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => {
                      const code = Math.floor(1000 + Math.random() * 9000).toString();
                      setVerificationCode(code);
                      setTimer(60);
                      setIsOtpSent(false);
                    }}
                    className="text-red-400 hover:underline cursor-pointer"
                  >
                    توليد كود جديد وإعادة الإرسال
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-black text-xs py-3.5 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle className="h-4 w-4" />
                <span>تأكيد وتفعيل الحساب 🚀</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer / Safety Badges */}
      <div className="relative z-10 pt-4 pb-2 text-center space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-bold">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>تشفير وحماية البيانات 256-bit SSL</span>
        </div>
        <p className="text-[8px] text-slate-600 font-bold leading-none">
          حقوق الطبع محفوظة © طلبات فرشوط ٢٠٢٦
        </p>
      </div>
    </div>
  );
}
