/**
 * @file Hanok Kitchen — interactive restaurant menu MCP App (React).
 */
import type { App, McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { StrictMode, useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import styles from "./mcp-app.module.css";
import {
  CATEGORY_LABELS,
  type CartLine,
  type MenuCategory,
  type MenuItem,
  type MenuPayload,
  type OrderPayload,
} from "./types";

function readStructuredContent<T>(result: CallToolResult): T | null {
  if (result.structuredContent && typeof result.structuredContent === "object") {
    return result.structuredContent as T;
  }

  const text = result.content?.find((entry) => entry.type === "text")?.text;
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function RestaurantApp() {
  const [hostContext, setHostContext] = useState<McpUiHostContext | undefined>();

  const { app, error } = useApp({
    appInfo: { name: "Hanok Kitchen", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (createdApp) => {
      createdApp.onteardown = async () => ({});
      createdApp.onhostcontextchanged = (params) => {
        setHostContext((previous) => ({ ...previous, ...params }));
      };
      createdApp.onerror = console.error;
    },
  });

  useEffect(() => {
    if (app) {
      setHostContext(app.getHostContext());
    }
  }, [app]);

  if (error) {
    return (
      <div className={styles.error}>
        <strong>Error:</strong> {error.message}
      </div>
    );
  }

  if (!app) {
    return <div className={styles.loading}>Connecting to Hanok Kitchen…</div>;
  }

  return (
    <RestaurantAppInner app={app} hostContext={hostContext} />
  );
}

interface RestaurantAppInnerProps {
  app: App;
  hostContext?: McpUiHostContext;
}

function RestaurantAppInner({ app, hostContext }: RestaurantAppInnerProps) {
  const [menu, setMenu] = useState<MenuPayload | null>(null);
  const [activeCategory, setActiveCategory] = useState<MenuCategory | "all">(
    "all",
  );
  const [cart, setCart] = useState<CartLine[]>([]);
  const [order, setOrder] = useState<OrderPayload | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadMenu = useCallback(
    async (category?: MenuCategory) => {
      setLoadingMenu(true);
      setStatusMessage(null);

      try {
        const result = await app.callServerTool({
          name: "browse-menu",
          arguments: category ? { category } : {},
        });
        const payload = readStructuredContent<MenuPayload>(result);
        if (payload) {
          setMenu(payload);
        }
      } catch (loadError) {
        console.error(loadError);
        setStatusMessage("Could not load the menu. Please try again.");
      } finally {
        setLoadingMenu(false);
      }
    },
    [app],
  );

  useEffect(() => {
    void loadMenu();
  }, [loadMenu]);

  const visibleItems = useMemo(() => {
    if (!menu) {
      return [];
    }
    if (activeCategory === "all") {
      return menu.items;
    }
    return menu.items.filter((item) => item.category === activeCategory);
  }, [activeCategory, menu]);

  const cartSummary = useMemo(() => {
    if (!menu) {
      return { count: 0, subtotal: 0 };
    }

    const itemMap = new Map(menu.items.map((item) => [item.id, item]));
    let count = 0;
    let subtotal = 0;

    for (const line of cart) {
      const item = itemMap.get(line.id);
      if (!item) {
        continue;
      }
      count += line.quantity;
      subtotal += item.price * line.quantity;
    }

    return { count, subtotal };
  }, [cart, menu]);

  const addToCart = useCallback((item: MenuItem) => {
    setOrder(null);
    setCart((previous) => {
      const existing = previous.find((line) => line.id === item.id);
      if (existing) {
        return previous.map((line) =>
          line.id === item.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [...previous, { id: item.id, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setOrder(null);
    setCart((previous) =>
      previous
        .map((line) =>
          line.id === id
            ? { ...line, quantity: line.quantity + delta }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const handleCategoryChange = useCallback(
    (category: MenuCategory | "all") => {
      setActiveCategory(category);
      if (category === "all") {
        void loadMenu();
      } else {
        void loadMenu(category);
      }
    },
    [loadMenu],
  );

  const handlePlaceOrder = useCallback(async () => {
    if (cart.length === 0) {
      setStatusMessage("Add at least one dish before placing an order.");
      return;
    }

    setPlacingOrder(true);
    setStatusMessage(null);

    try {
      const result = await app.callServerTool({
        name: "place-order",
        arguments: { items: cart },
      });

      if (result.isError) {
        const message =
          result.content?.find((entry) => entry.type === "text")?.text ??
          "Order failed.";
        setStatusMessage(message);
        return;
      }

      const payload = readStructuredContent<OrderPayload>(result);
      if (payload) {
        setOrder(payload);
        setCart([]);
        setStatusMessage(`Order ${payload.orderId} confirmed.`);
        await app.sendLog({
          level: "info",
          data: { orderId: payload.orderId, total: payload.summary.total },
        });
      }
    } catch (placeError) {
      console.error(placeError);
      setStatusMessage("Could not place the order. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  }, [app, cart]);

  return (
    <main
      className={styles.main}
      style={{
        paddingTop: hostContext?.safeAreaInsets?.top,
        paddingRight: hostContext?.safeAreaInsets?.right,
        paddingBottom: hostContext?.safeAreaInsets?.bottom,
        paddingLeft: hostContext?.safeAreaInsets?.left,
      }}
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>MCP Restaurant App</p>
        <h1>{menu?.restaurant.name ?? "Hanok Kitchen"}</h1>
        <p className={styles.tagline}>
          {menu?.restaurant.tagline ?? "Modern Korean comfort food"}
        </p>
      </header>

      <section className={styles.categories} aria-label="Menu categories">
        {(Object.keys(CATEGORY_LABELS) as Array<MenuCategory | "all">).map(
          (category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? `${styles.categoryButton} ${styles.categoryButtonActive}`
                  : styles.categoryButton
              }
              onClick={() => handleCategoryChange(category)}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ),
        )}
      </section>

      {statusMessage ? (
        <p className={styles.status} role="status">
          {statusMessage}
        </p>
      ) : null}

      {order ? (
        <section className={styles.orderCard} aria-label="Order confirmation">
          <h2>Order Confirmed</h2>
          <p className={styles.orderId}>{order.orderId}</p>
          <ul className={styles.orderLines}>
            {order.summary.lines.map((line) => (
              <li key={line.item.id}>
                <span>
                  {line.quantity}× {line.item.name}
                </span>
                <span>${line.lineTotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className={styles.orderTotals}>
            <div>
              <span>Subtotal</span>
              <span>${order.summary.subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span>Tax</span>
              <span>${order.summary.tax.toFixed(2)}</span>
            </div>
            <div className={styles.orderTotal}>
              <span>Total</span>
              <span>${order.summary.total.toFixed(2)}</span>
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.menuGrid} aria-label="Menu items">
        {loadingMenu ? (
          <p className={styles.loading}>Loading menu…</p>
        ) : (
          visibleItems.map((item) => (
            <article key={item.id} className={styles.menuCard}>
              <div className={styles.menuCardHeader}>
                <div>
                  <h3>{item.name}</h3>
                  <p className={styles.nameKo}>{item.nameKo}</p>
                </div>
                <p className={styles.price}>${item.price.toFixed(2)}</p>
              </div>
              <p className={styles.description}>{item.description}</p>
              {item.tags.length > 0 ? (
                <div className={styles.tags}>
                  {item.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                className={styles.addButton}
                onClick={() => addToCart(item)}
              >
                Add to cart
              </button>
            </article>
          ))
        )}
      </section>

      <footer className={styles.cartBar}>
        <div>
          <p className={styles.cartLabel}>Cart</p>
          <p className={styles.cartMeta}>
            {cartSummary.count} item{cartSummary.count === 1 ? "" : "s"} · $
            {cartSummary.subtotal.toFixed(2)}
          </p>
        </div>
        <button
          type="button"
          className={styles.checkoutButton}
          disabled={placingOrder || cartSummary.count === 0}
          onClick={() => void handlePlaceOrder()}
        >
          {placingOrder ? "Placing order…" : "Place order"}
        </button>
      </footer>

      {cart.length > 0 ? (
        <section className={styles.cartPanel} aria-label="Cart details">
          <h2>Your cart</h2>
          <ul className={styles.cartLines}>
            {cart.map((line) => {
              const item = menu?.items.find((entry) => entry.id === line.id);
              if (!item) {
                return null;
              }

              return (
                <li key={line.id} className={styles.cartLine}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>${item.price.toFixed(2)} each</p>
                  </div>
                  <div className={styles.quantityControls}>
                    <button
                      type="button"
                      aria-label={`Decrease ${item.name}`}
                      onClick={() => updateQuantity(line.id, -1)}
                    >
                      −
                    </button>
                    <span>{line.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase ${item.name}`}
                      onClick={() => updateQuantity(line.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RestaurantApp />
  </StrictMode>,
);
