import { getMessagesByChatId } from "@/lib/db"
import { NextResponse } from "next/server"


export const runtime = "edge"

export const POST = async (req: Request) => {

    const {chatId} = await req.json()
    const _messages = await getMessagesByChatId(chatId)

    return NextResponse.json(_messages)
}