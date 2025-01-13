import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { findAllChatsByUserId } from "@/lib/db"
import ChatSidebar from "@/components/ChatSidebar"
import PDFVIewer from "@/components/PDFViewer"
import ChatComponent from "@/components/ChtComponent"



type Props = {
    params: {
        chatId: string
    }
}


const ChatPage = async ({params}: Props) => {

    const {chatId} = await params; //console error saying I should wait for it

    const {userId} = await auth();

    if (!userId) {
        return redirect('/sign-in')
    }

    const _chats = await findAllChatsByUserId(userId);

    if (!_chats) {
        return redirect('/')
    }

    if (!_chats.find(chat => chat.id === parseInt(chatId))) {
        return redirect('/')

    }

    const currentChat = _chats.find(chat => chat.id === parseInt(chatId));
    return (
        <div className="flex max-h-screen overflow-scroll">
            <div className="flex w-full max-h screen overflow-scroll">
                {/*Chat sidebar */}
                <div className="flex=[1] max-w-xs">
                    <ChatSidebar chats={_chats} chatId={parseInt(chatId)} />
                </div>
                
                
                {/*pdf viewer */}
                <div className="max-h-screen p-4 overflow-scroll flex-[5]">
                    <PDFVIewer pdf_url={currentChat?.pdfUrl || ''}/>
                </div>

                {/**chat component */}
                <div className="flex-[3] border-1-4 border-1-slate-100">
                    <ChatComponent chatId={parseInt(chatId)}/>
                </div>

            </div>
        </div>
    )


}
export default ChatPage;