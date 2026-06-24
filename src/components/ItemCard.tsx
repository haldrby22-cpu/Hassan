import { Plus, Minus, Star } from 'lucide-react';
import { MenuItem } from '../types';

interface ItemCardProps {
  key?: string | number;
  item: MenuItem;
  cartQuantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

export default function ItemCard({ item, cartQuantity, onAdd, onRemove }: ItemCardProps) {
  return (
    <div
      id={`item-card-${item.id}`}
      className="group relative flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-red-100"
    >
      {/* Item Image */}
      <div className="relative w-full sm:w-28 sm:h-28 h-40 shrink-0 overflow-hidden rounded-xl bg-slate-100">
        <img
          src={item.image}
          alt={item.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {item.popular && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
            شائع 🔥
          </span>
        )}
      </div>

      {/* Item Details */}
      <div className="flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-slate-800 text-base group-hover:text-red-500 transition-colors">
              {item.name}
            </h4>
            {item.rating && (
              <div className="flex items-center gap-0.5 text-amber-600 text-xs font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span>{item.rating}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        {/* Pricing and Action Button */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-slate-900">{item.price}</span>
            <span className="text-xs text-slate-400 font-semibold">ج.م</span>
          </div>

          {/* Cart Control */}
          <div className="transition-all duration-300">
            {cartQuantity > 0 ? (
              <div className="flex items-center gap-3 bg-red-500 text-white rounded-full p-1 shadow-sm border border-red-500">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4 stroke-[2.5]" />
                </button>
                <span className="text-sm font-bold w-4 text-center">{cartQuantity}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                className="flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>أضف للسلة</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
