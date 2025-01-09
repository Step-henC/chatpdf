// tell drizzle where our schema file is located

import type {Config} from 'drizzle-kit'
import * as dotenv from 'dotenv' //files outside of src do not have access to process.env variables
dotenv.config({path: '.env'}) //need dotenv helper lib to access env variables outside of src

export default {
    dialect: "postgresql",
    schema: './src/lib/db/schema.ts',
    dbCredentials: {
        url: process.env.DATABASE_URL || "",
        

    }
} satisfies Config

// npx drizzle-kit push

// command above looks at schema and ensures db is synced

//npx drizzle-kit studio 
// opens browser UI for db