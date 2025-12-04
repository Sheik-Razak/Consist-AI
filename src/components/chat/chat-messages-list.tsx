// src/components/chat/chat-messages-list.tsx
import type { Message } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessageItem } from './chat-message-item';
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';

interface ChatMessagesListProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessagesList({ messages, isLoading }: ChatMessagesListProps) {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);
  
  return (
    <ScrollArea className="flex-grow p-4 bg-background" ref={scrollAreaRef}> {/* Ensure chat area background is distinct */}
      <div className="space-y-1"> {/* Removed max-w-4xl mx-auto */}
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} />
        ))}
        {isLoading && (
          <div className="flex justify-start items-center gap-3 my-4 mx-2">
             <Avatar className="h-10 w-10 border border-border">
              <AvatarFallback className="bg-accent/10 text-accent">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-card text-card-foreground p-3 rounded-xl shadow-md">
              <p className="text-sm animate-pulse">Assistant is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
