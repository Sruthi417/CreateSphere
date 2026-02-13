import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import ChatbotLauncher from '@/components/chatbot/ChatbotLauncher'
import AuthProvider from '@/components/AuthProvider'

export const metadata = {
  title: 'CraftSphere - Creative DIY Marketplace',
  description: 'Discover unique handmade creations, connect with talented artisans, and unleash your creativity.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <ChatbotLauncher />
      </body>
    </html>
  )
}
