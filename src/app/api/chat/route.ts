

import { NextResponse } from 'next/server'
import {Message, streamText} from 'ai'
import {createOpenAI} from '@ai-sdk/openai'
import { getContext } from '@/lib/context'
import { getChatsByChatId } from '@/lib/db'

const runtime = 'edge'




const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY!
})


export async function POST(req: Request, res: Response) {

    try {

        const {messages, chatId} = await req.json();
        const lastMessage = messages[messages.length - 1];
        const _chats = await getChatsByChatId(chatId)
        if (_chats.length != 1) {
            return NextResponse.json({error: 'chat not found'}, {status: 404})
        }
        const context = await getContext(lastMessage?.content, _chats[0].fileKey);

        const prompt = {
            content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
            The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
            AI is a well-behaved and well-mannered individual.
            AI is always friendly, kind, and inspiring and he is eager to provide vivid and thoughtful responses to the uers.
            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in the world.
            START CONTEXT BLOCK
            ${context}
            END OF CONTEXT BLOCK
            AI assitant will take into account any CONTEXT BLOCK that is provided in a conversation.
            If the context does not provide the answer to the question, the AI assistant will say, "I'm sorry, but I don't know the answer".
            AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
            AI assistant will not invent anything that is not drawn directly from the context.
            `
        }
        const stream = streamText({
            model: openai('gpt-3.5-turbo'),
            //messages: [prompt, ...messages.filter((message: Message) => message.role === 'user')],
            // we can add prompt to messages as well, but best to separate prompt and message
            // https://github.com/vercel/ai/discussions/1869#discussioncomment-9692162
            messages: [...messages.filter((message: Message) => message.role === 'user')],
            system: prompt.content,
           
        })

        return stream.toDataStreamResponse();
    } catch (e) {
        console.log(e)
        return NextResponse.json({error: 'cannot post a chat message'}, {status: 500})
    }
}