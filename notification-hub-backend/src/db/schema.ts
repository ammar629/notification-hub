// src/db/schema.ts
import { pgTable, serial, varchar, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  is_admin: boolean("is_admin").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  topic_id: integer("topic_id").references(() => topics.id),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  topic_id: integer("topic_id").references(() => topics.id),
  content: text("content").notNull(),
  created_by: integer("created_by").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow(),
});