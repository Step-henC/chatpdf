//lib folder made by shadcn automatically
//this is for Drizzle ORM
// Prisma at time of this was not compatible for Vercel Edge Servers

"use server";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle, } from "drizzle-orm/neon-http";
import { chats } from "./schema";
import {eq} from 'drizzle-orm'
import { getS3Url } from "../s3";

neonConfig.fetchConnectionCache = true;

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
