import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, getCurrentUserOrNull } from "./lib/auth";
import { authedQuery } from "./lib/customFunctions";

const userValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  tokenIdentifier: v.string(),
  name: v.string(),
  email: v.string(),
  pictureUrl: v.optional(v.string()),
  role: v.union(v.literal("user"), v.literal("admin")),
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
});

export const storeUser = mutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (existingUser) {
      await ctx.db.patch("users", existingUser._id, {
        updatedAt: Date.now(),
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name: identity.name ?? "Anonymous",
      email: identity.email ?? "",
      pictureUrl: identity.pictureUrl,
      role: "user",
      createdAt: Date.now(),
    });
  },
});

export const getCurrent = authedQuery({
  args: {},
  returns: userValidator,
  handler: async (ctx) => {
    return ctx.user;
  },
});

export const getViewer = query({
  args: {},
  returns: v.union(userValidator, v.null()),
  handler: async (ctx) => {
    return await getCurrentUserOrNull(ctx);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (args.name.length < 2) {
      throw new Error("Name must be at least 2 characters");
    }

    if (args.name.length > 100) {
      throw new Error("Name must be less than 100 characters");
    }

    await ctx.db.patch("users", user._id, {
      name: args.name,
      updatedAt: Date.now(),
    });

    return null;
  },
});
