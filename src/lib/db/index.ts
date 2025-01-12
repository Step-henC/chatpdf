//lib folder made by shadcn automatically
//this is for Drizzle ORM
// Prisma at time of this was not compatible for Vercel Edge Servers

// "use server";
// import { neon, neonConfig } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http";

// neonConfig.fetchConnectionCache = true;

// if (!process.env.DATABASE_URL) {
//     throw new Error("database url not found")
// }

// const sql = neon(process.env.DATABASE_URL);

//export const db = drizzle(sql)
// export async function getData() {
//     const sql = neon(process.env.DATABASE_URL!);
//     const data = await sql`...`;
//     return data;
// }
