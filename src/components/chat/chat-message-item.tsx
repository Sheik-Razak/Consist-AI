// src/components/chat/chat-message-item.tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Message, RankedResponseItem, UserMessagePayload } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Star } from 'lucide-react';
import { ModelResponseDisplay } from './model-response-display';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChatMessageItemProps {
  message: Message;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === 'user';
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    setDisplayTime(new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }));
  }, [message.timestamp]);

  const renderUserContent = () => {
    if (typeof message.content === 'object' && message.content && 'text' in message.content) {
      const userPayload = message.content as UserMessagePayload;
      return (
        <>
          {userPayload.imageDataUri && (
            <div className="mb-2 rounded-md overflow-hidden border border-primary/20" style={{ maxWidth: '200px', maxHeight: '200px' }}>
               <Image 
                src={userPayload.imageDataUri} 
                alt="User upload" 
                width={200} // Provide explicit width
                height={200} // Provide explicit height
                style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: '200px' }}
                data-ai-hint="user uploaded image"
              />
            </div>
          )}
          {userPayload.text && <p className="whitespace-pre-wrap">{userPayload.text}</p>}
        </>
      );
    }
    return <p className="whitespace-pre-wrap">{message.content as string}</p>;
  };

  return (
    <div className={cn("flex items-start gap-3 my-4 mx-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-10 w-10 border border-border">
          <AvatarFallback className="bg-accent/10 text-accent">
            <Bot className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-xl p-3 shadow-md text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground",
          message.type === 'error' && "bg-destructive text-destructive-foreground"
        )}
      >
        {isUser && renderUserContent()}
        {!isUser && message.type === 'text' && <p className="whitespace-pre-wrap">{message.content as string}</p>}
        {!isUser && message.type === 'single_model_response' && (
          <>
            <ModelResponseDisplay response={message.content as RankedResponseItem} />
            <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-border/20">
              <p className="text-xs text-muted-foreground/90">
                Model: {(message.content as RankedResponseItem).modelName}
              </p>
              <Badge 
                variant={(message.content as RankedResponseItem).accuracy > 0.7 ? "default" : "secondary"} 
                className="flex items-center gap-1 text-xs px-1.5 py-0.5"
              >
                <Star className="h-3 w-3" />
                {((message.content as RankedResponseItem).accuracy * 100).toFixed(0)}%
              </Badge>
            </div>
          </>
        )}
        {!isUser && message.type === 'error' && <p className="whitespace-pre-wrap">{message.content as string}</p>}
        
        {displayTime && (
          <p className={cn(
            "text-xs mt-1.5", 
            isUser ? "text-primary-foreground/80 text-right" : (message.type === 'error' ? "text-destructive-foreground/80" : "text-muted-foreground/90 text-left")
          )}>
            {displayTime}
          </p>
        )}
      </div>
      {isUser && (
         <Avatar className="h-10 w-10 border border-border"> 
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
