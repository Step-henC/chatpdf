import { loadS3IntoPinecone } from "@/lib/pinecone";
import { NextResponse } from "next/server"
import {auth} from '@clerk/nextjs/server'

import { addOneChatToChats } from "@/lib/db";
// need @tanstack/react-query to send file_key to backend when we upload to S3
//local to server queries
export async function POST(req: Request, res: Response){
    const {userId} = await auth();
    if (!userId) {
        return NextResponse.json({error: "unauthorized"}, {status: 401})
    }
    try {
    const body = await req.json()
    const {file_key, file_name} = body;
    await loadS3IntoPinecone(file_key);
    
    const chat_id = await addOneChatToChats(file_key, file_name, userId)

    return NextResponse.json({
        chat_id: chat_id[0].insertedId
    }, {status: 200})

} catch (e) {
    console.log(e)
    return NextResponse.json({error: "internal server error"}, {status: 500})
}
}