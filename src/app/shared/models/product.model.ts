export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  brand: string;
  featured?: boolean;
  discount?: number;
  topRated?: boolean;
  wishlisted?: boolean;
  stock?: number;
}