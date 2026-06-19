import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  buildOrderSummary,
  filterMenu,
  formatMenuText,
  formatOrderText,
  MENU_ITEMS,
  RESTAURANT_NAME,
  RESTAURANT_TAGLINE,
  type MenuCategory,
} from "./menu.js";

const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

const resourceUri = "ui://restaurant/mcp-app.html";

const categorySchema = z
  .enum(["appetizer", "main", "dessert", "drink"])
  .optional()
  .describe("Filter menu items by category. Omit to show the full menu.");

const menuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameKo: z.string(),
  category: z.enum(["appetizer", "main", "dessert", "drink"]),
  price: z.number(),
  description: z.string(),
  tags: z.array(z.string()),
});

export function createServer(): McpServer {
  const server = new McpServer({
    name: "Hanok Kitchen Restaurant",
    version: "1.0.0",
  });

  registerAppTool(
    server,
    "browse-menu",
    {
      title: "Browse Menu",
      description:
        "Browse the Hanok Kitchen menu. Returns dishes with names, prices, and descriptions. The interactive UI lets guests filter by category and add items to a cart.",
      inputSchema: z.object({
        category: categorySchema,
      }),
      outputSchema: z.object({
        restaurant: z.object({
          name: z.string(),
          tagline: z.string(),
        }),
        category: categorySchema,
        items: z.array(menuItemSchema),
      }),
      _meta: { ui: { resourceUri } },
    },
    async ({ category }): Promise<CallToolResult> => {
      const items = filterMenu(category as MenuCategory | undefined);
      const payload = {
        restaurant: {
          name: RESTAURANT_NAME,
          tagline: RESTAURANT_TAGLINE,
        },
        category: category ?? null,
        items,
      };

      return {
        content: [
          {
            type: "text",
            text: `${RESTAURANT_NAME} — ${RESTAURANT_TAGLINE}\n\n${formatMenuText(items)}`,
          },
        ],
        structuredContent: payload,
      };
    },
  );

  registerAppTool(
    server,
    "place-order",
    {
      title: "Place Order",
      description:
        "Submit a cart of menu items and receive an order summary with subtotal, tax, and total.",
      inputSchema: z.object({
        items: z
          .array(
            z.object({
              id: z.string().describe("Menu item ID"),
              quantity: z
                .number()
                .int()
                .min(1)
                .describe("Quantity to order"),
            }),
          )
          .min(1)
          .describe("Line items in the cart"),
      }),
      outputSchema: z.object({
        orderId: z.string(),
        summary: z.object({
          lines: z.array(
            z.object({
              item: menuItemSchema,
              quantity: z.number(),
              lineTotal: z.number(),
            }),
          ),
          subtotal: z.number(),
          tax: z.number(),
          total: z.number(),
        }),
      }),
      _meta: { ui: { resourceUri } },
    },
    async ({ items }): Promise<CallToolResult> => {
      const unknownIds = items
        .map((line) => line.id)
        .filter((id) => !MENU_ITEMS.some((item) => item.id === id));

      if (unknownIds.length > 0) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Unknown menu item IDs: ${unknownIds.join(", ")}`,
            },
          ],
        };
      }

      const summary = buildOrderSummary(items);
      if (summary.lines.length === 0) {
        return {
          isError: true,
          content: [{ type: "text", text: "Cart is empty." }],
        };
      }

      const orderId = `HK-${Date.now().toString(36).toUpperCase()}`;
      const payload = { orderId, summary };

      return {
        content: [
          {
            type: "text",
            text: `Order ${orderId} confirmed.\n\n${formatOrderText(summary)}`,
          },
        ],
        structuredContent: payload,
      };
    },
  );

  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "mcp-app.html"),
        "utf-8",
      );

      return {
        contents: [
          {
            uri: resourceUri,
            mimeType: RESOURCE_MIME_TYPE,
            text: html,
          },
        ],
      };
    },
  );

  return server;
}
