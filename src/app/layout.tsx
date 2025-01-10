import {ClerkProvider} from '@clerk/nextjs'
import './globals.css'
import { Metadata } from 'next'
import Provider from '@/components/Provider'
import {Toaster} from 'react-hot-toast'

//wrap data in provider so that every component has access to react-query server cache on subsequent api calls
export const metadata: Metadata = {
  title: "Chat PDF"
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <Provider>
      <html lang="en">
        <body>
          {children}
          <Toaster />
        </body>
      </html>
      </Provider>
    </ClerkProvider>
  )
}