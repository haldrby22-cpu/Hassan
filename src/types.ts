export type CategoryType = 'restaurants' | 'grocery' | 'cafes';

export interface Shop {
  id: string;
  name: string;
  category: CategoryType;
  image: string;
  rating: number;
  reviewsCount: number;
  deliveryTime: number; // in minutes
  deliveryFee: number; // in EGP (ج.م)
  minOrder: number; // in EGP (ج.م)
  distance: number; // in km
  tags: string[];
  featured: boolean;
  password?: string;
}

export interface MenuItem {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number; // in EGP (ج.م)
  image: string;
  rating?: number;
  tags?: string[];
  popular?: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type OrderStatus = 'received' | 'preparing' | 'on_the_way' | 'delivered';

export interface Order {
  id: string;
  date: string;
  shopId: string;
  shopName: string;
  shopImage: string;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  vat: number;
  discount: number;
  total: number;
  status: OrderStatus;
  address: string;
  phone: string;
  paymentMethod: string;
  notes?: string;
  trackingProgress: number; // 0 to 100
  // Scheduling fields
  isScheduled?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  // Rating & review fields
  restaurantRating?: number;
  restaurantReview?: string;
  driverRating?: number;
  driverReview?: string;
}

export interface PromoCode {
  code: string;
  discountPercent?: number;
  discountFixed?: number;
  minSubtotal: number;
  description: string;
}

export interface InAppNotification {
  id: string;
  orderId: string;
  title: string;
  message: string;
  type: 'status_change' | 'system' | 'wallet';
  status?: OrderStatus;
  read: boolean;
  date: string;
  shopName?: string;
}

