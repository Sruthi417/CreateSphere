'use client';

import Navbar from '@/components/navbar';
import ConversationList from '@/components/chat/ConversationList';

export default function ChatLayout({ children }) {
    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                {/* Desktop Sidebar - Hidden on mobile */}
                <div className="hidden md:flex h-full border-r">
                    <ConversationList />
                </div>

                {/* Main Content */}
                <main className="flex-1 h-full overflow-hidden flex flex-col">
                    {children}
                </main>
            </div>
        </div>
    );
}
