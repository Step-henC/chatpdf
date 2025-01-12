"use client"
import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { useChat } from 'ai/react' //must use "use client" at top of component for this import
import MessageComponent from "./MessageComponent";


export default function ChatComponent(){
    const {input, handleInputChange, handleSubmit, messages} = useChat()
    
    return (
    <div className="relative max-h-screen overflow-scroll">
        <div className="sticky top-o inset-x-0 p-2 bg-white h-fit">
            <h3 className="text-xl font-bold">Chat</h3>
        </div>
        
        <MessageComponent messages={messages} />
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