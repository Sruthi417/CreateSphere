'use client';

import MessageThread from '@/components/chat/MessageThread';

export default function ChatThreadPage({ params }) {
  const { conversationId } = params;

  return (
    <div className="h-full">
      <MessageThread conversationId={conversationId} />
    </div>
  );
}
