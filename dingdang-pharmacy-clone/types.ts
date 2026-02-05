
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  tags?: string[];
  sales?: number;
  category?: string;
  specification?: string;
}

export interface CartItem extends Product {
  quantity: number;
  selected: boolean;
}

export enum ViewType {
  HOME = 'home',
  STORE = 'store',
  GROUP_BUY = 'group_buy',
  LIST = 'list',
  MINE = 'mine',
  PRODUCT_DETAIL = 'product_detail',
  CHECKOUT = 'checkout'
}
