//lib folder made by shadcn automatically
//this is for Drizzle ORM
// Prisma at time of this was not compatible for Vercel Edge Servers

"use server";
import { neon } from "@neondatabase/serverless";
import { drizzle, } from "drizzle-orm/neon-http";
import { chats, messages, userSystemEnum} from "./schema";
import {eq} from 'drizzle-orm'
import { getS3Url } from "../s3";



if (!process.env.DATABASE_URL) {
    throw new Error("database url not found")
}

const sql = neon(process.env.DATABASE_URL);

const db = drizzle(sql)

export async function findAllChatsByUserId(userId: string) {
    return await db.select().from(chats).where(eq(chats.userId, userId))
}

export async function addOneChatToChats(file_key: string,
    pdfName: string,
    userId: string,
) {
    return await drizzle(neon(process.env.DATABASE_URL!)).insert(chats).values({
            fileKey: file_key,
            pdfName: pdfName,
            pdfUrl: getS3Url(file_key),
            userId,
        }).returning({
            insertedId: chats.id
        })
}

export async function getChatsByChatId(chatId: number) {
    return await db.select().from(chats).where(eq(chats.id, chatId))
}

export async function insertStreamIntoMessages(chatId: number, content: string, role: any = 'user') {
    return await db.insert(messages).values({ 
        chatId,
        content,
        role
    });
}

export async function getMessagesByChatId(chatId: any) {
    return await db.select().from(messages).where(eq(chatId, messages.chatId))
}