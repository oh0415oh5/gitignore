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

export const RESTAURANT_NAME = "Hanok Kitchen";
export const RESTAURANT_TAGLINE = "Modern Korean comfort food";

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "kimchi-pancake",
    name: "Kimchi Pancake",
    nameKo: "김치전",
    category: "appetizer",
    price: 9.5,
    description: "Crispy savory pancake with aged kimchi and scallions.",
    tags: ["vegetarian", "spicy"],
  },
  {
    id: "mandu",
    name: "Steamed Mandu",
    nameKo: "찐만두",
    category: "appetizer",
    price: 8.0,
    description: "Hand-folded dumplings with pork, tofu, and glass noodles.",
    tags: [],
  },
  {
    id: "bibimbap",
    name: "Bibimbap",
    nameKo: "비빔밥",
    category: "main",
    price: 15.5,
    description: "Warm rice bowl with seasonal vegetables, egg, and gochujang.",
    tags: ["vegetarian-option"],
  },
  {
    id: "bulgogi",
    name: "Bulgogi",
    nameKo: "불고기",
    category: "main",
    price: 18.0,
    description: "Soy-marinated beef grilled with pear, garlic, and sesame.",
    tags: ["gluten-free"],
  },
  {
    id: "jjigae",
    name: "Kimchi Jjigae",
    nameKo: "김치찌개",
    category: "main",
    price: 14.0,
    description: "Slow-simmered kimchi stew with pork belly and tofu.",
    tags: ["spicy"],
  },
  {
    id: "hotteok",
    name: "Hotteok",
    nameKo: "호떡",
    category: "dessert",
    price: 6.5,
    description: "Pan-fried sweet pancake filled with brown sugar and nuts.",
    tags: ["vegetarian"],
  },
  {
    id: "bingsu",
    name: "Mango Bingsu",
    nameKo: "망고빙수",
    category: "dessert",
    price: 9.0,
    description: "Shaved milk ice with fresh mango, condensed milk, and red bean.",
    tags: ["vegetarian"],
  },
  {
    id: "barley-tea",
    name: "Barley Tea",
    nameKo: "보리차",
    category: "drink",
    price: 3.5,
    description: "Chilled roasted barley tea served in a traditional pot.",
    tags: ["caffeine-free"],
  },
  {
    id: "soju-cocktail",
    name: "Yuja Soju Cocktail",
    nameKo: "유자 소주 칵테일",
    category: "drink",
    price: 11.0,
    description: "Citrus yuja syrup, soju, and sparkling water over ice.",
    tags: ["contains-alcohol"],
  },
];

export const CATEGORY_LABELS: Record<MenuCategory | "all", string> = {
  all: "All",
  appetizer: "Appetizers",
  main: "Mains",
  dessert: "Desserts",
  drink: "Drinks",
};

export function filterMenu(category?: MenuCategory): MenuItem[] {
  if (!category) {
    return MENU_ITEMS;
  }
  return MENU_ITEMS.filter((item) => item.category === category);
}

export function formatMenuText(items: MenuItem[]): string {
  if (items.length === 0) {
    return "No menu items found for that category.";
  }

  return items
    .map(
      (item) =>
        `${item.name} (${item.nameKo}) — $${item.price.toFixed(2)}\n  ${item.description}`,
    )
    .join("\n\n");
}

export interface OrderLine {
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

const TAX_RATE = 0.0875;

export function buildOrderSummary(items: OrderLine[]): OrderSummary {
  const lines = items
    .map((line) => {
      const item = MENU_ITEMS.find((entry) => entry.id === line.id);
      if (!item || line.quantity <= 0) {
        return null;
      }
      return {
        item,
        quantity: line.quantity,
        lineTotal: item.price * line.quantity,
      };
    })
    .filter((line): line is NonNullable<typeof line> => line !== null);

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  return { lines, subtotal, tax, total };
}

export function formatOrderText(summary: OrderSummary): string {
  if (summary.lines.length === 0) {
    return "No items in order.";
  }

  const lineText = summary.lines
    .map(
      (line) =>
        `${line.quantity}x ${line.item.name} — $${line.lineTotal.toFixed(2)}`,
    )
    .join("\n");

  return [
    lineText,
    "",
    `Subtotal: $${summary.subtotal.toFixed(2)}`,
    `Tax: $${summary.tax.toFixed(2)}`,
    `Total: $${summary.total.toFixed(2)}`,
  ].join("\n");
}
