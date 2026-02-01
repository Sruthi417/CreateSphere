'use client';

import { use } from 'react';
import MessageThread from '@/components/chat/MessageThread';

export default function ChatThreadPage({ params }) {
  const resolvedParams = use(params);

  return (
    <div className="h-full">
      <MessageThread conversationId={resolvedParams.conversationId} />
    </div>
  );
}
