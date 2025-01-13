import {  pgTable, serial, text, timestamp, varchar, integer, pgEnum } from "drizzle-orm/pg-core"


export const userSystemEnum = pgEnum('user_system_enum', ['system', 'user']) //system message sent by chatgpt user is user message
export const chats = pgTable("chats", {
    id: serial('id').primaryKey(),
    pdfName: text('pdf_name').notNull(),
    pdfUrl: text('pdf_url').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    userId: varchar('user_id', {length: 256}).notNull(),
    fileKey: text('file_key').notNull() //retrieve file in S3
})

export type DrizzleChat = typeof chats.$inferSelect; //derive a type Chat
export type DrizzleMessage = typeof messages.$inferSelect //derive message chat

export const messages = pgTable("messages", {
    id: serial('id').notNull(),
    chatId: integer('chat_id').references(() => chats.id).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    role: userSystemEnum('role').notNull(),

})

//drizzle kit is library that allows migrations and syncs data to db