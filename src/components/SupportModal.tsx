import React from 'react';
import { X, MessageSquare, Shield, Clock } from 'lucide-react';

interface SupportModalProps {
  onClose: () => void;
}

export default function SupportModal({ onClose }: SupportModalProps) {
  const supportNumbers = [
    {
      id: 'hassan',
      name: 'الإدارة العامة والدعم الفني',
      phone: '01060416808',
      role: 'متابعة فنية وتطوير الأنظمة وحل مشاكل الطلبات والشكاوى المعقدة',
      whatsappUrl: 'https://wa.me/201060416808?text=%D8%A3%D9%87%D9%84%D8%A7%D9%8B%20%D8%A8%D9%83%20%D8%A3%D8%B3%D8%AA%D8%A7%D8%B0%20%D8%AD%D8%B3%D9%86%D8%8C%20%D8%A3%D8%AD%D8%AA%D8%A7%D8%AC%20%D8%A5%D9%84%D9%89%20%D8%AF%D8%B9%D9%85%20%D9%81%D9%8A%20%D8%AA%D8%B7%D8%A8%D9%8A%D9%82%20%D8%B7%D9%84%D8%A8%D8%A7%D8%AA%20%D9%81%D8%B1%D8%B4%D9%88%D8%B7',
      isPrimary: true,
    },
    {
      id: 'customer_care',
      name: 'خدمة عملاء فرشوط ومتابعة الطيارين',
      phone: '01065049420',
      role: 'استقبال وتجهيز وحل مشاكل التوصيل المباشرة وتنسيق الكباتن',
      whatsappUrl: 'https://wa.me/201065049420?text=%D8%A3%D9%87%D9%84%D8%A7%D9%8B%20%D8%A8%D9%83%D9%85%20%D9%81%D9%8A%20%D8%AF%D8%B9%D9%85%20%D8%B7%D9%84%D8%A8%D8%A7%D8%AA%20%D9%81%D8%B1%D8%B4%D9%88%D8%B7%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%88%D9%85%20%D8%B7%D9%84%D8%A8%D9%8A',
      isPrimary: false,
    }
  ];

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-end justify-center sm:items-center p-4">
      <div className="bg-white w-full max-w-md rounded-t-[36px] sm:rounded-[36px] p-6 shadow-2xl space-y-5 max-h-[92%] overflow-y-auto animate-slide-up relative text-right" dir="rtl">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl shadow-inner animate-pulse">
            ☎️
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-800">الدعم المباشر لـ طلبات فرشوط</h3>
            <p className="text-[11px] text-slate-400 font-bold">بوابة التواصل السريع مع الإدارة وفريق خدمة العملاء 🇪🇬</p>
          </div>
        </div>

        {/* Informative Banner */}
        <div className="bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-100/50 p-3.5 rounded-2xl space-y-1">
          <div className="flex items-center gap-1.5 text-red-700 font-black text-[11px]">
            <Clock className="h-3.5 w-3.5 text-red-500 animate-spin" />
            <span>ساعات العمل والتغطية بالمركز:</span>
          </div>
          <p className="text-[10px] text-slate-600 font-extrabold leading-relaxed pr-5">
            فريق الدعم متواجد لخدمتكم ومتابعة طلباتكم مع المطاعم والطيارين يومياً من الساعة <span className="text-red-600">10:00 صباحاً</span> وحتى <span className="text-red-600">2:00 بعد منتصف الليل</span>.
          </p>
        </div>

        {/* Contact list */}
        <div className="space-y-3.5">
          <span className="text-[10px] font-black text-slate-400 block -mb-1">أرقام الدعم الرسمية المتاحة:</span>
          
          {supportNumbers.map((support) => (
            <div 
              key={support.id}
              className={`p-4 rounded-[22px] border transition-all ${
                support.isPrimary 
                  ? 'bg-red-50/20 border-red-100 hover:border-red-200 shadow-sm' 
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-slate-800">{support.name}</span>
                    {support.isPrimary && (
                      <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                        فني / إداري
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold leading-normal">{support.role}</p>
                  
                  {/* Styled Phone Link display masked */}
                  <div className="pt-1.5 flex items-center gap-1 text-slate-400 text-[12px] font-black tracking-wider" dir="ltr">
                    <span>📞</span>
                    <span>{support.phone.slice(0, 4)}*******</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons - WhatsApp Only */}
              <div className="mt-3.5">
                <a 
                  href={support.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white rounded-2xl py-3 px-4 text-xs font-black flex items-center justify-center gap-2 transition-all text-center shadow-md cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>تواصل ومتابعة عبر واتساب الدعم</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Security and safety assurance */}
        <div className="bg-slate-50 p-3 rounded-2xl flex items-start gap-2.5 border border-slate-100">
          <Shield className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[9.5px] font-extrabold text-slate-700 block">ضمان أمان المعاملات والطيارين</span>
            <p className="text-[8.5px] text-slate-400 font-semibold leading-normal">
              جميع العمليات والطلبات مراقبة من قبل الإدارة لضمان الجودة، سرعة الاستجابة، والتسعير العادل لكافة أهالي مركز فرشوط.
            </p>
          </div>
        </div>

        <div className="text-center text-[9px] text-slate-300 font-bold pt-1">
          طلبات فرشوط - نعمل دائماً على راحتكم 🛵
        </div>
      </div>
    </div>
  );
}
