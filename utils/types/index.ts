type ProductId = string;

type Location = {
  lat: string;
  lng: string;
};
export type Address = {
  fullName: string;
  address: string;
  city: string;
  postalCode: number;
  location: Location;
  country: string;
};

export type Products = {
  _id: ProductId;
  name: string;
  slug: string;
  category: string;
  image: string;
  price: number;
  brand: string;
  rating: number;
  quantity: number;
  featuredImage: string;
  numReviews: number;
  countInStock: number;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthUser = {
  _id?: string;
  name?: string;
  email?: string;
  isAdmin?: boolean;
  exp?: number;
  iat?: number;
};

export type Users = {
  _id: string;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  token: string;
};

export type ItemReview = {
  _id?: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface Reviews extends Products {
  reviews: ItemReview[];
  save(): void;
}

export interface FArgs {
  price?: string;
  sort?: string;
  rating?: string;
  brand?: string;
  category?: string;
  query?: any;
  min?: string;
  max?: string;
  page?: string | number;
  searchQuery?: string;
}

export interface User extends Users {
  confirmPassword: string;
}

type CartItems = {
  cartItems: Products[];
  shippingAddress: Address;
  paymentMethod?: string;
};

export type CartState = {
  darkMode: boolean;
  cart: CartItems;
  userInfo: Users;
};

export type CartAction = {
  type: string;
  payload: any;
};

export type OrderItems = {
  _id: string;
  user: Users;
  orderItems: Products[];
  shippingAddress: Address;
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: string;
  isDelivered: string;
  paidAt: string;
  deliveredAt: string;
  createdAt: string;
};

export type OrderState = {
  loading: boolean;
  successPay?: boolean;
  order: OrderItems;
  error: string;
  loadingDeliver?: boolean;
  successDeliver?: boolean;
};

export type OrderAction = {
  type: string;
  payload?: OrderItems | string;
};

export type Sales = {
  _id: string;
  totalSales: number;
};

export type AData = {
  ordersCount: number;
  productsCount: number;
  usersCount: number;
  ordersPrice: number;
  salesData: Sales[];
};

export type GError = {
  message: string;
  response: {
    data: {
      message: string;
    };
  };
};

type FileBuffer = {
  buffer: Buffer;
};

export interface ImgBuffer {
  file: FileBuffer;
}
