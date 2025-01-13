"use client"

import { useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useChat } from 'ai/react' //must use "use client" at top of component for this import
import MessageComponent from "./MessageComponent";
import { useQuery } from "@tanstack/react-query";

type Props = {
    chatId: number, //also file key for api sidew
}
export default function ChatComponent({chatId} : Props){

    const {data, isLoading} = useQuery({
        queryKey: ['chat', chatId],
        queryFn: async () => {
            const response = await fetch('/api/get-messages', {
                method: "POST",
                body: JSON.stringify({chatId}),
            })
            return response.json()
        }
    })
    const {input, handleInputChange, handleSubmit, messages} = useChat({
        api: '/api/chat',
        body: {
            chatId
        },
        initialMessages: data || []
    })

    /**Scroll messages as they appear */
    useEffect(() => {
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [messages])
    return (
    <div className="relative max-h-screen overflow-scroll" id='message-container'>
        <div className="sticky top-o inset-x-0 p-2 bg-white h-fit">
            <h3 className="text-xl font-bold">Chat</h3>
        </div>
        
        <MessageComponent messages={messages} isLoading={isLoading}/>
        <form onSubmit={handleSubmit} className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white">
            <div className="flex">
            <Input 
            className="w-full"
            placeholder="ask any question..." 
            value={input} onChange={handleInputChange}/>
            <Button className="bg-blue-600 ml-2">
                <Send className="h-4 w-4" />
            </Button>
            </div>
        
        </form>
    </div>)
}