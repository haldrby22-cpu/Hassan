import { Star, Clock, MapPin, Truck } from 'lucide-react';
import { Shop } from '../types';

interface ShopCardProps {
  key?: string | number;
  shop: Shop;
  onClick: () => void;
}

export default function ShopCard({ shop, onClick }: ShopCardProps) {
  return (
    <div
      id={`shop-card-${shop.id}`}
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-red-100 cursor-pointer"
    >
      {/* Featured Ribbon */}
      {shop.featured && (
        <span className="absolute top-3 right-3 z-10 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          مميز 🔥
        </span>
      )}

      {/* Image container with scale hover effect */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={shop.image}
          alt={shop.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
      </div>

      {/* Content */}
      <div className="flex flex-col p-4 flex-grow">
        {/* Title & Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-red-500 transition-colors">
            {shop.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-bold">
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            <span>{shop.rating}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {shop.tags.map((tag, idx) => (
            <span
              key={idx}
              className="rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-500 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer info bar */}
        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-slate-50 pt-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1 justify-center bg-slate-50/50 py-1.5 rounded-lg">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{shop.deliveryTime} دقيقة</span>
          </div>
          <div className="flex items-center gap-1 justify-center bg-slate-50/50 py-1.5 rounded-lg">
            <Truck className="h-3.5 w-3.5 text-slate-400" />
            <span>{shop.deliveryFee === 0 ? 'مجانًا' : `${shop.deliveryFee} ج.م`}</span>
          </div>
          <div className="flex items-center gap-1 justify-center bg-slate-50/50 py-1.5 rounded-lg">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{shop.distance} كم</span>
          </div>
        </div>
      </div>
    </div>
  );
}
