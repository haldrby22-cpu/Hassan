import React, { useState, useEffect } from 'react';
import { MenuItem, Shop } from '../types';
import { Clock, Percent, Store, Flame, ShoppingBag, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

interface ExclusiveOffersProps {
  menuItems: MenuItem[];
  shops: Shop[];
  onAddToCart: (item: MenuItem) => void;
  onSelectShop: (shopId: string) => void;
}

export default function ExclusiveOffers({
  menuItems,
  shops,
  onAddToCart,
  onSelectShop,
}: ExclusiveOffersProps) {
  // Find all items with active offers
  const [offers, setOffers] = useState<MenuItem[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<{ [itemId: string]: string }>({});
  const [progressPercent, setProgressPercent] = useState<{ [itemId: string]: number }>({});

  // Filter offers and update on mount / menuItems changes
  useEffect(() => {
    const activeOffers = menuItems.filter((item) => {
      if (!item.originalPrice) return false;
      if (item.expiresAt) {
        const remaining = new Date(item.expiresAt).getTime() - Date.now();
        if (remaining <= 0) return false;
      }
      return true;
    });
    setOffers(activeOffers);
  }, [menuItems]);

  // Handle live ticking timer
  useEffect(() => {
    if (offers.length === 0) return;

    const interval = setInterval(() => {
      const newTimeRemaining: { [itemId: string]: string } = {};
      const newProgressPercent: { [itemId: string]: number } = {};
      let hasExpiredAny = false;

      offers.forEach((item) => {
        if (!item.expiresAt) {
          // Fallback if no expiresAt is defined (e.g. 2 hours from now)
          newTimeRemaining[item.id] = '01:59:59';
          newProgressPercent[item.id] = 100;
          return;
        }

        const expiryTime = new Date(item.expiresAt).getTime();
        const diff = expiryTime - Date.now();

        if (diff <= 0) {
          hasExpiredAny = true;
          return;
        }

        // Format countdown string: HH:MM:SS
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const pad = (n: number) => n.toString().padStart(2, '0');
        newTimeRemaining[item.id] = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

        // Calculate progress percentage assuming 3 hours max duration (180 minutes)
        // or using duration if possible, otherwise scale from current expiry
        const totalDuration = 3 * 60 * 60 * 1000; // 3 hours in ms
        const remainingPercent = Math.min(100, Math.max(0, (diff / totalDuration) * 100));
        newProgressPercent[item.id] = remainingPercent;
      });

      setTimeRemaining(newTimeRemaining);
      setProgressPercent(newProgressPercent);

      // If any offer expired during this tick, trigger state update
      if (hasExpiredAny) {
        const freshOffers = menuItems.filter((item) => {
          if (!item.originalPrice) return false;
          if (item.expiresAt) {
            const remaining = new Date(item.expiresAt).getTime() - Date.now();
            if (remaining <= 0) return false;
          }
          return true;
        });
        setOffers(freshOffers);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [offers, menuItems]);

  if (offers.length === 0) return null;

  // Horizontal scroll functions
  const scrollRight = () => {
    const el = document.getElementById('offers-scroll-container');
    if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollLeft = () => {
    const el = document.getElementById('offers-scroll-container');
    if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div id="exclusive-offers-section" className="space-y-4 animate-fade-in text-right" dir="rtl">
      {/* Header with Title and Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-red-500 text-white flex items-center justify-center text-sm shrink-0 animate-bounce">
              🔥
            </div>
            <h2 className="text-lg font-black text-slate-800 tracking-tight">العروض والخصومات الحصرية المحدودة بفرشوط</h2>
          </div>
          <p className="text-xs text-slate-400 font-bold">خصومات نارية ووجبات مغرية لفترة محدودة جداً - اطلبها الآن قبل انتهاء العداد!</p>
        </div>

        {/* Navigation Buttons for desktop scroll */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={scrollLeft}
            className="h-8 w-8 rounded-xl bg-white border border-slate-100 hover:border-slate-200 text-slate-600 hover:text-slate-800 flex items-center justify-center shadow-sm hover:shadow transition-all cursor-pointer"
            title="التالي"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={scrollRight}
            className="h-8 w-8 rounded-xl bg-white border border-slate-100 hover:border-slate-200 text-slate-600 hover:text-slate-800 flex items-center justify-center shadow-sm hover:shadow transition-all cursor-pointer"
            title="السابق"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Offers Slider */}
      <div
        id="offers-scroll-container"
        className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {offers.map((item) => {
          const shop = shops.find((s) => s.id === item.shopId);
          const time = timeRemaining[item.id] || '00:00:00';
          const pct = progressPercent[item.id] !== undefined ? progressPercent[item.id] : 100;
          const discountPct = item.originalPrice 
            ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) 
            : 0;

          return (
            <div
              key={item.id}
              className="w-[280px] sm:w-[320px] shrink-0 bg-white rounded-3xl border border-red-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 snap-start overflow-hidden flex flex-col group"
            >
              {/* Image & Badges */}
              <div className="relative h-40 w-full overflow-hidden shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Dark Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                {/* Discount Badge */}
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-2xl flex items-center gap-1 shadow-md">
                  <Percent className="h-3 w-3" />
                  <span>خصم {discountPct}%</span>
                </div>

                {/* Shop Badge */}
                {shop && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectShop(shop.id);
                    }}
                    className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm hover:bg-white text-slate-800 text-[10px] font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 shadow-sm border border-slate-100 transition-colors"
                  >
                    <Store className="h-3 w-3 text-red-500" />
                    <span>{shop.name}</span>
                  </button>
                )}

                {/* Countdown Timer Overlaid bottom-right */}
                <div className="absolute bottom-3 right-3 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-md border border-white/10 font-mono text-xs font-bold">
                  <Clock className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                  <span className="text-red-400 select-all tracking-wider">{time}</span>
                </div>
              </div>

              {/* Progress Bar (Time Remaining) */}
              <div className="w-full bg-slate-100 h-1.5 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-l-full transition-all duration-1000"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Card Body */}
              <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                <div className="space-y-1 cursor-pointer" onClick={() => onSelectShop(item.shopId)}>
                  <h3 className="font-extrabold text-sm text-slate-800 group-hover:text-red-500 transition-colors line-clamp-1">{item.name}</h3>
                  <p className="text-[11px] text-slate-400 font-bold leading-relaxed line-clamp-2">{item.description}</p>
                </div>

                {/* Price and Cart Button */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-50 gap-2">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-black block line-through font-mono leading-none">{item.originalPrice} ج.م</span>
                    <span className="text-base font-extrabold text-red-500 font-mono tracking-tight leading-tight mt-0.5 block">{item.price} ج.م</span>
                  </div>

                  <button
                    onClick={() => onAddToCart(item)}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-red-100 cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>أضف للسلة</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
