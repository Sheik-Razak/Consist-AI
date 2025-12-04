// src/components/chat/chat-interface.tsx
'use client';

import { useState, useEffect } from 'react';
import type { Message, UserMessagePayload } from '@/lib/types';
import { getRankedResponsesAction } from '@/app/actions'; // Updated import path
import { ChatMessagesList } from './chat-messages-list';
import { ChatInputArea } from './chat-input-area';
import { useToast } from "@/hooks/use-toast";
import { LeftSidebar } from '@/components/layout/left-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const createInitialWelcomeMessage = (): Message => ({
  id: `welcome-${Date.now()}`, 
  role: 'assistant',
  type: 'text',
  content: "Hi there! I'm Consist-AI. How can I help you today? You can also send images!",
  timestamp: new Date(), 
});

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([createInitialWelcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSendMessage = async (payload: { text: string; imageFile?: File }, inputLanguage: string) => {
    let userMessageContent: string | UserMessagePayload = payload.text;
    let imageDataUri: string | undefined = undefined;

    if (payload.imageFile) {
      try {
        imageDataUri = await fileToDataUri(payload.imageFile);
        userMessageContent = { text: payload.text, imageDataUri };
      } catch (error) {
        console.error("Error converting image to data URI:", error);
        toast({
          title: "Image Upload Error",
          description: "Could not process the image. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }
    
    if (typeof userMessageContent === 'string' && !userMessageContent.trim()) {
        if (!imageDataUri) { 
            toast({
                title: "Empty message",
                description: "Please type a message or select an image.",
            });
            return;
        }
        userMessageContent = { text: '', imageDataUri };
    } else if (typeof userMessageContent === 'object' && !userMessageContent.text && !userMessageContent.imageDataUri) {
        toast({
            title: "Empty message",
            description: "Please type a message or select an image.",
        });
        return;
    }

    const newUserMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      type: 'text', 
      content: userMessageContent,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setIsLoading(true);

    try {
      const topRankedResponse = await getRankedResponsesAction(userMessageContent, messages, inputLanguage); 
      
      if (topRankedResponse) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          type: 'single_model_response',
          content: topRankedResponse,
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } else {
        const noResponseMessage: Message = {
          id: `info-${Date.now()}`,
          role: 'assistant',
          type: 'text',
          content: "I couldn't find a suitable model response for your query at this time.",
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, noResponseMessage]);
        toast({
          title: "No Response",
          description: "No suitable model response could be determined.",
        });
      }

    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessageContent = error instanceof Error ? error.message : "An unexpected error occurred while processing your request.";
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        type: 'error',
        content: errorMessageContent,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      toast({
        title: "AI Error",
        description: errorMessageContent,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNewChat = () => {
    setMessages([createInitialWelcomeMessage()]);
    toast({
        title: "New Chat Started",
        description: "Previous messages cleared.",
    });
  };

  const handleClearHistory = () => {
    setMessages([createInitialWelcomeMessage()]);
    toast({
        title: "Chat History Cleared",
        description: "Your conversation has been cleared.",
    });
  };


  const sidebarProps = {
    onNewChat: () => {
      handleNewChat();
      if (isMobile) setMobileSidebarOpen(false);
    },
    onClearHistory: () => {
      handleClearHistory();
      if (isMobile) setMobileSidebarOpen(false);
    }
  };

  if (isMobile === undefined) {
    return null; 
  }

  if (isMobile) {
    return (
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <div className="flex h-screen bg-muted">
          <SheetContent side="left" className="p-0 w-[280px] sm:w-[300px]">
             <SheetHeader className="sr-only">
              <SheetTitle>Main Menu</SheetTitle>
            </SheetHeader>
            <LeftSidebar {...sidebarProps} />
          </SheetContent>

          <main className="flex-grow flex flex-col bg-background"> 
            <div className="p-2 border-b bg-background flex items-center gap-2 sticky top-0 z-10">
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open sidebar</span>
                </Button>
              </SheetTrigger>
              <span className="text-lg font-semibold text-foreground">Consist-AI</span>
            </div>
            <ChatMessagesList messages={messages} isLoading={isLoading} />
            <ChatInputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
          </main>
        </div>
      </Sheet>
    );
  }

  // Desktop Layout
  return (
    <div className="flex h-screen bg-muted">
      <LeftSidebar {...sidebarProps} />
      <main className="flex-grow flex flex-col bg-background"> 
        <ChatMessagesList messages={messages} isLoading={isLoading} />
        <ChatInputArea onSendMessage={handleSendMessage} isLoading={isLoading} />
      </main>
    </div>
  );
}
