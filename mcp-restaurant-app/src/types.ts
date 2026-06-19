export type MenuCategory = "appetizer" | "main" | "dessert" | "drink";

export interface MenuItem {
  id: string;
  name: string;
  nameKo: string;
  category: MenuCategory;
  price: number;
  description: string;
  tags: string[];
}

export interface MenuPayload {
  restaurant: {
    name: string;
    tagline: string;
  };
  category: MenuCategory | null;
  items: MenuItem[];
}

export interface CartLine {
  id: string;
  quantity: number;
}

export interface OrderSummary {
  lines: Array<{
    item: MenuItem;
    quantity: number;
    lineTotal: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
}

export interface OrderPayload {
  orderId: string;
  summary: OrderSummary;
}

export const CATEGORY_LABELS: Record<MenuCategory | "all", string> = {
  all: "All",
  appetizer: "Appetizers",
  main: "Mains",
  dessert: "Desserts",
  drink: "Drinks",
};
