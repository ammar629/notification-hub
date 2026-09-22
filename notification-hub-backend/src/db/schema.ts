import { pgTable, serial, varchar, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations, InferSelectModel, InferInsertModel } from "drizzle-orm";

// ==========================================
// TABLE DEFINITIONS
// ==========================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  topicId: integer("topic_id").references(() => topics.id, { onDelete: "cascade" }).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").references(() => topics.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ==========================================
// RELATIONS DEFINITIONS
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  subscriptions: many(subscriptions),
  messages: many(messages),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  subscriptions: many(subscriptions),
  messages: many(messages),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  topic: one(topics, {
    fields: [subscriptions.topicId],
    references: [topics.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  topic: one(topics, {
    fields: [messages.topicId],
    references: [topics.id],
  }),
  author: one(users, {
    fields: [messages.createdBy],
    references: [users.id],
  }),
}));

// ==========================================
// INFERRED TYPES (EXPLICIT TYPESCRIPT)
// ==========================================

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Topic = InferSelectModel<typeof topics>;
export type NewTopic = InferInsertModel<typeof topics>;

export type Subscription = InferSelectModel<typeof subscriptions>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;

export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;