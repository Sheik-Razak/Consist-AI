
import Link from 'next/link';
// import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MessageSquare, Brain, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <main className="max-w-3xl w-full space-y-12 text-center">
        <div className="space-y-4">
          <MessageSquare className="mx-auto h-16 w-16 text-primary" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Welcome to <span className="text-primary">Consist-AI</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            Your intelligent assistant designed to provide consistent, accurate, and helpful responses. Engage in meaningful conversations and get the information you need, powered by advanced AI.
          </p>
        </div>

        <div className="relative w-full max-w-xl mx-auto h-64 sm:h-80 md:h-96 rounded-xl shadow-2xl overflow-hidden border border-border">
          <a href="https://ibb.co/rRjF0Bv4"><img src="https://i.ibb.co/NdvtC07Z/aaa.png" alt="aaa" border="0" /></a>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>

        <div>
          <Link href="/chat" passHref>
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 px-8 rounded-lg shadow-lg transform transition-transform hover:scale-105">
              Start Chatting Now
            </Button>
          </Link>
        </div>

        <div className="pt-10">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Why Consist-AI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-card rounded-xl shadow-lg border border-border">
              <Brain className="h-10 w-10 text-accent mb-3" />
              <h3 className="text-lg font-medium text-card-foreground mb-1">Intelligent Responses</h3>
              <p className="text-sm text-muted-foreground">Context-aware and insightful answers.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-xl shadow-lg border border-border">
              <Zap className="h-10 w-10 text-accent mb-3" />
              <h3 className="text-lg font-medium text-card-foreground mb-1">Fast & Efficient</h3>
              <p className="text-sm text-muted-foreground">Quickly get the information you need.</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-card rounded-xl shadow-lg border border-border">
              <MessageSquare className="h-10 w-10 text-accent mb-3" />
              <h3 className="text-lg font-medium text-card-foreground mb-1">Versatile Communication</h3>
              <p className="text-sm text-muted-foreground">Supports text and image inputs.</p>
            </div>
          </div>
        </div>
      </main>
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Consist-AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
