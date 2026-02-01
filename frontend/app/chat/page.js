'use client';

import ConversationList from '@/components/chat/ConversationList';
import { MessageCircle } from 'lucide-react';

export default function ChatIndexPage() {
  return (
    <>
      {/* Mobile: Show Conversation List */}
      <div className="md:hidden h-full">
        <ConversationList />
      </div>

      {/* Desktop: Show Placeholder */}
      <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
        <div className="bg-muted/50 p-6 rounded-full mb-4">
          <MessageCircle className="h-12 w-12" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Your Messages</h3>
        <p className="max-w-sm">
          Select a conversation from the left to start chatting with creators and other users.
        </p>
      </div>
    </>
  );
}
