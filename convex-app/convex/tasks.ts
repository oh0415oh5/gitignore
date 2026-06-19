import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { getCurrentUser } from "./lib/auth";

const taskValidator = v.object({
  _id: v.id("tasks"),
  _creationTime: v.number(),
  userId: v.id("users"),
  title: v.string(),
  completed: v.boolean(),
  createdAt: v.number(),
});

export const list = query({
  args: {},
  returns: v.array(taskValidator),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { taskId: v.id("tasks") },
  returns: taskValidator,
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const task = await ctx.db.get("tasks", args.taskId);

    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    return task;
  },
});

export const create = mutation({
  args: { title: v.string() },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    return await ctx.db.insert("tasks", {
      userId: user._id,
      title: args.title,
      completed: false,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    completed: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const task = await ctx.db.get("tasks", args.taskId);

    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const updates: Partial<Pick<Doc<"tasks">, "title" | "completed">> = {};
    if (args.title !== undefined) {
      updates.title = args.title;
    }
    if (args.completed !== undefined) {
      updates.completed = args.completed;
    }

    await ctx.db.patch("tasks", args.taskId, updates);
    return null;
  },
});

export const remove = mutation({
  args: { taskId: v.id("tasks") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const task = await ctx.db.get("tasks", args.taskId);

    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete("tasks", args.taskId);
    return null;
  },
});
