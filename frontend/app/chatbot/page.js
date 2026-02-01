'use client';

import { ChatbotProvider } from '@/context/ChatbotContext';
import ChatbotContainer from '@/components/chatbot/ChatbotContainer';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

export default function ChatbotPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <ChatbotProvider>
          <ChatbotContainer />
        </ChatbotProvider>
      </main>
      <Footer />
    </div>
  );
}
