// src/components/chat/model-response-display.tsx
import { useState, useEffect, useRef } from 'react';
import type { RankedResponseItem } from '@/lib/types';
import { Volume2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

interface ModelResponseDisplayProps {
  response: RankedResponseItem;
}

export function ModelResponseDisplay({ response }: ModelResponseDisplayProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { toast } = useToast();
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
        if (utteranceRef.current && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (!response || !response.responseText) return;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast({
        title: "Speech Not Supported",
        description: "Your browser does not support text-to-speech.",
        variant: "destructive",
      });
      return;
    }

    if (isSpeaking && utteranceRef.current) {
      window.speechSynthesis.cancel();
    } else {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(response.responseText);
      utteranceRef.current = utterance;

      utterance.lang = 'en-US'; // Default to en-US

      const baseLang = utterance.lang.split('-')[0];
      const voicesForLang = availableVoices.filter(voice => voice.lang.startsWith(baseLang));
      
      if (voicesForLang.length > 0) {
        const exactMatchVoice = voicesForLang.find(voice => voice.lang === utterance.lang);
        utterance.voice = exactMatchVoice || voicesForLang[0];
      } else if (availableVoices.length > 0 && !voicesForLang.find(v => v.default)) {
        // Fallback to browser's default voice if specific language voice not found
        const defaultVoice = availableVoices.find(v => v.default);
        if (defaultVoice) utterance.voice = defaultVoice;
      }


      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null;
        }
      };
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        if (event.error !== 'interrupted') {
          console.error("Speech synthesis error:", event.error, event);
          toast({
            title: "Speech Error",
            description: `Could not play audio: ${event.error || "Unknown error."}. Ensure voices for the selected language are installed in your system/browser.`,
            variant: "destructive",
          });
        }
        // For "interrupted" errors, we still need to update state
        setIsSpeaking(false);
        if (utteranceRef.current === utterance) {
          utteranceRef.current = null;
        }
      };
      window.speechSynthesis.speak(utterance);
    }
  };
  
  if (!response) {
    return <p className="text-muted-foreground">No model response to display.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <p className="text-sm whitespace-pre-wrap flex-grow">{response.responseText}</p>
        {response.responseText && typeof window !== 'undefined' && ('speechSynthesis' in window) && (
          <div className="flex items-center shrink-0">
            <Button 
              onClick={handleToggleSpeech} 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-accent w-8 h-8 p-1.5"
              aria-label={isSpeaking ? "Stop speaking" : "Read aloud"}
            >
              {isSpeaking ? <XCircle className="h-full w-full" /> : <Volume2 className="h-full w-full" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
