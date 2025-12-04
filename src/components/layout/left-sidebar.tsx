// src/components/layout/left-sidebar.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Bot, Eraser, List, Home } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface LeftSidebarProps {
  onNewChat: () => void;
  onClearHistory: () => void;
}

// Static list of all available models in the system for display
const ALL_SYSTEM_MODELS = [
  { displayName: "Deepseek" },
  { displayName: "Qwen" },
  { displayName: "Gemma" },
  { displayName: "Llama" },
];

export function LeftSidebar({ onNewChat, onClearHistory }: LeftSidebarProps) {
  return (
    <div className="w-64 bg-muted p-5 flex flex-col space-y-4 border-r">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-accent" />
          <span className="text-xl font-bold text-foreground">Consist-AI</span>
        </div>
        <ThemeToggle />
      </div>
      <Link href="/" passHref>
        <Button
          variant="outline"
          className="w-full text-foreground hover:bg-accent/10 py-2 rounded-lg text-sm"
        >
          <Home className="mr-2 h-5 w-5" />
          Back to Home
        </Button>
      </Link>
      <Button
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg text-base"
        onClick={onNewChat}
      >
        New Chat
      </Button>
      <Button
        variant="secondary"
        className="w-full text-secondary-foreground hover:bg-secondary/90 py-2 rounded-lg text-sm"
        onClick={onClearHistory}
      >
        <Eraser className="mr-2 h-5 w-5" />
        Clear History
      </Button>

      <div className="mt-2 pt-3 border-t border-border/50">
        <h3 className="text-sm font-semibold text-foreground/80 mb-2 px-1 flex items-center">
          <List className="mr-2 h-5 w-5" />
          Models:
        </h3>
        <ul className="space-y-1.5">
          {ALL_SYSTEM_MODELS.map((model, index) => (
            <li
              key={`available-${index}-${model.displayName}`}
              className="text-xs text-muted-foreground bg-card p-2 rounded-md shadow-sm border border-border hover:bg-accent/5 transition-colors"
            >
              {model.displayName}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
