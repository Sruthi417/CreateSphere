import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import ChatbotLauncher from '@/components/chatbot/ChatbotLauncher'
import AuthProvider from '@/components/AuthProvider'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata = {
  title: 'CraftSphere - Creative DIY Marketplace',
  description: 'Discover unique handmade creations, connect with talented artisans, and unleash your creativity.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster position="top-right" richColors closeButton />
          <ChatbotLauncher />
        </ThemeProvider>
      </body>
    </html>
  )
}
