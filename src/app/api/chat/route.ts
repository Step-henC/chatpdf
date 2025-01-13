

import { NextResponse } from 'next/server'
import {streamText} from 'ai'
import {createOpenAI} from '@ai-sdk/openai'

const runtime = 'edge'




const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!
})


export async function POST(req: Request, res: Response) {

    try {

        const {messages} = await req.json();
        const stream = streamText({
            model: openai('gpt-3.5-turbo'),
            messages: messages,
        })

        return stream.toDataStreamResponse();
    } catch (e) {
        console.log(e)
        return NextResponse.json({error: 'cannot post a chat message'}, {status: 500})
    }
}